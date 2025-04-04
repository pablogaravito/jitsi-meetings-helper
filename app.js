document.addEventListener("DOMContentLoaded", function () {
  // Initialize Flatpickr (date picker)
  const datePicker = flatpickr("#date-picker", {
    dateFormat: "d/m/Y", // dd/mm/yyyy format
    defaultDate: "today", // Show today's date by default
    locale: {
      firstDayOfWeek: 1, // Monday as first day (optional)
    },
  });

  // Time Picker Logic
  const hourPicker = document.getElementById("hour-picker");
  const minutePicker = document.getElementById("minute-picker");
  const ampmPicker = document.getElementById("ampm-picker");
  const customMinutesInput = document.getElementById("custom-minutes");
  const guestLink = document.getElementById("guest-link");
  const moderatorLink = document.getElementById("moderator-link");

  // Default time (e.g., 8:00 PM)
  hourPicker.value = "08";
  minutePicker.value = "00";
  ampmPicker.value = "p.m.";

  minutePicker.addEventListener("change", function () {
    if (this.value === "custom") {
      customMinutesInput.style.display = "inline-block";
      customMinutesInput.focus();
    } else {
      customMinutesInput.style.display = "none";
      customMinutesInput.value = ""; // Reset custom input if not used
    }
  });

  document
    .getElementById("generate-button")
    .addEventListener("click", function () {
      const guestInvitation = document.getElementById(
        "guests-meeting-invitation"
      );
      const meetingSummary = document.getElementById("meeting-summary");
      const selectedDate = datePicker.input.value; // dd/mm/yyyy

      let minutes =
        minutePicker.value === "custom"
          ? customMinutesInput.value
          : minutePicker.value;
      minutes = minutes.padStart(2, "0"); // Ensure two-digit format

      console.log(minutes);

      if (!selectedDate) {
        showAlert("Please select a date.");
        return;
      }

      //  validation for links
      if (
        !isValidJitsiLink(guestLink.value, "guestLink") ||
        !isValidJitsiLink(moderatorLink.value, "moderatorLink")
      ) {
        showAlert("Please insert valid Jitsi Meet links.");
        return;
      }

      const spanishDate = formatSpanishDate(selectedDate);

      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        showAlert("Please enter valid minutes (0-59).");
        return;
      }

      const selectedTime = `${hourPicker.value}:${minutes} ${ampmPicker.value}`;
      const simplifiedTime = simplifyTime(selectedTime);

      // Guest meeting invitation
      guestInvitation.value =
        `Pablo Garavito le está invitando a una reunión programada.\n\n` +
        `Tema: Cita ${simplifiedTime}\n` +
        `Hora: ${spanishDate} ${selectedTime}\n\n` +
        `Link de la reunión:\n` +
        `${guestLink.value}`;

      // Meeting Summary
      meetingSummary.value =
        `Cita ${spanishDate} ${selectedTime}\n\n` +
        `Invitación: ${guestLink.value}\n` +
        `moderator: ${moderatorLink.value}`;
    });

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const targetId = this.getAttribute("data-target");
      const textarea = document.getElementById(targetId);

      try {
        await navigator.clipboard.writeText(textarea.value);
        // Visual feedback
        this.textContent = "✅ Copied!";
        setTimeout(() => (this.textContent = "📋 Copy"), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
        this.textContent = "❌ Failed";
        setTimeout(() => (this.textContent = "📋 Copy"), 2000);
      }
    });
  });
});

function formatSpanishDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day); // Month is 0-indexed in JS

  // months in Spanish
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  // Remove zero-padding
  const formattedDay = day.toString().replace(/^0+/, "");
  const formattedMonth = months[date.getMonth()];
  return `${formattedDay} ${formattedMonth} ${year}`;
}

function simplifyTime(timeStr) {
  const normalized = timeStr
    .toLowerCase()
    .replace(/[\s.]+/g, "")
    .replace("p.m", "pm")
    .replace("a.m", "am");

  const [time, period] = normalized.split(/(am|pm)/);
  let [hours, minutes] = time.split(":");

  hours = hours.replace(/^0+/, ""); // "07" → "7"
  const hasMinutes = minutes && minutes !== "00";

  return `${hours}${hasMinutes ? "." + minutes : ""}${period}`;
}

function isValidJitsiLink(link, linkType) {
  // patterns for each link type
  const patterns = {
    guestLink: {
      regex: /^https:\/\/meet\.jit\.si\/moderated\/[a-f0-9]{64}$/i,
      description:
        "https://meet.jit.si/moderated/ followed by 64 hex characters",
    },
    moderatorLink: {
      regex: /^https:\/\/moderated\.jitsi\.net\/[a-f0-9]{64}$/i,
      description: "https://moderated.jitsi.net/ followed by 64 hex characters",
    },
  };

  if (!patterns[linkType]) {
    console.error(
      `Invalid link type specified. Use 'guestLink' or 'moderatorLink'.`
    );
    return false;
  }

  return patterns[linkType].regex.test(link);
}

function showAlert(msg) {
  const alertContainer = document.querySelector(".alert-container");
  alertContainer.textContent = msg;
  alertContainer.classList.remove("hidden");
  setTimeout(hideAlert, 1500);
}

function hideAlert() {
  const alertContainer = document.querySelector(".alert-container");
  alertContainer.textContent = "";
  alertContainer.classList.add("hidden");
}

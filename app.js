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
    .getElementById("create-meeting-btn")
    .addEventListener("click", function () {
      window.open("https://moderated.jitsi.net", "_blank");
      document.getElementById("main-form").classList.remove("hidden");
      this.classList.add("hidden");
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

      if (!selectedDate) {
        showAlert("Please select a date.");
        return;
      }

      const linksPasteArea = document.getElementById("links-paste-area");

      const pastedContent = linksPasteArea.value.trim();

      if (!pastedContent) {
        showAlert("Please paste the meeting page contents first");
        return;
      }

      const links = extractMeetingLinks(pastedContent);

      if (!links.moderator || !links.guest) {
        showAlert(
          "Could not find both meeting links. Please make sure you copied the entire page content."
        );
        return;
      }

      const spanishDate = formatSpanishDate(selectedDate);

      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        showAlert("Please enter valid minutes (0-59).");
        return;
      }

      const selectedTime = `${hourPicker.value}:${minutes} ${ampmPicker.value}`;

      // Guest meeting invitation
      guestInvitation.value = generateGuestInvitation(
        links.guest,
        selectedTime,
        spanishDate
      );

      // Meeting Summary
      meetingSummary.value = generateMeetingSummary(
        links.guest,
        links.moderator,
        selectedTime,
        selectedDate
      );

      const mainForm = document.getElementById("main-form");
      const dateTimeContainer = document.getElementById("datetime-container");
      const outputSection = document.getElementById("output-section");
      const newMeetingBtn = document.getElementById("new-meeting");

      mainForm.classList.add("hidden");
      dateTimeContainer.classList.add("hidden");
      outputSection.classList.remove("hidden");
      newMeetingBtn.classList.remove("hidden");
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

  document.getElementById("new-meeting").addEventListener("click", function () {
    document.getElementById("links-paste-area").value = "";
    document.getElementById("create-meeting-btn").classList.remove("hidden");
    document.getElementById("output-section").classList.add("hidden");
    this.classList.add("hidden");
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

function extractMeetingLinks(text) {
  const guestLinkRegex = /https:\/\/meet\.jit\.si\/moderated\/[a-f0-9]{64}/i;
  const moderatorLinkRegex = /https:\/\/moderated\.jitsi\.net\/[a-f0-9]{64}/i;

  const guestLink = text.match(guestLinkRegex)?.[0];
  const moderatorLink = text.match(moderatorLinkRegex)?.[0];

  if (!guestLink || !moderatorLink) {
    throw new Error("Could not find both meeting links in the pasted text");
  }

  return {
    guest: guestLink,
    moderator: moderatorLink,
  };
}

function generateGuestInvitation(guestLink, selectedTime, spanishDate) {
  const simplifiedTime = simplifyTime(selectedTime);
  return (
    `Pablo Garavito le está invitando a una reunión programada.\n\n` +
    `Tema: Cita ${simplifiedTime}\n` +
    `Hora: ${spanishDate} ${selectedTime}\n\n` +
    `Link de la reunión:\n` +
    `${guestLink}`
  );
}

function generateMeetingSummary(
  guestLink,
  moderatorLink,
  selectedTime,
  spanishDate
) {
  return (
    `Cita ${spanishDate} ${selectedTime}\n\n` +
    `Invitación: ${guestLink}\n\n` +
    `Moderator: ${moderatorLink}`
  );
}

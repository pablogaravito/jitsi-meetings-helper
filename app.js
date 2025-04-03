document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr (date picker)
    const datePicker = flatpickr("#date-picker", {
        dateFormat: "d/m/Y",          // dd/mm/yyyy format
        defaultDate: "today",         // Show today's date by default
        locale: {
            firstDayOfWeek: 1         // Monday as first day (optional)
        }
    });

    // Time Picker Logic
    const hourPicker = document.getElementById('hour-picker');
    const minutePicker = document.getElementById('minute-picker');
    const ampmPicker = document.getElementById('ampm-picker');
    const customMinutesInput = document.getElementById("custom-minutes");

    // Default time (e.g., 8:00 PM)
    hourPicker.value = '08';
    minutePicker.value = '00';
    ampmPicker.value = 'p.m.';    

    minutePicker.addEventListener('change', function () {       
        if (this.value === "custom") {
            customMinutesInput.style.display = 'inline-block';
            customMinutesInput.focus();
        } else {
            customMinutesInput.style.display = 'none';
            customMinutesInput.value = ''; // Reset custom input if not used
        }
    });   
    
    document.getElementById('generate-button').addEventListener('click', function() {

      const guestLink = document.getElementById('guest-link');
      const moderatorLink = document.getElementById('moderator-link');
      
        const guestInvitation = document.getElementById('guests-meeting-invitation');
        const meetingSummary = document.getElementById('meeting-summary');
        const selectedDate = datePicker.input.value; // dd/mm/yyyy
    
        let minutes = minutePicker.value === 'custom' ? customMinutesInput.value : minutePicker.value;
        minutes = minutes.padStart(2, "0"); // Ensure two-digit format
    
    if (!selectedDate) {
        document.getElementById("output").textContent = 'Please select a date.';
        return;
    }

    const spanishDate = formatSpanishDate(selectedDate);
    
    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        document.getElementById("output").textContent = "Please enter valid minutes (0-59).";
        return;
    }   
    
        const selectedTime = `${hourPicker.value}:${minutePicker.value} ${ampmPicker.value}`;
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

    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async function() {
          const targetId = this.getAttribute('data-target');
          const textarea = document.getElementById(targetId);
          
          try {
            await navigator.clipboard.writeText(textarea.value);
            // Visual feedback
            this.textContent = '✅ Copied!';
            setTimeout(() => this.textContent = '📋 Copy', 2000);
          } catch (err) {
            console.error("Copy failed:", err);
            this.textContent = '❌ Failed';
            setTimeout(() => this.textContent = '📋 Copy', 2000);
          }
        });
});
});

function formatSpanishDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed in JS
  
    // months in Spanish
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
  
    // Remove zero-padding 
    const formattedDay = day.toString().replace(/^0+/, '');
    const formattedMonth = months[date.getMonth()]; 
    return `${formattedDay} ${formattedMonth} ${year}`;
  }

  function simplifyTime(timeStr) {

    const normalized = timeStr.toLowerCase()
    .replace(/[\s.]+/g, '') 
    .replace('p.m', 'pm')
    .replace('a.m', 'am');
  
    const [time, period] = normalized.split(/(am|pm)/);
    let [hours, minutes] = time.split(':');
  
    hours = hours.replace(/^0+/, ''); // "07" → "7"
    const hasMinutes = minutes && minutes !== '00';

    return `${hours}${hasMinutes ? '.' + minutes : ''}${period}`;
  }





  
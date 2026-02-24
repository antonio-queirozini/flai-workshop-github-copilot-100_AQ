document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear and reset select dropdown to avoid duplicate options on refresh
      activitySelect.innerHTML = '<option value="">Select an activity</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build card using DOM methods to prevent XSS from server-provided values
        const h4 = document.createElement("h4");
        h4.textContent = name;

        const descP = document.createElement("p");
        descP.textContent = details.description;

        const scheduleP = document.createElement("p");
        const scheduleBold = document.createElement("strong");
        scheduleBold.textContent = "Schedule:";
        scheduleP.appendChild(scheduleBold);
        scheduleP.appendChild(document.createTextNode(" " + details.schedule));

        const availabilityP = document.createElement("p");
        const availabilityBold = document.createElement("strong");
        availabilityBold.textContent = "Availability:";
        availabilityP.appendChild(availabilityBold);
        availabilityP.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));

        activityCard.appendChild(h4);
        activityCard.appendChild(descP);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availabilityP);

        // Build participants section using DOM methods
        const participantsSection = document.createElement("div");
        if (details.participants && details.participants.length > 0) {
          participantsSection.className = "participants-section";
          const strong = document.createElement("strong");
          strong.textContent = "Participants:";
          participantsSection.appendChild(strong);

          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach(p => {
            const li = document.createElement("li");

            const span = document.createElement("span");
            span.textContent = p;
            li.appendChild(span);

            const button = document.createElement("button");
            button.className = "delete-icon";
            button.title = "Remove participant";
            button.style.cssText = "background: none; border: none; cursor: pointer; margin-left: 8px; padding: 0; display: flex; align-items: center;";
            button.setAttribute("data-activity", name);
            button.setAttribute("data-participant", p);
            // SVG is static/hardcoded — no user data injected here
            button.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><rect x="3" y="6" width="18" height="14" rx="2" fill="#fee2e2" stroke="#dc2626"/><line x1="8" y1="10" x2="8" y2="16" /><line x1="12" y1="10" x2="12" y2="16" /><line x1="16" y1="10" x2="16" y2="16" /><path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" stroke="#dc2626"/></svg>';
            li.appendChild(button);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          participantsSection.className = "participants-section empty";
          const em = document.createElement("em");
          em.textContent = "No participants yet.";
          participantsSection.appendChild(em);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete icons after all cards are in the DOM
      document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async function() {
          const activity = this.getAttribute('data-activity');
          const participant = this.getAttribute('data-participant');
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(participant)}`, {
              method: 'POST',
            });
            if (response.ok) {
              fetchActivities(); // Refresh list
            } else {
              const result = await response.json();
              alert(result.detail || 'Failed to unregister participant.');
            }
          } catch (error) {
            alert('Error unregistering participant.');
            console.error('Unregister error:', error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

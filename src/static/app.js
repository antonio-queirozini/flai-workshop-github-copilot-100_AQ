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

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        let participantsHTML = "";
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list" style="list-style-type: none; padding-left: 0;">
                ${details.participants.map(p => `
                  <li style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
                    <span>${p}</span>
                    <button class="delete-icon" title="Remove participant" style="background: none; border: none; cursor: pointer; margin-left: 8px; padding: 0; display: flex; align-items: center;" data-activity="${name}" data-participant="${p}">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                        <rect x="3" y="6" width="18" height="14" rx="2" fill="#fee2e2" stroke="#dc2626"/>
                        <line x1="8" y1="10" x2="8" y2="16" />
                        <line x1="12" y1="10" x2="12" y2="16" />
                        <line x1="16" y1="10" x2="16" y2="16" />
                        <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" stroke="#dc2626"/>
                      </svg>
                    </button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section empty">
              <em>No participants yet.</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

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

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

      // Clear loading message and previous dropdown options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const h4 = document.createElement("h4");
        h4.textContent = name;

        const descP = document.createElement("p");
        descP.textContent = details.description;

        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule: ";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(details.schedule));

        const availP = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability: ";
        availP.appendChild(availStrong);
        availP.appendChild(document.createTextNode(`${spotsLeft} spots left`));

        activityCard.appendChild(h4);
        activityCard.appendChild(descP);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availP);

        // Create participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        if (details.participants && details.participants.length > 0) {
          const strong = document.createElement("strong");
          strong.textContent = "Participants:";
          participantsSection.appendChild(strong);

          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach(p => {
            const li = document.createElement("li");

            const span = document.createElement("span");
            span.textContent = p;

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "22");
            svg.setAttribute("height", "22");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "#dc2626");
            svg.setAttribute("stroke-width", "2");
            svg.setAttribute("stroke-linecap", "round");
            svg.setAttribute("stroke-linejoin", "round");
            svg.style.display = "block";

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", "3"); rect.setAttribute("y", "6");
            rect.setAttribute("width", "18"); rect.setAttribute("height", "14");
            rect.setAttribute("rx", "2"); rect.setAttribute("fill", "#fee2e2");
            rect.setAttribute("stroke", "#dc2626");

            const line1 = document.createElementNS(svgNS, "line");
            line1.setAttribute("x1", "8"); line1.setAttribute("y1", "10");
            line1.setAttribute("x2", "8"); line1.setAttribute("y2", "16");

            const line2 = document.createElementNS(svgNS, "line");
            line2.setAttribute("x1", "12"); line2.setAttribute("y1", "10");
            line2.setAttribute("x2", "12"); line2.setAttribute("y2", "16");

            const line3 = document.createElementNS(svgNS, "line");
            line3.setAttribute("x1", "16"); line3.setAttribute("y1", "10");
            line3.setAttribute("x2", "16"); line3.setAttribute("y2", "16");

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", "M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2");
            path.setAttribute("stroke", "#dc2626");

            svg.appendChild(rect);
            svg.appendChild(line1);
            svg.appendChild(line2);
            svg.appendChild(line3);
            svg.appendChild(path);

            const btn = document.createElement("button");
            btn.className = "delete-icon";
            btn.title = "Remove participant";
            btn.style.cssText = "background: none; border: none; cursor: pointer; margin-left: 8px; padding: 0; display: flex; align-items: center;";
            btn.dataset.activity = name;
            btn.dataset.participant = p;
            btn.appendChild(svg);

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          participantsSection.classList.add("empty");
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

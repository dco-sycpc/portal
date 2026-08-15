fetch("data/notifications.json")
    .then(response => response.json())
    .then(data => {

        const container = document.getElementById("notificationsList");

        container.innerHTML = "";

        data.forEach(notification => {

            container.innerHTML += `
                <div class="notification-card">
                    <h3>${notification.status}</h3>

                    <p><strong>Document:</strong> ${notification.docNo}</p>

                    <p><strong>Project:</strong> ${notification.project}</p>

                    <p><strong>Assigned To:</strong> ${notification.assignedTo}</p>

                    <p><strong>Returned By:</strong> ${notification.returnedBy}</p>

                    <p><strong>Date:</strong> ${notification.date}</p>

                    <p><strong>Comments:</strong> ${notification.comments}</p>

                    <hr>
                </div>
            `;

        });

    })
    .catch(error => console.error(error));

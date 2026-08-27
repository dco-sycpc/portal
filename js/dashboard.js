const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if (currentUser) {
    document.getElementById("welcomeUser").textContent =
        `Welcome, ${currentUser.fullname}`;
}

const projectFiles = [
    "data/ortigas-project.json"
];

const projectNames = {
    "ortigas-project": "Ortigas Project"
};

// Make documents available to the whole dashboard
let allDocs = [];

async function loadDashboard() {

    console.log("Dashboard started");

    allDocs = [];

    for (const file of projectFiles) {

        console.log("Loading:", file);

        try {

            const response = await fetch(file);

            console.log(response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const docs = await response.json();

            console.log(file, docs.length);

            docs.forEach(d => {

                if (!d.project) {

                    const key = file
                        .replace("data/", "")
                        .replace(".json", "");

                    d.project = projectNames[key] || key;
                }

            });

            allDocs = allDocs.concat(docs);

        } catch (err) {

            console.error("Error loading:", file, err);

        }

    }

    console.log("Total Docs:", allDocs.length);

    // Sort newest first
    allDocs.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Display dashboard
    displayDocuments(allDocs.slice(0, 10));

    // Totals
    document.getElementById("totalProjects").textContent =
        projectFiles.length;

    document.getElementById("totalDocuments").textContent =
        allDocs.length;

    document.getElementById("submitted").textContent =
        allDocs.filter(d => d.status === "Submitted").length;

    document.getElementById("approved").textContent =
        allDocs.filter(d => d.status === "Approved").length;

    document.getElementById("approvedAsCorrected").textContent =
        allDocs.filter(
            d => d.status === "Approved As Corrected"
        ).length;

    document.getElementById("reviseResubmit").textContent =
        allDocs.filter(
            d => d.status === "Revise & Resubmit"
        ).length;

    document.getElementById("draft").textContent =
        allDocs.filter(d => d.status === "Draft").length;

    document.getElementById("cancelled").textContent =
        allDocs.filter(d => d.status === "Cancelled").length;

    document.getElementById("superseded").textContent =
        allDocs.filter(d => d.status === "Superseded").length;

    document.getElementById("dueThisWeek").textContent = 0;
    document.getElementById("overdue").textContent = 0;
}


// =========================
// Display Documents
// =========================

function displayDocuments(docs) {

    const tbody = document.getElementById("dashboardTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (docs.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No documents found.
                </td>
            </tr>
        `;

        return;
    }

    docs.forEach(doc => {

        const formattedDate = doc.date
            ? new Date(doc.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
            : "";

        tbody.innerHTML += `
            <tr>
                <td>${doc.docNo || ""}</td>
                <td>${doc.category || ""}</td>
                <td>${doc.project || ""}</td>
                <td>${doc.title || ""}</td>
                <td>${doc.status || ""}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
}


// =========================
// Search
// =========================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchTerm = this.value
            .trim()
            .toLowerCase();

        if (!searchTerm) {

            displayDocuments(allDocs.slice(0, 10));

            return;
        }

        const results = allDocs.filter(doc => {

            return (
                String(doc.docNo || "")
                    .toLowerCase()
                    .includes(searchTerm) ||

                String(doc.title || "")
                    .toLowerCase()
                    .includes(searchTerm) ||

                String(doc.project || "")
                    .toLowerCase()
                    .includes(searchTerm) ||

                String(doc.status || "")
                    .toLowerCase()
                    .includes(searchTerm) ||

                String(doc.trade || "")
                    .toLowerCase()
                    .includes(searchTerm) ||

                String(doc.category || "")
                    .toLowerCase()
                    .includes(searchTerm)
            );

        });

        console.log("Search:", searchTerm);
        console.log("Results:", results.length);

        displayDocuments(results);

    });
}


// =========================
// Start Dashboard
// =========================

loadDashboard();

```javascript
// ==========================================
// SYC DOCUMENT PORTAL
// REPORT MANAGEMENT
// ==========================================


// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const reportForm = document.getElementById("reportForm");
const clearButton = document.getElementById("clearButton");
const uploadStatus = document.getElementById("uploadStatus");
const reportTableBody = document.getElementById("reportTableBody");


// ------------------------------------------
// STORAGE KEY
// ------------------------------------------

const REPORT_STORAGE_KEY = "syc_reports";


// ------------------------------------------
// CURRENT USER
// ------------------------------------------

// Uses the logged-in username if available.
// Change this later if your existing auth.js
// uses another localStorage key.

let currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("currentUser") ||
    "Unknown User";


// ------------------------------------------
// LOAD REPORTS
// ------------------------------------------

function loadReports() {

    const storedReports =
        localStorage.getItem(REPORT_STORAGE_KEY);

    if (!storedReports) {

        renderReports([]);

        return;

    }

    try {

        const reports = JSON.parse(storedReports);

        renderReports(reports);

    } catch (error) {

        console.error(
            "Unable to load reports:",
            error
        );

        renderReports([]);

    }

}


// ------------------------------------------
// SAVE REPORTS
// ------------------------------------------

function saveReports(reports) {

    localStorage.setItem(
        REPORT_STORAGE_KEY,
        JSON.stringify(reports)
    );

}


// ------------------------------------------
// GENERATE REPORT ID
// ------------------------------------------

function generateReportId() {

    const storedReports =
        JSON.parse(
            localStorage.getItem(REPORT_STORAGE_KEY) || "[]"
        );

    const nextNumber =
        storedReports.length + 1;

    return "RPT-" +
        String(nextNumber).padStart(3, "0");

}


// ------------------------------------------
// FORMAT DATE
// ------------------------------------------

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }
    );

}


// ------------------------------------------
// SHOW STATUS
// ------------------------------------------

function showStatus(message, success = true) {

    uploadStatus.style.display = "block";

    uploadStatus.textContent = message;

    uploadStatus.style.background =
        success ? "#dcfce7" : "#fee2e2";

    uploadStatus.style.color =
        success ? "#166534" : "#991b1b";

}


// ------------------------------------------
// FORM SUBMIT
// ------------------------------------------

reportForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const fileInput =
            document.getElementById("reportFile");

        const file =
            fileInput.files[0];


        if (!file) {

            showStatus(
                "Please select a report file.",
                false
            );

            return;

        }


        // Get existing reports

        const reports =
            JSON.parse(
                localStorage.getItem(
                    REPORT_STORAGE_KEY
                ) || "[]"
            );


        // Generate ID

        const reportId =
            generateReportId();


        // Create report record

        const report = {

            id: reportId,

            reportNo:
                document.getElementById(
                    "reportNo"
                ).value.trim(),

            category:
                document.getElementById(
                    "category"
                ).value,

            title:
                document.getElementById(
                    "title"
                ).value.trim(),

            project:
                document.getElementById(
                    "project"
                ).value.trim(),

            period:
                document.getElementById(
                    "period"
                ).value.trim(),

            reportDate:
                document.getElementById(
                    "reportDate"
                ).value,

            preparedBy:
                document.getElementById(
                    "preparedBy"
                ).value.trim(),

            department:
                document.getElementById(
                    "department"
                ).value.trim(),

            remarks:
                document.getElementById(
                    "remarks"
                ).value.trim(),

            fileName:
                file.name,

            fileSize:
                file.size,

            fileType:
                file.type,

            uploadedBy:
                currentUser,

            uploadedDate:
                new Date().toISOString(),

            // Temporary local file reference.
            // This will later become the
            // Google Drive file ID/link.

            fileLink: ""

        };


        // Add record

        reports.push(report);


        // Save

        saveReports(reports);


        // Refresh table

        renderReports(reports);


        // Show success

        showStatus(
            "Report " +
            report.reportNo +
            " has been added successfully."
        );


        // Clear form

        reportForm.reset();


        // Automatically restore today's date

        setTodayDate();

    }
);


// ------------------------------------------
// CLEAR BUTTON
// ------------------------------------------

clearButton.addEventListener(
    "click",
    function() {

        reportForm.reset();

        uploadStatus.style.display = "none";

        setTodayDate();

    }
);


// ------------------------------------------
// RENDER REPORT TABLE
// ------------------------------------------

function renderReports(reports) {

    reportTableBody.innerHTML = "";


    if (!reports.length) {

        reportTableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="
                        text-align:center;
                        color:#6b7280;
                        padding:25px;
                    "
                >

                    No reports uploaded yet.

                </td>

            </tr>

        `;

        return;

    }


    // Display newest first

    const sortedReports =
        [...reports].reverse();


    sortedReports.forEach(
        function(report) {

            const row =
                document.createElement("tr");


            const fileCell =
                report.fileLink
                    ? `
                        <a
                            class="view-link"
                            href="${report.fileLink}"
                            target="_blank"
                        >
                            View File
                        </a>
                      `
                    : `
                        <span
                            style="color:#6b7280;"
                        >
                            Pending Upload
                        </span>
                      `;


            row.innerHTML = `

                <td>
                    ${escapeHTML(report.reportNo)}
                </td>

                <td>
                    ${escapeHTML(report.category)}
                </td>

                <td>
                    ${escapeHTML(report.title)}
                </td>

                <td>
                    ${escapeHTML(report.project)}
                </td>

                <td>
                    ${escapeHTML(report.period || "-")}
                </td>

                <td>
                    ${formatDate(report.reportDate)}
                </td>

                <td>
                    ${escapeHTML(report.preparedBy)}
                </td>

                <td>
                    ${escapeHTML(report.department || "-")}
                </td>

                <td>
                    ${formatDate(report.uploadedDate)}
                </td>

                <td>
                    ${fileCell}
                </td>

            `;


            reportTableBody.appendChild(row);

        }
    );

}


// ------------------------------------------
// SET TODAY'S DATE
// ------------------------------------------

function setTodayDate() {

    const today =
        new Date()
        .toISOString()
        .split("T")[0];


    document.getElementById(
        "reportDate"
    ).value = today;

}


// ------------------------------------------
// ESCAPE HTML
// ------------------------------------------

function escapeHTML(value) {

    if (value === undefined || value === null) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ------------------------------------------
// INITIALIZE
// ------------------------------------------

setTodayDate();

loadReports();
```

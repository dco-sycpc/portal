```javascript
// ==========================================
// SYC DOCUMENT PORTAL
// REPORT MANAGEMENT
// GOOGLE DRIVE UPLOAD
// ==========================================


// ------------------------------------------
// GOOGLE APPS SCRIPT WEB APP
// ------------------------------------------

const GOOGLE_UPLOAD_URL =
    "https://script.google.com/macros/s/AKfycbxyIYBToAvBgsC0WfAkHJSkk6l1FyvaXxBcTqx5lUeoqRiqmCZJOa85wV6I9swWFCyp/exec";


// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const reportForm =
    document.getElementById("reportForm");

const clearButton =
    document.getElementById("clearButton");

const uploadStatus =
    document.getElementById("uploadStatus");

const reportTableBody =
    document.getElementById("reportTableBody");


// ------------------------------------------
// STORAGE KEY
// ------------------------------------------

const REPORT_STORAGE_KEY =
    "syc_reports";


// ------------------------------------------
// CURRENT USER
// ------------------------------------------

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

        const reports =
            JSON.parse(storedReports);

        renderReports(reports);

    }

    catch (error) {

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

    const reports =
        JSON.parse(
            localStorage.getItem(
                REPORT_STORAGE_KEY
            ) || "[]"
        );

    const nextNumber =
        reports.length + 1;

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

    const date =
        new Date(dateString);

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

function showStatus(
    message,
    success = true
) {

    uploadStatus.style.display =
        "block";

    uploadStatus.textContent =
        message;

    uploadStatus.style.background =
        success
            ? "#dcfce7"
            : "#fee2e2";

    uploadStatus.style.color =
        success
            ? "#166534"
            : "#991b1b";

}


// ------------------------------------------
// CONVERT FILE TO BASE64
// ------------------------------------------

function fileToBase64(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function() {

                    const result =
                        reader.result;

                    const base64 =
                        result.split(",")[1];

                    resolve(base64);

                };

            reader.onerror =
                function(error) {

                    reject(error);

                };

            reader.readAsDataURL(file);

        }
    );

}


// ------------------------------------------
// UPLOAD TO GOOGLE DRIVE
// ------------------------------------------

async function uploadToGoogleDrive(
    file
) {

    const base64Data =
        await fileToBase64(file);


    const payload = {

        fileName:
            file.name,

        mimeType:
            file.type ||
            "application/octet-stream",

        fileData:
            base64Data

    };


    const response =
        await fetch(
            GOOGLE_UPLOAD_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(payload)

            }
        );


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Google Drive upload failed."
        );

    }


    return result;

}


// ------------------------------------------
// FORM SUBMIT
// ------------------------------------------

reportForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const fileInput =
            document.getElementById(
                "reportFile"
            );

        const file =
            fileInput.files[0];


        if (!file) {

            showStatus(
                "Please select a report file.",
                false
            );

            return;

        }


        /*
         * Disable buttons during upload
         */

        const uploadButton =
            reportForm.querySelector(
                ".btn-upload"
            );

        uploadButton.disabled =
            true;

        uploadButton.textContent =
            "Uploading...";


        try {

            showStatus(
                "Uploading report to Google Drive..."
            );


            /*
             * Upload file
             */

            const driveResult =
                await uploadToGoogleDrive(
                    file
                );


            /*
             * Get existing reports
             */

            const reports =
                JSON.parse(
                    localStorage.getItem(
                        REPORT_STORAGE_KEY
                    ) || "[]"
                );


            /*
             * Generate report ID
             */

            const reportId =
                generateReportId();


            /*
             * Create report record
             */

            const report = {

                id:
                    reportId,

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
                    driveResult.fileName,

                fileId:
                    driveResult.fileId,

                fileLink:
                    driveResult.fileUrl,

                fileSize:
                    file.size,

                fileType:
                    file.type,

                uploadedBy:
                    currentUser,

                uploadedDate:
                    new Date().toISOString()

            };


            /*
             * Save report record
             */

            reports.push(report);

            saveReports(reports);


            /*
             * Refresh table
             */

            renderReports(reports);


            /*
             * Success message
             */

            showStatus(
                "Report uploaded successfully to Google Drive."
            );


            /*
             * Clear form
             */

            reportForm.reset();

            setTodayDate();


        }

        catch (error) {

            console.error(
                "Upload error:",
                error
            );


            showStatus(
                "Upload failed: " +
                error.message,
                false
            );

        }


        finally {

            uploadButton.disabled =
                false;

            uploadButton.textContent =
                "Upload Report";

        }

    }
);


// ------------------------------------------
// CLEAR BUTTON
// ------------------------------------------

clearButton.addEventListener(
    "click",
    function() {

        reportForm.reset();

        uploadStatus.style.display =
            "none";

        setTodayDate();

    }
);


// ------------------------------------------
// RENDER REPORT TABLE
// ------------------------------------------

function renderReports(reports) {

    reportTableBody.innerHTML =
        "";


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


    /*
     * Newest reports first
     */

    const sortedReports =
        [...reports].reverse();


    sortedReports.forEach(
        function(report) {

            const row =
                document.createElement(
                    "tr"
                );


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
                            style="
                                color:#6b7280;
                            "
                        >
                            No File
                        </span>

                      `;


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        report.reportNo
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.category
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.title
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.project
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.period || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        report.reportDate
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.preparedBy
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        report.department || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        report.uploadedDate
                    )}
                </td>

                <td>
                    ${fileCell}
                </td>

            `;


            reportTableBody.appendChild(
                row
            );

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
    ).value =
        today;

}


// ------------------------------------------
// ESCAPE HTML
// ------------------------------------------

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ------------------------------------------
// INITIALIZE
// ------------------------------------------

setTodayDate();

loadReports();
```

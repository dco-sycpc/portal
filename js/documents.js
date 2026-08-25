// ==========================================
// SYC DOCUMENT PORTAL
// PROJECT DOCUMENT REGISTER
// Google Apps Script + Google Sheets
// ==========================================

const GOOGLE_DOCUMENT_API =
    "https://script.google.com/macros/s/AKfycbzm1xOr9HoYJOiJViLZsWAMSv1WG71be1A0itxmM1RsrT9esaD_q4ZeNx4WeEUlWZsi/exec";


// ==========================================
// DATA
// ==========================================

let documents = [];
let statusChart;


// ==========================================
// PROJECT INFORMATION
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const project =
    params.get("project");


// ==========================================
// ELEMENTS
// ==========================================

const projectTitle =
    document.getElementById(
        "projectTitle"
    );

const tableBody =
    document.getElementById(
        "tableBody"
    );


// ==========================================
// PROJECT NAME
// ==========================================

const projectNames = {

    "syc-subway-project":
        "SYC Subway Project"

};


// ==========================================
// CHECK PROJECT
// ==========================================

if (!project) {

    alert(
        "No project selected."
    );

    window.location.href =
        "projects.html";

}


// ==========================================
// PROJECT TITLE
// ==========================================

if (projectTitle) {

    projectTitle.textContent =
        "📄 " +
        (
            projectNames[project] ||
            project
        );

}


// ==========================================
// LOAD DOCUMENTS
// ==========================================

async function loadDocuments() {

    try {

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="10"
                        style="text-align:center;padding:25px;">
                        Loading documents...
                    </td>
                </tr>
            `;

        }


        const response =
            await fetch(
                GOOGLE_DOCUMENT_API
            );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Document API response:",
            result
        );


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load documents."
            );

        }


        const allDocuments =
            Array.isArray(
                result.documents
            )
                ? result.documents
                : [];


        // ----------------------------------
        // FILTER CURRENT PROJECT
        // ----------------------------------

        documents =
            allDocuments.filter(
                doc =>
                    String(
                        doc.Project || ""
                    ).trim()
                    ===
                    String(
                        projectNames[project] ||
                        project
                    ).trim()
            );


        console.log(
            "Documents for project:",
            documents
        );


        updateDashboard();

        displayDocuments(
            documents
        );


    }

    catch (error) {

        console.error(
            "Document loading error:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        style="
                            text-align:center;
                            padding:25px;
                            color:#dc2626;
                        "
                    >

                        Unable to load the
                        Document Register.

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }

    }

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    document.getElementById(
        "totalDocs"
    ).textContent =
        documents.length;


    document.getElementById(
        "approvedDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Approved"
        ).length;


    document.getElementById(
        "approvedAsCorrectedDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Approved As Corrected"
        ).length;


    document.getElementById(
        "reviseResubmitDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Revise & Resubmit"
        ).length;


    document.getElementById(
        "submittedDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Submitted"
        ).length;


    document.getElementById(
        "draftDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Draft"
        ).length;


    document.getElementById(
        "cancelledDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Cancelled"
        ).length;


    document.getElementById(
        "supersededDocs"
    ).textContent =

        documents.filter(
            d =>
                d.Status ===
                "Superseded"
        ).length;


    document.getElementById(
        "overdueDocs"
    ).textContent =

        documents.filter(
            isDocumentOverdue
        ).length;


    updateChart();

}


// ==========================================
// OVERDUE
// ==========================================

function isDocumentOverdue(
    doc
) {

    if (
        doc.Status !==
        "Submitted"
    ) {

        return false;

    }


    if (
        !doc.DueDate
    ) {

        return false;

    }


    const due =
        new Date(
            doc.DueDate
        );


    return (
        !isNaN(
            due.getTime()
        ) &&
        new Date() > due
    );

}


// ==========================================
// STATUS CHART
// ==========================================

function updateChart() {

    const approved =
        documents.filter(
            d =>
                d.Status ===
                "Approved"
        ).length;


    const approvedAsCorrected =
        documents.filter(
            d =>
                d.Status ===
                "Approved As Corrected"
        ).length;


    const reviseResubmit =
        documents.filter(
            d =>
                d.Status ===
                "Revise & Resubmit"
        ).length;


    const submitted =
        documents.filter(
            d =>
                d.Status ===
                "Submitted"
        ).length;


    const draft =
        documents.filter(
            d =>
                d.Status ===
                "Draft"
        ).length;


    const superseded =
        documents.filter(
            d =>
                d.Status ===
                "Superseded"
        ).length;


    const cancelled =
        documents.filter(
            d =>
                d.Status ===
                "Cancelled"
        ).length;


    const overdue =
        documents.filter(
            isDocumentOverdue
        ).length;


    if (statusChart) {

        statusChart.destroy();

    }


    const canvas =
        document.getElementById(
            "statusChart"
        );


    if (!canvas) {

        return;

    }


    statusChart =
        new Chart(

            canvas,

            {

                type:
                    "doughnut",

                data: {

                    labels: [

                        "Approved",
                        "Approved As Corrected",
                        "Revise & Resubmit",
                        "Submitted",
                        "Draft",
                        "Superseded",
                        "Cancelled",
                        "Overdue"

                    ],

                    datasets: [{

                        data: [

                            approved,
                            approvedAsCorrected,
                            reviseResubmit,
                            submitted,
                            draft,
                            superseded,
                            cancelled,
                            overdue

                        ],

                        backgroundColor: [

                            "#16a34a",
                            "#FEBE1E",
                            "#FE0000",
                            "#765BFF",
                            "#D2591C",
                            "#D8E438",
                            "#EDADAD",
                            "#DC2626"

                        ],

                        borderWidth: 1

                    }]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }

        );

}


// ==========================================
// DISPLAY DOCUMENTS
// ==========================================

function displayDocuments(
    list
) {

    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    // --------------------------------------
    // EMPTY REGISTER
    // --------------------------------------

    if (
        !list.length
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#64748b;
                    "
                >

                    No project documents
                    have been registered yet.

                </td>

            </tr>

        `;


        document.getElementById(
            "recordCount"
        ).innerHTML =
            "Total Documents : <b>0</b>";


        return;

    }


    // --------------------------------------
    // DISPLAY
    // --------------------------------------

    list.forEach(
        doc => {

            let statusClass =
                "";


            const overdue =
                isDocumentOverdue(
                    doc
                );


            const displayStatus =
                overdue
                    ? "Overdue"
                    : (
                        doc.Status ||
                        ""
                    );


            // ------------------------------
            // STATUS CLASS
            // ------------------------------

            if (
                doc.Status ===
                "Approved"
            ) {

                statusClass =
                    "status-approved";

            }


            if (
                doc.Status ===
                "Approved As Corrected"
            ) {

                statusClass =
                    "status-approvedAsCorrected";

            }


            if (
                doc.Status ===
                "Revise & Resubmit"
            ) {

                statusClass =
                    "status-reviseResubmit";

            }


            if (
                doc.Status ===
                "Submitted"
            ) {

                statusClass =
                    "status-submitted";

            }


            if (
                doc.Status ===
                "Draft"
            ) {

                statusClass =
                    "status-draft";

            }


            if (
                doc.Status ===
                "Cancelled"
            ) {

                statusClass =
                    "status-cancelled";

            }


            if (
                doc.Status ===
                "Superseded"
            ) {

                statusClass =
                    "status-superseded";

            }


            if (overdue) {

                statusClass =
                    "status-overdue";

            }


            // ------------------------------
            // FILE
            // ------------------------------

            let fileCell =
                "—";


            if (
                doc.FileLink
            ) {

                fileCell = `

                    <a
                        href="${escapeHTML(
                            doc.FileLink
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="view-btn"
                    >
                        View
                    </a>

                `;

            }


            // ------------------------------
            // ROW
            // ------------------------------

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        doc.DocumentNo
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        doc.Category
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        doc.Trade
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        doc.Title
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        doc.Revision
                    )}
                </td>

                <td
                    class="${statusClass}"
                >
                    ${escapeHTML(
                        displayStatus
                    )}
                </td>

                <td>
                    ${formatDate(
                        doc.Date
                    )}
                </td>

                <td>
                    ${formatDate(
                        doc.DueDate
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        doc.BallInCourt
                    )}
                </td>

                <td>
                    ${fileCell}
                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    document.getElementById(
        "recordCount"
    ).innerHTML =

        "Total Documents : <b>" +
        list.length +
        "</b>";

}


// ==========================================
// FILTER ELEMENTS
// ==========================================

const search =
    document.getElementById(
        "searchBox"
    );

const status =
    document.getElementById(
        "statusFilter"
    );

const category =
    document.getElementById(
        "categoryFilter"
    );

const trade =
    document.getElementById(
        "tradeFilter"
    );

const sort =
    document.getElementById(
        "sortFilter"
    );


// ==========================================
// FILTER
// ==========================================

function filterDocuments() {

    const keyword =
        (
            search.value ||
            ""
        ).toLowerCase();


    const selectedStatus =
        status.value;


    const selectedCategory =
        category.value;


    const selectedTrade =
        trade.value;


    const filtered =
        documents.filter(
            doc => {

                const matchText = [

                    doc.DocumentNo,
                    doc.Category,
                    doc.Trade,
                    doc.Title,
                    doc.Revision,
                    doc.Status,
                    doc.BallInCourt,
                    doc.ActivityId,
                    doc.ActivityName

                ]

                .some(
                    value =>
                        String(
                            value ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )
                );


                const overdue =
                    isDocumentOverdue(
                        doc
                    );


                const matchStatus =

                    selectedStatus === ""

                    ||

                    (
                        selectedStatus ===
                        "Overdue"

                            ? overdue

                            : doc.Status ===
                              selectedStatus
                    );


                const matchCategory =

                    selectedCategory === ""

                    ||

                    doc.Category ===
                    selectedCategory;


                const matchTrade =

                    selectedTrade === ""

                    ||

                    doc.Trade ===
                    selectedTrade;


                return (

                    matchText &&

                    matchStatus &&

                    matchCategory &&

                    matchTrade

                );

            }
        );


    // --------------------------------------
    // SORT
    // --------------------------------------

    switch (
        sort.value
    ) {

        case "date-desc":

            filtered.sort(
                (a, b) =>
                    new Date(
                        b.Date
                    ) -
                    new Date(
                        a.Date
                    )
            );

            break;


        case "date-asc":

            filtered.sort(
                (a, b) =>
                    new Date(
                        a.Date
                    ) -
                    new Date(
                        b.Date
                    )
            );

            break;


        case "doc-asc":

            filtered.sort(
                (a, b) =>
                    String(
                        a.DocumentNo ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b.DocumentNo ||
                            ""
                        )
                    )
            );

            break;


        case "doc-desc":

            filtered.sort(
                (a, b) =>
                    String(
                        b.DocumentNo ||
                        ""
                    )
                    .localeCompare(
                        String(
                            a.DocumentNo ||
                            ""
                        )
                    )
            );

            break;


        case "title-asc":

            filtered.sort(
                (a, b) =>
                    String(
                        a.Title ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b.Title ||
                            ""
                        )
                    )
            );

            break;


        case "title-desc":

            filtered.sort(
                (a, b) =>
                    String(
                        b.Title ||
                        ""
                    )
                    .localeCompare(
                        String(
                            a.Title ||
                            ""
                        )
                    )
            );

            break;


        case "dueDate-asc":

            filtered.sort(
                (a, b) =>
                    new Date(
                        a.DueDate
                    ) -
                    new Date(
                        b.DueDate
                    )
            );

            break;

    }


    displayDocuments(
        filtered
    );

}


// ==========================================
// EVENT LISTENERS
// ==========================================

if (search) {

    search.addEventListener(
        "keyup",
        filterDocuments
    );

}


if (status) {

    status.addEventListener(
        "change",
        filterDocuments
    );

}


if (category) {

    category.addEventListener(
        "change",
        filterDocuments
    );

}


if (trade) {

    trade.addEventListener(
        "change",
        filterDocuments
    );

}


if (sort) {

    sort.addEventListener(
        "change",
        filterDocuments
    );

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            value
        );

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

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


// ==========================================
// START
// ==========================================

loadDocuments();

// ==========================================
// DOCUMENT REGISTER
// ==========================================

let documents = [];
let statusChart;


// ==========================================
// PROJECT INFORMATION
// ==========================================

const params = new URLSearchParams(
    window.location.search
);

const project = params.get("project");


// ==========================================
// PROJECT NAMES
// ==========================================

const projectNames = {

    "government-center":
        "Government Center Project",

    "22-storey-multipurpose-building":
        "22-Storey Multipurpose Building",

    "school-cluster3":
        "School Cluster 3",

    "medical-center":
        "Medical Center",

    "evacuation-center":
        "San Juan Evacuation Center",

    "crematorium":
        "San Juan Crematorium"

};


// ==========================================
// CHECK PROJECT
// ==========================================

if (!project) {

    alert("No project selected.");

    window.location.href =
        "projects.html";

}


// ==========================================
// SET PROJECT TITLE
// ==========================================

const projectTitle =
    document.getElementById("projectTitle");

if (projectTitle) {

    projectTitle.textContent =
        "📄 " +
        (projectNames[project] ||
        "Document Register");

}


// ==========================================
// LOAD PROJECT DOCUMENTS
// ==========================================

async function loadDocuments() {

    try {

        const response =
            await fetch(`data/${project}.json`);

        if (!response.ok) {

            throw new Error(
                `Project database not found: ${project}.json`
            );

        }

        documents =
            await response.json();

        console.log(
            `Loaded ${documents.length} documents for ${project}`
        );

        updateDashboard();

        displayDocuments(documents);

    }

    catch (error) {

        console.error(
            "Document loading error:",
            error
        );

        const table =
            document.getElementById("tableBody");

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;">
                        Unable to load project documents.
                    </td>
                </tr>
            `;

        }

    }

}


// ==========================================
// DASHBOARD COUNTS
// ==========================================

function updateDashboard() {

    document.getElementById("totalDocs").textContent =
        documents.length;

    document.getElementById("approvedDocs").textContent =
        documents.filter(
            d => d.status === "Approved"
        ).length;

    document.getElementById("approvedAsCorrectedDocs").textContent =
        documents.filter(
            d => d.status === "Approved As Corrected"
        ).length;

    document.getElementById("reviseResubmitDocs").textContent =
        documents.filter(
            d => d.status === "Revise & Resubmit"
        ).length;

    document.getElementById("submittedDocs").textContent =
        documents.filter(
            d => d.status === "Submitted"
        ).length;

    document.getElementById("draftDocs").textContent =
        documents.filter(
            d => d.status === "Draft"
        ).length;

    document.getElementById("cancelledDocs").textContent =
        documents.filter(
            d => d.status === "Cancelled"
        ).length;

    document.getElementById("supersededDocs").textContent =
        documents.filter(
            d => d.status === "Superseded"
        ).length;


    // ------------------------------
    // Overdue
    // ------------------------------

    const overdueCount =
        documents.filter(
            isDocumentOverdue
        ).length;

    document.getElementById("overdueDocs").textContent =
        overdueCount;


    updateChart();

}


// ==========================================
// CHECK OVERDUE
// ==========================================

function isDocumentOverdue(doc) {

    if (doc.status !== "Submitted")
        return false;

    if (!doc.dueDate)
        return false;

    return (
        new Date() >
        new Date(doc.dueDate)
    );

}


// ==========================================
// STATUS CHART
// ==========================================

function updateChart() {

    const approved =
        documents.filter(
            d => d.status === "Approved"
        ).length;

    const approvedAsCorrected =
        documents.filter(
            d => d.status === "Approved As Corrected"
        ).length;

    const reviseResubmit =
        documents.filter(
            d => d.status === "Revise & Resubmit"
        ).length;

    const submitted =
        documents.filter(
            d => d.status === "Submitted"
        ).length;

    const draft =
        documents.filter(
            d => d.status === "Draft"
        ).length;

    const cancelled =
        documents.filter(
            d => d.status === "Cancelled"
        ).length;

    const superseded =
        documents.filter(
            d => d.status === "Superseded"
        ).length;

    const overdue =
        documents.filter(
            isDocumentOverdue
        ).length;


    if (statusChart) {

        statusChart.destroy();

    }


    const ctx =
        document.getElementById(
            "statusChart"
        );


    if (!ctx)
        return;


    statusChart =
        new Chart(ctx, {

            type: "doughnut",

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

                        position: "bottom"

                    }

                }

            }

        });

}


// ==========================================
// DISPLAY DOCUMENTS
// ==========================================

function displayDocuments(list) {

    const table =
        document.getElementById(
            "tableBody"
        );

    if (!table)
        return;


    table.innerHTML = "";


    list.forEach(doc => {

        let statusClass = "";


        const isOverdue =
            isDocumentOverdue(doc);


        const displayStatus =
            isOverdue
                ? "Overdue"
                : doc.status;


        if (doc.status === "Approved")
            statusClass =
                "status-approved";


        if (
            doc.status ===
            "Approved As Corrected"
        )
            statusClass =
                "status-approvedAsCorrected";


        if (
            doc.status ===
            "Revise & Resubmit"
        )
            statusClass =
                "status-reviseResubmit";


        if (doc.status === "Submitted")
            statusClass =
                "status-submitted";


        if (isOverdue)
            statusClass =
                "status-overdue";


        if (doc.status === "Draft")
            statusClass =
                "status-draft";


        if (doc.status === "Cancelled")
            statusClass =
                "status-cancelled";


        if (doc.status === "Superseded")
            statusClass =
                "status-superseded";


        // ----------------------------------
        // File link
        // ----------------------------------

        let fileCell = "—";


        if (doc.link) {

            fileCell = `
                <a
                    href="${doc.link}"
                    target="_blank"
                    class="view-btn"
                >
                    View
                </a>
            `;

        }


        table.innerHTML += `

            <tr>

                <td>
                    ${doc.docNo || ""}
                </td>

                <td>
                    ${doc.category || ""}
                </td>

                <td>
                    ${doc.trade || ""}
                </td>

                <td>
                    ${doc.title || ""}
                </td>

                <td>
                    ${doc.revision || ""}
                </td>

                <td class="${statusClass}">
                    ${displayStatus || ""}
                </td>

                <td>
                    ${doc.date || ""}
                </td>

                <td>
                    ${fileCell}
                </td>

            </tr>

        `;

    });


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
// FILTER DOCUMENTS
// ==========================================

function filterDocuments() {

    const keyword =
        search.value.toLowerCase();


    const selectedStatus =
        status.value;

    const selectedCategory =
        category.value;

    const selectedTrade =
        trade.value;


    const filtered =
        documents.filter(doc => {


            const matchText =

                (doc.docNo || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (doc.title || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (doc.category || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (doc.trade || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (doc.ballInCourt || "")
                    .toLowerCase()
                    .includes(keyword);


            const isOverdue =
                isDocumentOverdue(doc);


            const matchStatus =

                selectedStatus === ""

                ||

                (
                    selectedStatus ===
                    "Overdue"

                    ? isOverdue

                    : doc.status ===
                      selectedStatus
                );


            const matchCategory =

                selectedCategory === ""

                ||

                doc.category ===
                selectedCategory;


            const matchTrade =

                selectedTrade === ""

                ||

                doc.trade ===
                selectedTrade;


            return (

                matchText &&

                matchStatus &&

                matchCategory &&

                matchTrade

            );

        });


    // --------------------------------------
    // Sorting
    // --------------------------------------

    switch (sort.value) {

        case "date-desc":

            filtered.sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

            break;


        case "date-asc":

            filtered.sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );

            break;


        case "doc-asc":

            filtered.sort(
                (a, b) =>
                    (a.docNo || "")
                        .localeCompare(
                            b.docNo || ""
                        )
            );

            break;


        case "doc-desc":

            filtered.sort(
                (a, b) =>
                    (b.docNo || "")
                        .localeCompare(
                            a.docNo || ""
                        )
            );

            break;


        case "title-asc":

            filtered.sort(
                (a, b) =>
                    (a.title || "")
                        .localeCompare(
                            b.title || ""
                        )
            );

            break;


        case "title-desc":

            filtered.sort(
                (a, b) =>
                    (b.title || "")
                        .localeCompare(
                            a.title || ""
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

if (search)
    search.addEventListener(
        "keyup",
        filterDocuments
    );

if (status)
    status.addEventListener(
        "change",
        filterDocuments
    );

if (category)
    category.addEventListener(
        "change",
        filterDocuments
    );

if (trade)
    trade.addEventListener(
        "change",
        filterDocuments
    );

if (sort)
    sort.addEventListener(
        "change",
        filterDocuments
    );


// ==========================================
// START
// ==========================================

loadDocuments();

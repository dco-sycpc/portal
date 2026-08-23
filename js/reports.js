/ ------------------------------------------
// UPLOAD REPORT
// ------------------------------------------

async function uploadReport(event) {
  event.preventDefault();
  uploadButton.disabled = true;
  uploadButton.textContent = "Uploading...";

  try {
    const file = document.getElementById("file").files[0];
    if (!file) {
      showStatus("No file selected.", false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
      const base64Data = reader.result.split(",")[1];

      const report = {
        reportNo: document.getElementById("reportNo").value.trim(),
        category: document.getElementById("category").value.trim(),
        title: document.getElementById("title").value.trim(),
        project: document.getElementById("project").value.trim(),
        period: document.getElementById("period").value.trim(),
        reportDate: document.getElementById("reportDate").value,
        preparedBy: document.getElementById("preparedBy").value.trim(),
        department: document.getElementById("department").value.trim(),
        remarks: document.getElementById("remarks").value.trim(),
        uploadedBy: currentUser,
        uploadedDate: new Date().toISOString(),
        fileName: file.name,
        fileData: base64Data,
        mimeType: file.type
      };

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxRqNkwT5SkrW-dy8yu4XTpt-JeS8Jx28a_GdGq5lFhGdobot0kAlgH1LnadAS4vBYq/exec",
        {
          method: "POST",
          body: JSON.stringify(report),
          headers: { "Content-Type": "application/json" }
        }
      );

      const result = await response.json();

      if (result.success) {
        showStatus("Report uploaded successfully to Google Drive.");

        reports.push({
          ...report,
          fileId: result.fileId,
          fileLink: result.fileUrl,
          fileName: result.fileName
        });

        saveReports(reports);
        renderReports(reports);
        reportForm.reset();
        setTodayDate();
      } else {
        showStatus("Upload failed: " + result.message, false);
      }
    };

    reader.readAsDataURL(file);

  } catch (error) {
    console.error("Upload error:", error);
    showStatus("Upload failed: " + error.message, false);
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload Report";
  }
}

// ------------------------------------------
// CLEAR BUTTON
// ------------------------------------------

clearButton.addEventListener("click", function () {
  reportForm.reset();
  uploadStatus.style.display = "none";
  setTodayDate();
});

// ------------------------------------------
// RENDER REPORT TABLE
// ------------------------------------------

function renderReports(reports) {
  reportTableBody.innerHTML = "";

  if (!reports.length) {
    reportTableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; color:#6b7280; padding:25px;">
          No reports uploaded yet.
        </td>
      </tr>`;
    return;
  }

  const sortedReports = [...reports].reverse();

  sortedReports.forEach(function (report) {
    const row = document.createElement("tr");

    const fileCell = report.fileLink
      ? `<a class="view-link" href="${report.fileLink}" target="_blank">View File</a>`
      : `<span style="color:#6b7280;">No File</span>`;

    row.innerHTML = `
      <td>${escapeHTML(report.reportNo)}</td>
      <td>${escapeHTML(report.category)}</td>
      <td>${escapeHTML(report.title)}</td>
      <td>${escapeHTML(report.project)}</td>
      <td>${escapeHTML(report.period || "-")}</td>
      <td>${formatDate(report.reportDate)}</td>
      <td>${escapeHTML(report.preparedBy)}</td>
      <td>${escapeHTML(report.department || "-")}</td>
      <td>${formatDate(report.uploadedDate)}</td>
      <td>${fileCell}</td>
    `;

    reportTableBody.appendChild(row);
  });
}

// ------------------------------------------
// SET TODAY'S DATE
// ------------------------------------------

function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("reportDate").value = today;
}

// ------------------------------------------
// ESCAPE HTML
// ------------------------------------------

function escapeHTML(value) {
  if (value === undefined || value === null) return "";
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
async function loadReports(); {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxRqNkwT5SkrW-dy8yu4XTpt-JeS8Jx28a_GdGq5lFhGdobot0kAlgH1LnadAS4vBYq/exec"
   );
   const result = await response.json();

   if (result.success && result.reports) {
     reports = result.reports;
     renderReports(reports);
   } else {
     showStatus("No reports found.", false);
   }
  } catch (error) {
    console.error("Lord error:", error);
    showStatus("Failed to load reports: " + error.message, false);
  }
}  

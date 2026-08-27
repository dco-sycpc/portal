"use strict";

// ============================================================
// SYC DOCUMENT PORTAL
// DASHBOARD
// GOOGLE APPS SCRIPT + GOOGLE SHEETS
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const GOOGLE_DOCUMENT_API =
    "https://script.google.com/macros/s/AKfycbzm1xOr9HoYJOiJViLZsWAMSv1WG71be1A0itxmM1RsrT9esaD_q4ZeNx4WeEUlWZsi/exec";

/*
 * Number of recent records displayed before the user searches.
 */
const DASHBOARD_DOCUMENT_LIMIT = 10;

/*
 * "uploads":
 * Counts every registered Sheet row.
 *
 * "unique":
 * Counts each document number only once.
 */
const DOCUMENT_COUNT_MODE = "uploads";

/*
 * Project codes returned by your Apps Script are converted
 * into readable project names here.
 */
const PROJECT_NAMES = {
    "syc-subway-project":
        "SYC Subway Project",

    "ortigas-project":
        "Ortigas Project",

    "Metro Manila Subway Project Phase 1":
        "Metro Manila Subway Project"
};

/*
 * These statuses are excluded from overdue and due calculations.
 */
const CLOSED_STATUSES = new Set(*
    "approved",
    "approved as corrected",
    "cancelled",
    "superseded"
]);


// ===============*==================================*=========
// GLOBAL DASHBOARD DATA*// ===============================*============================

let *llDocs = [];
let dashboardIsLoadin* = false;
let dashboardLastLoadedA* = null;


// ====================*==================================*====
// START DASHBOARD
// =======*==================================*=================

document.addEve*tListener(
    "DOMContentLoaded",*    initializeDashboard
);

functi*n initializeDashboard() {
    disp*ayCurrentUser();
    configureSear*h();
    configureRefreshButton();*    configureUploadRefreshListener*);
    configureVisibilityRefresh(*;
    loadDashboard();
}


// ====*==================================*====================
// CURRENT USER
// =============================*==============================

fu*ction displayCurrentUser() {
    c*nst welcomeElement =
        docum*nt.getElementById(
            "we*comeUser"
        );

    if (!wel*omeElement) {
        return;
    *

    try {
        const storedUs*r =
            localStorage.getIt*m(
                "currentUser"
 *          );

        const curren*

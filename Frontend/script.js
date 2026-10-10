// ========================================
// 1. NAVIGATION
// ========================================

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".page-section");

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const targetSection = button.dataset.section;

        navButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        sections.forEach(section => {
            section.hidden = section.id !== targetSection;
        });
    });
});


// ========================================
// 2. BIOMETRIC SETTINGS
// ========================================

const recognitionToggle = document.getElementById("recognition-toggle");
const visitorNotifications = document.getElementById("visitor-notifications");
const unknownAlerts = document.getElementById("unknown-alerts");
const privacyStatus = document.getElementById("privacy-status");
const dashboardRecognitionStatus = document.getElementById("recognition-status");

function updateRecognitionStatus() {
    const enabled = recognitionToggle.checked;

    privacyStatus.classList.toggle("recognition-on", enabled);

    privacyStatus.innerHTML = enabled
        ? `
            <span class="status-dot"></span>
            <div>
                <strong>Recognition Enabled — Prototype</strong>
                <p>The interface is enabled, but no camera recognition is running.</p>
            </div>
          `
        : `
            <span class="status-dot"></span>
            <div>
                <strong>Privacy Mode Active</strong>
                <p>Face recognition is disabled.</p>
            </div>
          `;

    dashboardRecognitionStatus.textContent = enabled ? "ON" : "OFF";
}

recognitionToggle.addEventListener("change", updateRecognitionStatus);

visitorNotifications.addEventListener("change", () => {
    console.log(
        "Visitor notifications:",
        visitorNotifications.checked ? "Enabled" : "Disabled"
    );
});

unknownAlerts.addEventListener("change", () => {
    console.log(
        "Unknown visitor alerts:",
        unknownAlerts.checked ? "Enabled" : "Disabled"
    );
});


// ========================================
// 3. VISITOR HISTORY
// ========================================

const visitorTableBody = document.getElementById("visitor-table-body");
const recordCount = document.getElementById("record-count");
const viewMoreButton = document.getElementById("view-more-btn");
const dashboardVisitorCount = document.getElementById("visitor-count");

const visibleRecords = 10;
let showAllRecords = false;

// Demonstration data only; these are not real camera detections.
const visitorRecords = [
    {
        time: "10:45 AM",
        visitor: "Registered Family Member",
        recognition: "Recognized",
        status: "Visit recorded"
    },
    {
        time: "10:32 AM",
        visitor: "Unknown visitor",
        recognition: "Unrecognized",
        status: "Review required"
    },
    {
        time: "09:58 AM",
        visitor: "Registered Caregiver",
        recognition: "Recognized",
        status: "Visit recorded"
    }
];

function renderVisitorHistory() {
    const sortedRecords = [...visitorRecords].reverse();

    const recordsToShow = showAllRecords
        ? sortedRecords
        : sortedRecords.slice(0, visibleRecords);

    recordCount.textContent =
        `${visitorRecords.length} record${visitorRecords.length === 1 ? "" : "s"}`;

    dashboardVisitorCount.textContent = visitorRecords.length;

    visitorTableBody.replaceChildren();

    if (recordsToShow.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-state";
        cell.textContent = "No visitor records yet.";

        row.appendChild(cell);
        visitorTableBody.appendChild(row);
    }

    recordsToShow.forEach(record => {
        const row = document.createElement("tr");

        [
            record.time,
            record.visitor,
            record.recognition,
            record.status
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        visitorTableBody.appendChild(row);
    });

    viewMoreButton.hidden = visitorRecords.length <= visibleRecords;

    viewMoreButton.textContent = showAllRecords
        ? "Show Less"
        : "View More Records";
}

viewMoreButton.addEventListener("click", () => {
    showAllRecords = !showAllRecords;
    renderVisitorHistory();
});

renderVisitorHistory();


// ========================================
// 4. MEDICINE MANAGEMENT
// ========================================

const medicineForm = document.getElementById("medicine-form");
const medicineName = document.getElementById("medicine-name");
const medicineDosage = document.getElementById("medicine-dosage");
const medicineFrequency = document.getElementById("medicine-frequency");
const doseTimeInputs = document.getElementById("dose-time-inputs");

const medicineList = document.getElementById("medicine-list");
const medicineRecordCount = document.getElementById("medicine-record-count");

const totalMedicinesDisplay = document.getElementById("total-medicines");
const dosesTakenDisplay = document.getElementById("doses-taken");
const dosesPendingDisplay = document.getElementById("doses-pending");

const dashboardMedicineCount = document.getElementById("medicine-count");

const MEDICINES_STORAGE_KEY = "smriti_medicines_v1";

function loadMedicines() {
    try {
        const saved = localStorage.getItem(MEDICINES_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .filter(medicine =>
                medicine &&
                typeof medicine.id === "number" &&
                typeof medicine.name === "string" &&
                typeof medicine.dosage === "string" &&
                Array.isArray(medicine.doses)
            )
            .map(medicine => ({
                ...medicine,
                doses: medicine.doses
                    .filter(dose =>
                        dose &&
                        typeof dose.time === "string"
                    )
                    .map(dose => ({
                        time: dose.time,
                        taken: Boolean(dose.taken),
                        id: dose.id || `${medicine.id}-${dose.time}`
                    }))
            }));

    } catch (error) {
        console.error("Could not load saved medicines:", error);
        return [];
    }
}

const medicines = loadMedicines();

function saveMedicines() {
    try {
        localStorage.setItem(
            MEDICINES_STORAGE_KEY,
            JSON.stringify(medicines)
        );
    } catch (error) {
        console.error("Could not save medicines:", error);

        alert(
            "SMRITI could not save your changes. " +
            "Please check your browser storage settings."
        );
    }
}


// ========================================
// 5. DOSE TIME INPUTS
// ========================================

const defaultDoseTimes = {
    1: ["08:00"],
    2: ["08:00", "20:00"],
    3: ["08:00", "14:00", "20:00"],
    4: ["08:00", "12:00", "16:00", "20:00"]
};

function renderDoseTimeInputs() {
    const frequency = Number(medicineFrequency.value);

    doseTimeInputs.replaceChildren();

    defaultDoseTimes[frequency].forEach((defaultTime, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "dose-time-input";

        const label = document.createElement("label");
        label.textContent = `Dose ${index + 1} time`;
        label.htmlFor = `dose-time-${index}`;

        const input = document.createElement("input");
        input.type = "time";
        input.id = `dose-time-${index}`;
        input.required = true;
        input.value = defaultTime;

        wrapper.append(label, input);
        doseTimeInputs.appendChild(wrapper);
    });
}

medicineFrequency.addEventListener("change", renderDoseTimeInputs);
renderDoseTimeInputs();


// ========================================
// 6. MEDICINE DISPLAY HELPERS
// ========================================

function formatDoseTime(time) {
    const [hours, minutes] = time.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}


// ========================================
// 7. RENDER MEDICINES
// ========================================

function renderMedicines() {
    medicineList.replaceChildren();

    const totalDoses = medicines.reduce(
        (total, medicine) => total + medicine.doses.length,
        0
    );

    const takenDoses = medicines.reduce(
        (total, medicine) =>
            total + medicine.doses.filter(dose => dose.taken).length,
        0
    );

    const pendingDoses = totalDoses - takenDoses;

    totalMedicinesDisplay.textContent = medicines.length;
    dosesTakenDisplay.textContent = takenDoses;
    dosesPendingDisplay.textContent = pendingDoses;

    medicineRecordCount.textContent =
        `${totalDoses} dose${totalDoses === 1 ? "" : "s"}`;

    dashboardMedicineCount.textContent = totalDoses;

    if (medicines.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No medicines added yet.";

        medicineList.appendChild(emptyMessage);
        return;
    }

    const sortedMedicines = [...medicines].sort(
        (a, b) => a.name.localeCompare(b.name)
    );

    sortedMedicines.forEach(medicine => {
        const headingRow = document.createElement("div");
        headingRow.className = "medicine-heading-row";

        const heading = document.createElement("h4");
        heading.className = "medicine-name-heading";
        heading.textContent = medicine.name;

        const deleteMedicineButton = document.createElement("button");

        deleteMedicineButton.type = "button";
        deleteMedicineButton.className = "medicine-delete-btn";
        deleteMedicineButton.textContent = "Delete medicine";

        deleteMedicineButton.setAttribute(
            "aria-label",
            `Delete ${medicine.name} and all its doses`
        );

        deleteMedicineButton.addEventListener("click", () => {
            const confirmed = confirm(
                `Delete ${medicine.name} and all ` +
                `${medicine.doses.length} scheduled dose(s)?\n\n` +
                "This cannot be undone."
            );

            if (!confirmed) {
                return;
            }

            const index = medicines.findIndex(
                item => item.id === medicine.id
            );

            if (index !== -1) {
                medicines.splice(index, 1);
            }

            saveMedicines();
            renderMedicines();
        });

        headingRow.append(heading, deleteMedicineButton);

        const dosageDescription = document.createElement("p");

        dosageDescription.className = "medicine-dosage-description";
        dosageDescription.textContent = medicine.dosage;

        medicineList.append(headingRow, dosageDescription);

        const sortedDoses = [...medicine.doses].sort(
            (a, b) => a.time.localeCompare(b.time)
        );

        sortedDoses.forEach(dose => {
            const item = document.createElement("div");
            item.className = "medicine-item";

            const details = document.createElement("div");
            details.className = "medicine-details";

            const doseName = document.createElement("h4");
            doseName.textContent =
                `Scheduled dose · ${formatDoseTime(dose.time)}`;

            const doseDescription = document.createElement("p");

            doseDescription.textContent = dose.taken
                ? "This dose has been marked as taken."
                : "Waiting for dose confirmation.";

            details.append(doseName, doseDescription);

            const actions = document.createElement("div");
            actions.className = "medicine-actions";

            const status = document.createElement("span");

            status.className = dose.taken
                ? "medicine-status taken"
                : "medicine-status";

            status.textContent = dose.taken ? "Taken" : "Pending";

            const takenButton = document.createElement("button");

            takenButton.type = "button";
            takenButton.className = "medicine-action-btn";
            takenButton.textContent = dose.taken
                ? "Confirmed"
                : "Mark as Taken";

            takenButton.disabled = dose.taken;

            takenButton.addEventListener("click", () => {
                dose.taken = true;

                saveMedicines();
                renderMedicines();
            });

            const deleteDoseButton = document.createElement("button");

            deleteDoseButton.type = "button";
            deleteDoseButton.className = "medicine-delete-btn";
            deleteDoseButton.textContent = "Delete dose";

            deleteDoseButton.setAttribute(
                "aria-label",
                `Delete ${medicine.name} dose at ${formatDoseTime(dose.time)}`
            );

            deleteDoseButton.addEventListener("click", () => {
                const message = dose.taken
                    ? `This dose is marked as taken. Delete the ` +
                      `${formatDoseTime(dose.time)} dose of ${medicine.name}?`
                    : `Delete the ${formatDoseTime(dose.time)} dose ` +
                      `of ${medicine.name}?`;

                if (!confirm(`${message}\n\nThis cannot be undone.`)) {
                    return;
                }

                medicine.doses = medicine.doses.filter(
                    itemDose => itemDose.id !== dose.id
                );

                if (medicine.doses.length === 0) {
                    const index = medicines.findIndex(
                        item => item.id === medicine.id
                    );

                    if (index !== -1) {
                        medicines.splice(index, 1);
                    }
                }

                saveMedicines();
                renderMedicines();
            });

            actions.append(status, takenButton, deleteDoseButton);
            item.append(details, actions);

            medicineList.appendChild(item);
        });
    });
}


// ========================================
// 8. ADD A MEDICINE
// ========================================

medicineForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = medicineName.value.trim();
    const dosage = medicineDosage.value.trim();

    const timeInputs = doseTimeInputs.querySelectorAll(
        'input[type="time"]'
    );

    const times = Array.from(
        timeInputs,
        input => input.value
    );

    if (!name || !dosage || times.some(time => !time)) {
        alert("Please complete all medicine details and dose times.");
        return;
    }

    if (new Set(times).size !== times.length) {
        alert("Please choose a different time for each scheduled dose.");
        return;
    }

    const medicineId = Date.now();

    medicines.push({
        id: medicineId,
        name,
        dosage,

        doses: times.map((time, index) => ({
            id: `${medicineId}-${index}`,
            time,
            taken: false
        }))
    });

    saveMedicines();
    renderMedicines();

    medicineForm.reset();
    medicineFrequency.value = "1";

    renderDoseTimeInputs();
});

renderMedicines();


// ========================================
// 9. ALERT CENTER
// ========================================

const ALERTS_STORAGE_KEY = "smriti_alerts_v1";

const dashboardSection =
    document.querySelector('.page-section[id="dashboard"]') ||
    document.querySelector(".page-section");

function loadAlerts() {
    try {
        const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not load saved alerts:", error);
        return [];
    }
}

let smritiAlerts = loadAlerts();
let alertEscalationTimers = {};

function saveAlerts() {
    try {
        localStorage.setItem(
            ALERTS_STORAGE_KEY,
            JSON.stringify(smritiAlerts)
        );
    } catch (error) {
        console.error("Could not save alerts:", error);
    }
}


// ========================================
// 10. CREATE ALERT CENTER
// ========================================

function createAlertCenter() {
    if (
        !dashboardSection ||
        document.getElementById("smriti-alert-center")
    ) {
        return;
    }

    const panel = document.createElement("section");

    panel.id = "smriti-alert-center";
    panel.className = "safety-card";

    panel.innerHTML = `
        <h3>SMRITI Alert Center</h3>
        <p>Review medication alerts in one place.</p>

        <div class="alert-demo-actions">
            <button
                type="button"
                id="demo-medication-alert"
                class="safety-test-btn">
                Simulate Medication Alert
            </button>
        </div>

        <p class="safety-note">
            Demonstration only. These controls do not send remote
            notifications or place phone calls.
        </p>

        <div id="smriti-alert-list" aria-live="polite"></div>
    `;

    dashboardSection.appendChild(panel);

    document
        .getElementById("demo-medication-alert")
        .addEventListener("click", () => {
            createSmritiAlert(
                "Medication",
                "A scheduled medication dose is due. Please review the medicine schedule."
            );
        });
}


// ========================================
// 11. CREATE AND SAVE ALERTS
// ========================================

function createSmritiAlert(type, message) {
    const alertRecord = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        message,
        createdAt: new Date().toISOString(),
        acknowledged: false,
        stage: 1,
        lastEscalatedAt: null
    };

    smritiAlerts.unshift(alertRecord);

    saveAlerts();
    renderSmritiAlerts();
    startAlertEscalation(alertRecord.id);
}

function formatAlertTime(isoTime) {
    return new Date(isoTime).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ========================================
// 12. DISPLAY ALERTS + DELETE OPTION
// ========================================

function renderSmritiAlerts() {
    const list = document.getElementById("smriti-alert-list");

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (smritiAlerts.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-state";
        empty.textContent =
            "No alerts yet. Use the demo button to test the workflow.";

        list.appendChild(empty);
        return;
    }

    smritiAlerts.forEach(alertRecord => {
        const card = document.createElement("div");

        card.className = "smriti-alert-item";

        card.style.cssText =
            "position:relative;margin-top:12px;padding:14px 52px 14px 14px;" +
            "border:1px solid #DCEAE4;border-radius:10px;" +
            "background:#F8FBF9;";

        const title = document.createElement("strong");

        title.textContent = alertRecord.acknowledged
            ? `${alertRecord.type} · Acknowledged`
            : `${alertRecord.type} · Alert ${alertRecord.stage}`;

        const message = document.createElement("p");

        message.textContent = alertRecord.message;
        message.style.margin = "8px 0";

        const time = document.createElement("small");

        time.textContent =
            `Created: ${formatAlertTime(alertRecord.createdAt)}`;

        card.append(title, message, time);

        // Delete button: appears when the notification is hovered or focused.
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "alert-delete-btn";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete notification";

        deleteButton.setAttribute(
            "aria-label",
            `Delete ${alertRecord.type} notification`
        );

        deleteButton.style.cssText =
            "position:absolute;top:12px;right:12px;width:30px;height:30px;" +
            "display:flex;align-items:center;justify-content:center;" +
            "border:1px solid #E8C9C4;border-radius:7px;" +
            "background:#FFF5F3;color:#A64D43;font-size:21px;line-height:1;" +
            "cursor:pointer;opacity:0;pointer-events:none;" +
            "transition:opacity .2s ease,background .2s ease;";

        const showDeleteButton = () => {
            deleteButton.style.opacity = "1";
            deleteButton.style.pointerEvents = "auto";
        };

        const hideDeleteButton = () => {
            deleteButton.style.opacity = "0";
            deleteButton.style.pointerEvents = "none";
        };

        card.addEventListener("mouseenter", showDeleteButton);

        card.addEventListener("mouseleave", () => {
            if (document.activeElement !== deleteButton) {
                hideDeleteButton();
            }
        });

        card.addEventListener("focusin", showDeleteButton);

        card.addEventListener("focusout", event => {
            if (!card.contains(event.relatedTarget)) {
                hideDeleteButton();
            }
        });

        deleteButton.addEventListener("mouseenter", () => {
            deleteButton.style.background = "#FCE7E3";
        });

        deleteButton.addEventListener("mouseleave", () => {
            deleteButton.style.background = "#FFF5F3";
        });

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                "Delete this notification from the alert history?"
            );

            if (!confirmed) {
                return;
            }

            clearAlertEscalation(alertRecord.id);

            smritiAlerts = smritiAlerts.filter(
                item => item.id !== alertRecord.id
            );

            saveAlerts();
            renderSmritiAlerts();
        });

        card.appendChild(deleteButton);

        if (!alertRecord.acknowledged) {
            const acknowledgeButton = document.createElement("button");

            acknowledgeButton.type = "button";
            acknowledgeButton.className = "medicine-action-btn";
            acknowledgeButton.textContent = "Acknowledge";
            acknowledgeButton.style.marginLeft = "12px";

            acknowledgeButton.addEventListener("click", () => {
                alertRecord.acknowledged = true;
                alertRecord.acknowledgedAt = new Date().toISOString();

                clearAlertEscalation(alertRecord.id);

                saveAlerts();
                renderSmritiAlerts();
            });

            card.appendChild(acknowledgeButton);
        } else {
            const acknowledgedAt = document.createElement("small");

            acknowledgedAt.textContent =
                ` · Acknowledged: ${formatAlertTime(alertRecord.acknowledgedAt)}`;

            card.appendChild(acknowledgedAt);
        }

        list.appendChild(card);
    });
}


// ========================================
// 13. DEMONSTRATION ESCALATION
// ========================================

// Each unacknowledged alert advances every 20 seconds.
// This is a foreground browser demo, not a real notification service.

function startAlertEscalation(alertId) {
    clearAlertEscalation(alertId);

    alertEscalationTimers[alertId] = setInterval(() => {
        const alertRecord = smritiAlerts.find(
            item => item.id === alertId
        );

        if (
            !alertRecord ||
            alertRecord.acknowledged ||
            alertRecord.stage >= 3
        ) {
            clearAlertEscalation(alertId);
            return;
        }

        alertRecord.stage += 1;
        alertRecord.lastEscalatedAt = new Date().toISOString();

        saveAlerts();
        renderSmritiAlerts();

        if (alertRecord.stage >= 3) {
            playDemoAlertTone();
            clearAlertEscalation(alertId);
        }
    }, 20000);
}

function clearAlertEscalation(alertId) {
    if (alertEscalationTimers[alertId]) {
        clearInterval(alertEscalationTimers[alertId]);
        delete alertEscalationTimers[alertId];
    }
}


// ========================================
// 14. DEMONSTRATION ALERT SOUND
// ========================================

let alertAudioContext = null;

function playDemoAlertTone() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            console.warn("Audio is not supported by this browser.");
            return;
        }

        if (!alertAudioContext) {
            alertAudioContext = new AudioContextClass();
        }

        if (alertAudioContext.state === "suspended") {
            alertAudioContext.resume();
        }

        const playBeep = (startTime, frequency) => {
            const oscillator = alertAudioContext.createOscillator();
            const gain = alertAudioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.exponentialRampToValueAtTime(
                0.12,
                startTime + 0.04
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                startTime + 0.35
            );

            oscillator.connect(gain);
            gain.connect(alertAudioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.36);
        };

        const now = alertAudioContext.currentTime;

        playBeep(now, 880);
        playBeep(now + 0.45, 1046);
        playBeep(now + 0.9, 880);

    } catch (error) {
        console.error("Could not play the demo alert tone:", error);
    }
}


// ========================================
// 15. INITIALIZE ALERT CENTER
// ========================================

createAlertCenter();
renderSmritiAlerts();


// Connect the existing Safety Alert Demonstration button in Settings.
const safetyAlertButton = document.getElementById("test-safety-alert");
const safetyAlertResult = document.getElementById("safety-alert-result");

if (safetyAlertButton && safetyAlertResult) {
    safetyAlertButton.addEventListener("click", () => {
        createSmritiAlert(
            "Safety demonstration",
            "A simulated safety event has been recorded. Please verify the situation."
        );

        safetyAlertResult.hidden = false;
        safetyAlertResult.textContent =
            "Demo alert generated successfully. Open the Dashboard to view it in the Alert Center.";
    });
}
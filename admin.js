// admin.js
// ================== CONFIG ==================
const API_BASE = "https://securepaytoprint-backend.onrender.com";

// ================== DOM ELEMENTS ==================
const resetMachineBtn = document.getElementById("resetMachineBtn");
const toggleMachineBtn = document.getElementById("toggleMachineBtn");

const machineStatusEl = document.getElementById("machineStatus");
const machineModeEl = document.getElementById("machineMode");

const currentSessionBox = document.getElementById("currentSessionBox");

// ================== GLOBAL STATE ==================
let machineEnabled = true;

// ================== MACHINE STATUS ==================
async function fetchMachineStatus() {
  try {
    const res = await fetch(`${API_BASE}/machine/status`);
    const data = await res.json();

    machineEnabled = data.enabled;
    updateMachineModeUI();
  } catch (err) {
    console.error("Failed to fetch machine status:", err);
    machineModeEl.innerText = "ERROR";
    machineModeEl.style.color = "red";
  }
}

function updateMachineModeUI() {
  if (machineEnabled) {
    machineModeEl.innerText = "ACTIVE";
    machineModeEl.style.color = "lime";
    toggleMachineBtn.innerText = "Disable Machine";
    toggleMachineBtn.style.background = "#ff1744";
  } else {
    machineModeEl.innerText = "MAINTENANCE";
    machineModeEl.style.color = "orange";
    toggleMachineBtn.innerText = "Enable Machine";
    toggleMachineBtn.style.background = "#00e676";
  }
}

// ================== TOGGLE MACHINE ==================
toggleMachineBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/admin/machine-toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !machineEnabled })
    });
    fetchMachineStatus();
  } catch (err) {
    alert("Unable to toggle machine status");
  }
});

// ================== EMERGENCY RESET ==================
resetMachineBtn.addEventListener("click", async () => {
  if (!confirm("This will stop current printing and reset the vending machine. Continue?")) return;

  try {
    await fetch(`${API_BASE}/admin/reset-machine`, {
      method: "POST"
    });
    alert("Machine reset successfully.");
  } catch (err) {
    alert("Failed to reset machine");
  }
});

// ================== CURRENT SESSION VIEW ==================
async function loadCurrentSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/current-session`);
    const data = await res.json();

    if (!data) {
      currentSessionBox.innerHTML = "<p>No active session</p>";
    } else {
      currentSessionBox.innerHTML = `
        <p><b>File:</b> ${data.fileName}</p>
        <p><b>Pages:</b> ${data.pages}</p>
        <p><b>Session ID:</b> ${data.sessionId}</p>
        <p><b>Started:</b> ${new Date(data.createdAt).toLocaleTimeString()}</p>
      `;
    }
  } catch (err) {
    currentSessionBox.innerHTML = "<p style='color:red'>Failed to fetch session</p>";
  }
}

// ================== MACHINE BUSY STATUS ==================
async function fetchBusyStatus() {
  try {
    const res = await fetch(`${API_BASE}/admin/status`);
    const data = await res.json();

    if (data.printerBusy) {
      machineStatusEl.innerText = "BUSY";
      machineStatusEl.style.color = "red";
    } else {
      machineStatusEl.innerText = "IDLE";
      machineStatusEl.style.color = "lime";
    }
  } catch (err) {
    machineStatusEl.innerText = "ERROR";
    machineStatusEl.style.color = "orange";
  }
}

// ================== AUTO REFRESH ==================
function startAdminMonitoring() {
  fetchMachineStatus();
  fetchBusyStatus();
  loadCurrentSession();

  setInterval(() => {
    fetchMachineStatus();
    fetchBusyStatus();
    loadCurrentSession();
  }, 2000);
}

// ================== INIT ==================
startAdminMonitoring();

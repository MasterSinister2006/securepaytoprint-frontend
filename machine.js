// ================= BASIC CONFIG =================
const API_BASE = "https://securepaytoprint-backend.onrender.com";
const FRONTEND_BASE = "https://securepaytoprint-frontend.netlify.app";

// ================= DOM ELEMENTS =================
const qrSection = document.getElementById("qrSection");
const optionsSection = document.getElementById("optionsSection");
const successSection = document.getElementById("successSection");

const backBtn = document.getElementById("backBtn");

const fileNameText = document.getElementById("fileNameText");
const detectedPagesText = document.getElementById("detectedPages");
const printPagesText = document.getElementById("printPages");

const totalAmountText = document.getElementById("totalAmount");
const copiesInput = document.getElementById("copiesInput");
const proceedBtn = document.getElementById("proceedBtn");

// ================= STATE =================
let currentSession = null;
let pollingInterval = null;

// ================= QR GENERATION =================
function generateUploadQR() {
  const qrContainer = document.getElementById("qrCode");
  qrContainer.innerHTML = "";

  const uploadURL = `${FRONTEND_BASE}/user.html`;

  new QRCode(qrContainer, {
    text: uploadURL,
    width: 180,
    height: 180,
    colorDark: "#5ef3c5",     // neon mint (matches UI)
    colorLight: "#0b1a2a",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ================= UI HELPERS =================
function switchScreen(showEl) {
  [qrSection, optionsSection, successSection].forEach(el => {
    el.classList.remove("active");
  });

  setTimeout(() => {
    showEl.classList.add("active");
  }, 80);
}

// ================= UI SCREENS =================
function showQRScreen() {
  switchScreen(qrSection);
  backBtn.style.display = "none";
  currentSession = null;
}

function showOptionsScreen(session) {
  switchScreen(optionsSection);
  backBtn.style.display = "block";

  fileNameText.innerText = session.fileName || "Unknown File";
  detectedPagesText.innerText = session.pages;
  printPagesText.innerText = session.pages;

  if (session.pages > 150) {
    alert("Maximum 150 pages allowed per print job.");
    showQRScreen();
    return;
  }

  calculateAmount(true);
}

function showSuccessScreen() {
  switchScreen(successSection);
  backBtn.style.display = "block";
}

// ================= AMOUNT CALCULATION =================
function bumpAmount() {
  totalAmountText.classList.remove("bump");
  void totalAmountText.offsetWidth; // reflow
  totalAmountText.classList.add("bump");
}

function calculateAmount(animate = false) {
  const pages = Number(detectedPagesText.innerText);
  const copies = Number(copiesInput.value);
  const type = document.querySelector("input[name='printType']:checked").value;

  const pricePerPage = type === "bw" ? 1 : 3;
  const total = pages * copies * pricePerPage;

  totalAmountText.innerText = total;

  if (animate) bumpAmount();
}

// ================= BACK BUTTON =================
backBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/reset-session`, { method: "POST" });
  } catch {}
  showQRScreen();
});

// ================= SESSION POLLING =================
async function pollForSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/sessions`);
    const sessions = await res.json();

    if (!sessions || sessions.length === 0) return;

    const latest = sessions[sessions.length - 1];

    if (!currentSession || currentSession.sessionId !== latest.sessionId) {
      currentSession = latest;
      showOptionsScreen(latest);
    }
  } catch (err) {
    console.error("Machine polling error:", err);
  }
}

function startPolling() {
  pollingInterval = setInterval(pollForSession, 2000);
}

// ================= EVENTS =================
document.querySelectorAll("input[name='printType']").forEach(radio => {
  radio.addEventListener("change", () => calculateAmount(true));
});

copiesInput.addEventListener("input", () => calculateAmount(true));

proceedBtn.addEventListener("click", async () => {
  showSuccessScreen();

  setTimeout(async () => {
    try {
      await fetch(`${API_BASE}/reset-session`, { method: "POST" });
    } catch {}
    showQRScreen();
  }, 3000);
});

// ================= INIT =================
generateUploadQR();
showQRScreen();
startPolling();
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
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ================= UI CONTROL =================
function showQRScreen() {
  qrSection.classList.add("active");
  optionsSection.classList.remove("active");
  successSection.classList.remove("active");

  backBtn.style.display = "none";
  currentSession = null;
}

function showOptionsScreen(session) {
  qrSection.classList.remove("active");
  optionsSection.classList.add("active");
  successSection.classList.remove("active");

  backBtn.style.display = "block";

  // Set values
  fileNameText.innerText = session.fileName || "Unknown File";
  detectedPagesText.innerText = session.pages;
  printPagesText.innerText = session.pages;

  // Enforce 150 page limit
  if (session.pages > 150) {
    alert("Maximum 150 pages allowed per print job. Please upload a smaller file.");
    showQRScreen();
    return;
  }

  calculateAmount();
}

function showSuccessScreen() {
  qrSection.classList.remove("active");
  optionsSection.classList.remove("active");
  successSection.classList.add("active");

  backBtn.style.display = "block";
}

// ================= AMOUNT CALCULATION =================
function calculateAmount() {
  const pages = Number(detectedPagesText.innerText);
  const copies = Number(copiesInput.value);
  const type = document.querySelector("input[name='printType']:checked").value;

  let pricePerPage = type === "bw" ? 1 : 3;

  const total = pages * copies * pricePerPage;
  totalAmountText.innerText = total;
}

// ================= BACK BUTTON =================
backBtn.addEventListener("click", async () => {
  await fetch(`${API_BASE}/reset-session`, { method: "POST" });
  showQRScreen();
});


// ================= SESSION POLLING =================
async function pollForSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/sessions`);
    const sessions = await res.json();

    if (sessions.length > 0) {
      const latest = sessions[sessions.length - 1];

      if (!currentSession || currentSession.sessionId !== latest.sessionId) {
        currentSession = latest;
        showOptionsScreen(latest);
      }
    }
  } catch (err) {
    console.error("Unable to reach backend from machine:", err);
  }
}

function startPolling() {
  pollingInterval = setInterval(pollForSession, 2000);
}

// ================= EVENTS =================
document.querySelectorAll("input[name='printType']").forEach(radio => {
  radio.addEventListener("change", calculateAmount);
});

copiesInput.addEventListener("input", calculateAmount);

proceedBtn.addEventListener("click", async () => {
  showSuccessScreen();

  setTimeout(async () => {
    await fetch(`${API_BASE}/reset-session`, { method: "POST" });
    showQRScreen();
  }, 3000);

  /*
    REAL PAYMENT FLOW:
    - Show QR
    - Verify transaction
    - Start printer
    - Countdown based on pages
  */
});



// ================= INITIALIZE =================
generateUploadQR();
showQRScreen();
startPolling();

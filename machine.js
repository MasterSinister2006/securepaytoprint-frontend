const API_BASE = "https://securepaytoprint-backend.onrender.com";
const FRONTEND_BASE = "https://securepaytoprint-frontend.netlify.app";

const qrSection = document.getElementById("qrSection");
const optionsSection = document.getElementById("optionsSection");
const successSection = document.getElementById("successSection");

const backBtn = document.getElementById("backBtn");
const detectedPagesSpan = document.getElementById("detectedPages");
const printPagesSpan = document.getElementById("printPages");
const totalAmountSpan = document.getElementById("totalAmount");
const copiesInput = document.getElementById("copiesInput");

let currentSession = null;

// Generate dynamic QR
function generateUploadQR() {
  const qrContainer = document.getElementById("qrCode");
  qrContainer.innerHTML = "";

  const uploadURL = `${FRONTEND_BASE}/user.html`;

  new QRCode(qrContainer, {
    text: uploadURL,
    width: 180,
    height: 180
  });
}

// Section control
function showQRSection() {
  qrSection.style.display = "block";
  optionsSection.style.display = "none";
  successSection.style.display = "none";
  backBtn.style.display = "none";
}

function showOptionsSection(session) {
  qrSection.style.display = "none";
  optionsSection.style.display = "block";
  successSection.style.display = "none";
  backBtn.style.display = "block";

  const pages = session.pages;

  if (pages > 150) {
    alert("Maximum 150 pages allowed.");
    showQRSection();
    return;
  }

  detectedPagesSpan.innerText = pages;
  printPagesSpan.innerText = pages;
  calculateAmount();
}

function showSuccessSection() {
  qrSection.style.display = "none";
  optionsSection.style.display = "none";
  successSection.style.display = "block";
  backBtn.style.display = "block";
}

// Amount calculation
function calculateAmount() {
  const pages = Number(detectedPagesSpan.innerText);
  const copies = Number(copiesInput.value);
  const type = document.querySelector("input[name='printType']:checked").value;

  let price = type === "bw" ? 1 : 3;
  const total = pages * copies * price;
  totalAmountSpan.innerText = total;
}

// Poll server
async function checkForSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/sessions`);
    const sessions = await res.json();

    if (sessions.length > 0 && !currentSession) {
      currentSession = sessions[sessions.length - 1];
      showOptionsSection(currentSession);
    }
  } catch (err) {
    console.error("Server not reachable from machine");
  }
}

setInterval(checkForSession, 2000);

// Events
document.querySelectorAll("input[name='printType']").forEach(radio => {
  radio.addEventListener("change", calculateAmount);
});

copiesInput.addEventListener("input", calculateAmount);

document.getElementById("proceedBtn").addEventListener("click", () => {
  /*
    REAL PAYMENT LOGIC WILL GO HERE:
    - Show payment QR
    - Verify payment
    - Start countdown based on pages
  */
  showSuccessSection();
});

backBtn.addEventListener("click", () => {
  window.location.reload();
});

// Init
generateUploadQR();
showQRSection();

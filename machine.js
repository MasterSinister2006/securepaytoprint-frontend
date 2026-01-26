// frontend/machine.js
const API_BASE = "https://securepaytoprint-backend.onrender.com/admin/sessions";

// Sections
const qrSection = document.getElementById("qrSection");
const optionsSection = document.getElementById("optionsSection");
const paymentSection = document.getElementById("paymentSection");
const printingSection = document.getElementById("printingSection");
const doneSection = document.getElementById("doneSection");

// Elements
const pagesSpan = document.getElementById("pages");
const amountSpan = document.getElementById("amount");
const payAmountText = document.getElementById("payAmountText");
const printPagesText = document.getElementById("printPagesText");
const paymentTimerSpan = document.getElementById("paymentTimer");
const printTimerSpan = document.getElementById("printTimer");

const copiesInput = document.getElementById("copies");
const proceedPaymentBtn = document.getElementById("proceedPayment");
const confirmPaymentBtn = document.getElementById("confirmPayment");

// Prices
const BW_PRICE = 1;
const COLOR_PRICE = 3;
const PRINT_TIME_PER_PAGE = 3; // seconds per page (DEMO RULE)

// State
let currentSession = null;
let pages = 0;
let printType = "bw";
let copies = 1;
let amount = 0;
let paymentCountdownInterval = null;
let printCountdownInterval = null;

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.reload();
});

// ===================================================
// 1. WAIT FOR SESSION (POLLING BACKEND)
// ===================================================
async function pollForSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/sessions`);
    const sessions = await res.json();

    if (sessions.length === 0) return;

    // Take the latest session created
    const latest = sessions[sessions.length - 1];

    // Only accept sessions that are still waiting
    if (latest.printStatus === "WAITING") {
      currentSession = latest;
      pages = latest.pages;

      pagesSpan.innerText = pages;

      showOptionsSection();
      calculateAmount();
    }

  } catch (err) {
    console.error("Polling error:", err);
  }
}

// Start polling every 3 seconds
setInterval(pollForSession, 3000);

// ===================================================
// UI SECTION CONTROLS
// ===================================================
function showQRSection() {
  qrSection.classList.remove("hidden");
  optionsSection.classList.add("hidden");
  paymentSection.classList.add("hidden");
  printingSection.classList.add("hidden");
  doneSection.classList.add("hidden");
}

function showOptionsSection() {
  qrSection.classList.add("hidden");
  optionsSection.classList.remove("hidden");
  paymentSection.classList.add("hidden");
  printingSection.classList.add("hidden");
  doneSection.classList.add("hidden");
}

function showPaymentSection() {
  qrSection.classList.add("hidden");
  optionsSection.classList.add("hidden");
  paymentSection.classList.remove("hidden");
  printingSection.classList.add("hidden");
  doneSection.classList.add("hidden");
}

function showPrintingSection() {
  qrSection.classList.add("hidden");
  optionsSection.classList.add("hidden");
  paymentSection.classList.add("hidden");
  printingSection.classList.remove("hidden");
  doneSection.classList.add("hidden");
}

function showDoneSection() {
  qrSection.classList.add("hidden");
  optionsSection.classList.add("hidden");
  paymentSection.classList.add("hidden");
  printingSection.classList.add("hidden");
  doneSection.classList.remove("hidden");
}

// Initial state
showQRSection();

// ===================================================
// 2. CALCULATE PRICE
// ===================================================
function calculateAmount() {
  const rate = printType === "bw" ? BW_PRICE : COLOR_PRICE;
  amount = pages * copies * rate;

  amountSpan.innerText = amount;
  payAmountText.innerText = amount;
}

// Print type selection
document.querySelectorAll("input[name='type']").forEach(radio => {
  radio.addEventListener("change", e => {
    printType = e.target.value;
    calculateAmount();
  });
});

// Copies change
copiesInput.addEventListener("input", e => {
  copies = Number(e.target.value);
  if (copies < 1) copies = 1;
  calculateAmount();
});

// ===================================================
// 3. PROCEED TO PAYMENT
// ===================================================
proceedPaymentBtn.addEventListener("click", () => {
  showPaymentSection();
  startPaymentCountdown(120); // 2 minutes
});

// ===================================================
// 4. PAYMENT COUNTDOWN (DEMO)
// ===================================================
function startPaymentCountdown(seconds) {
  let remaining = seconds;
  paymentTimerSpan.innerText = remaining;

  paymentCountdownInterval = setInterval(() => {
    remaining--;
    paymentTimerSpan.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(paymentCountdownInterval);
      alert("Payment time expired. Please try again.");
      showOptionsSection();
    }
  }, 1000);
}

// ===================================================
// 5. CONFIRM PAYMENT (DEMO BUTTON)
// ===================================================
confirmPaymentBtn.addEventListener("click", async () => {
  clearInterval(paymentCountdownInterval);

  try {
    const res = await fetch(`${API_BASE}/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: currentSession.sessionId,
        amount
      })
    });

    const data = await res.json();

    if (data.success) {
      startPrinting();
    }
  } catch (err) {
    console.error("Payment confirmation failed:", err);
  }
});

// ===================================================
// 6. START PRINTING
// ===================================================
async function startPrinting() {
  try {
    await fetch(`${API_BASE}/start-print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: currentSession.sessionId })
    });

    showPrintingSection();
    printPagesText.innerText = pages * copies;

    startPrintCountdown(pages * copies * PRINT_TIME_PER_PAGE);

  } catch (err) {
    console.error("Start print failed:", err);
  }
}

// ===================================================
// 7. PRINT COUNTDOWN (DEMO)
// ===================================================
function startPrintCountdown(seconds) {
  let remaining = seconds;
  printTimerSpan.innerText = remaining;

  printCountdownInterval = setInterval(async () => {
    remaining--;
    printTimerSpan.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(printCountdownInterval);

      try {
        await fetch(`${API_BASE}/finish-print`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSession.sessionId })
        });

        showDoneSection();

      } catch (err) {
        console.error("Finish print failed:", err);
      }
    }
  }, 1000);
}

const API_BASE = "https://securepaytoprint-backend.onrender.com/admin/sessions";

const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const uploadText = document.getElementById("uploadText");
const fileNameText = document.getElementById("fileName");
const pageCountText = document.getElementById("pageCount");
const uploadBtn = document.getElementById("uploadBtn");

let selectedFile = null;
let detectedPages = 0;

/* ============================
   File select handlers
============================ */

uploadArea.addEventListener("click", () => {
  fileInput.click();
});

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("drag");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("drag");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("drag");
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file) return;

  selectedFile = file;
  fileNameText.innerText = file.name;
  uploadText.innerText = "File Selected";

  detectPages(file);
}

/* ============================
   Detect pages from backend
============================ */

async function detectPages(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/create-session`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.sessionId) {
      alert("File is empty or unsupported.");
      return;
    }

    detectedPages = data.pages;
    pageCountText.innerText = detectedPages;

    // Save session for redirect
    uploadBtn.dataset.sessionId = data.sessionId;

  } catch (err) {
    console.error(err);
    alert("Unable to connect to server.");
  }
}

/* ============================
   Upload & redirect to machine
============================ */

uploadBtn.addEventListener("click", () => {
  const sessionId = uploadBtn.dataset.sessionId;

  if (!sessionId) {
    alert("Please upload a valid file first.");
    return;
  }

  // Redirect to machine screen
  window.location.href = `machine.html?session=${sessionId}`;
});

const API_BASE = "https://securepaytoprint-backend.onrender.com";

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const pagesText = document.getElementById("pages");
const uploadBtn = document.getElementById("uploadBtn");

let selectedFile = null;

fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files[0];
  if (selectedFile) {
    fileName.textContent = "Selected: " + selectedFile.name;
  }
});

uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`${API_BASE}/create-session`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    pagesText.textContent = "Detected Pages: " + data.pages;
    alert("Upload successful. Session ID: " + data.sessionId);

  } catch (err) {
    console.error(err);
    alert("Unable to connect to server.");
  }
});

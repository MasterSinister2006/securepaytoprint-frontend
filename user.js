const API_BASE = "https://securepaytoprint-backend.onrender.com";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileNameText = document.getElementById("fileName");

const uploadScreen = document.getElementById("uploadScreen");
const successScreen = document.getElementById("successScreen");

const successFileName = document.getElementById("successFileName");
const successPages = document.getElementById("successPages");
const backBtn = document.getElementById("backBtn");

let selectedFile = null;

// File selection
fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files[0];
  fileNameText.innerText = selectedFile
    ? selectedFile.name
    : "No file selected";
});

// Upload
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`${API_BASE}/create-session`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();

    // Switch UI
    uploadScreen.style.display = "none";
    successScreen.style.display = "block";

    successFileName.innerText = selectedFile.name;
    successPages.innerText = data.pages;

  } catch (err) {
    console.error(err);
    alert("Unable to connect to server.");
  }
});

// Back to upload
backBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  fileNameText.innerText = "No file selected";

  successScreen.style.display = "none";
  uploadScreen.style.display = "block";
});

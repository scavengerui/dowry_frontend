// Backend now same Vercel domain → no external URL needed
const BACKEND_BASE_URL = "";

const form = document.getElementById("dowry-form");
const fileInput = document.getElementById("photo-input");
const fileLabelText = document.getElementById("file-label-text");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  if (type) statusEl.classList.add(type);
}

function setResult(message) {
  if (!message) {
    resultEl.classList.add("hidden");
    resultEl.textContent = "";
    return;
  }
  resultEl.classList.remove("hidden");
  resultEl.textContent = message;
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  setResult("");
  if (!file) {
    fileLabelText.textContent = "Select Image";
    return;
  }
  fileLabelText.textContent = file.name;
});

let pendingFile = null;

const passwordModal = document.getElementById("password-modal");
const modalPasswordInput = document.getElementById("modal-password-input");
const modalSubmitBtn = document.getElementById("modal-submit-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    setStatus("Please select a photo first.", "error");
    return;
  }

  pendingFile = file;
  modalPasswordInput.value = "";
  passwordModal.classList.remove("hidden");
  modalPasswordInput.focus();
});

modalCancelBtn.addEventListener("click", () => {
  passwordModal.classList.add("hidden");
  pendingFile = null;
});

modalSubmitBtn.addEventListener("click", () => {
  const password = modalPasswordInput.value.trim();
  if (!password) {
    alert("Please enter a password.");
    return;
  }

  passwordModal.classList.add("hidden");
  sendToBackend(pendingFile, password);
});

modalPasswordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    modalSubmitBtn.click();
  }
});

async function sendToBackend(file, password) {
  const formData = new FormData();
  formData.append("face", file);
  formData.append("password", password);

  submitBtn.disabled = true;
  setStatus("Sending to AI, please wait…");
  setResult("");

  try {
    // 🔥 IMPORTANT: calling Vercel serverless backend
    const response = await fetch(`/api/calculate`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const maybeJson = await response
        .json()
        .catch(() => ({ error: `Server error (${response.status})` }));
      throw new Error(maybeJson.error || `Server error (${response.status})`);
    }

    const data = await response.json();

    if (!data || !data.result) {
      setStatus("Got a weird response from server.", "error");
      setResult("");
      return;
    }

    setStatus("AI replied with a dowry joke:", "success");
    setResult(data.result);

  } catch (err) {
    console.error(err);
    setStatus(err.message || "Something went wrong, please try again.", "error");
    setResult("");
  } finally {
    submitBtn.disabled = false;
    pendingFile = null;
  }
}
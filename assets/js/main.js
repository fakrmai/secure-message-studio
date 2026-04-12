// 🟢 STATUS UI
function showStatus(message, type = "success") {
  const status = document.getElementById("status");
  status.innerText = message;
  status.className = `status ${type}`;
  status.style.display = "block";
}

// ⏳ EFECTO LOADING
function loadingEffect(message = "Procesando...") {
  showStatus(message + " ⏳");
}

// ⌨️ EFECTO ESCRITURA
function typeEffect(element, text, speed = 20) {
  element.value = "";
  let i = 0;

  function typing() {
    if (i < text.length) {
      element.value += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

// 🖼️ OCULTAR MENSAJE
function hideMessage() {
  const rawMessage = document.getElementById("secretMessage").value;
  const key = document.getElementById("imageKey").value;
  const file = document.getElementById("imageInput").files[0];

  if (!rawMessage || !key || !file) {
    showStatus("Completa todos los campos", "error");
    return;
  }

  loadingEffect("Ocultando mensaje...");

  const message = CryptoJS.AES.encrypt(rawMessage, key).toString();
  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let binary = "";

      for (let i = 0; i < message.length; i++) {
        binary += message.charCodeAt(i).toString(2).padStart(8, "0");
      }

      binary += "1111111111111110";

      const maxBits = data.length / 4;
      if (binary.length > maxBits) {
        showStatus("Mensaje demasiado largo para esta imagen", "error");
        return;
      }

      for (let i = 0; i < binary.length; i++) {
        data[i * 4] = (data[i * 4] & 254) | parseInt(binary[i]);
      }

      ctx.putImageData(imageData, 0, 0);

      const output = document.getElementById("outputImage");
      output.src = canvas.toDataURL();
      output.style.display = "block";

      showStatus("Mensaje ocultado correctamente");
    };
  };

  reader.readAsDataURL(file);
}

// 🕵️ EXTRAER MENSAJE
function extractMessage() {
  const file = document.getElementById("imageInput").files[0];
  const key = document.getElementById("imageKey").value;

  if (!file || !key) {
    showStatus("Selecciona imagen y escribe clave", "error");
    return;
  }

  loadingEffect("Extrayendo mensaje...");

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let fullBinary = "";

      for (let i = 0; i < data.length; i += 4) {
        fullBinary += (data[i] & 1);

        if (fullBinary.endsWith("1111111111111110")) {
          fullBinary = fullBinary.slice(0, -16);
          break;
        }
      }

      let message = "";

      for (let i = 0; i < fullBinary.length; i += 8) {
        const byte = fullBinary.slice(i, i + 8);
        message += String.fromCharCode(parseInt(byte, 2));
      }

      try {
        const bytes = CryptoJS.AES.decrypt(message, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) throw new Error();

        showStatus("Mensaje: " + decrypted);
      } catch {
        showStatus("Error al descifrar (clave incorrecta)", "error");
      }
    };
  };

  reader.readAsDataURL(file);
}

// 💾 DESCARGAR
function downloadImage() {
  const img = document.getElementById("outputImage");

  if (!img.src) {
    showStatus("Primero genera una imagen", "error");
    return;
  }

  const link = document.createElement("a");
  link.href = img.src;
  link.download = "imagen_secreta.png";
  link.click();

  showStatus("Imagen descargada");
}

// 🧹 LIMPIAR
function clearImage() {
  const input = document.getElementById("imageInput");
  const output = document.getElementById("outputImage");

  input.value = "";
  output.src = "";
  output.style.display = "none";

  showStatus("Imagen eliminada");
}

// 🟢 DRAG & DROP
document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("imageInput");

  if (!dropZone) return;

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    fileInput.files = e.dataTransfer.files;

    showStatus("Imagen cargada correctamente");
  });
});

// 🔐 CIFRAR TEXTO
function encryptMessage() {
  console.log("CLICK DETECTADO");
  const message = document.getElementById("messageInput").value;
  const key = document.getElementById("keyInput").value;
  const output = document.getElementById("resultOutput");

  if (!message || !key) {
    showStatus("Faltan datos");
    return;
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();

    fakeLoading(output, encrypted);

    showStatus("Mensaje cifrado correctamente");
  } catch (err) {
    showStatus("Error al cifrar");
  }
}

// 🔓 DESCIFRAR TEXTO
function decryptMessage() {
  const message = document.getElementById("messageInput").value;
  const key = document.getElementById("keyInput").value;
  const output = document.getElementById("resultOutput");

  if (!message || !key) {
    showStatus("Faltan datos");
    return;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(message, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    fakeLoading(output, decrypted);

    showStatus("Mensaje descifrado correctamente");
  } catch (err) {
    showStatus("Error al descifrar");
  }
}

function copyResult() {
  const result = document.getElementById("resultOutput").value;

  if (!result) {
    showStatus("No hay nada para copiar");
    return;
  }

  navigator.clipboard.writeText(result)
    .then(() => {
      showStatus("Resultado copiado al portapapeles 📋");
    })
    .catch(() => {
      showStatus("Error al copiar");
    });
}

function toggleKey() {
  const input = document.getElementById("keyInput");
  const btn = document.getElementById("toggleKeyBtn");

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

function toggleImageKey() {
  const input = document.getElementById("imageKey");
  const btn = document.getElementById("toggleImageKeyBtn");

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

// 🟢 MATRIX EFFECT GOD MODE
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&";
const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];

for (let i = 0; i < columns; i++) {
  drops[i] = 1;
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff9f";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));

    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 33);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function fakeLoading(textarea, finalText) {
  let dots = "";
  textarea.value = "Encrypting";

  const interval = setInterval(() => {
    dots += ".";
    if (dots.length > 3) dots = "";
    textarea.value = "Encrypting" + dots;
  }, 300);

  setTimeout(() => {
    clearInterval(interval);
    textarea.value = finalText;
  }, 1500);
}

function copyResult() {
  const textarea = document.getElementById("resultOutput");

  if (!textarea.value) {
    showStatus("No hay nada para copiar");
    return;
  }

  textarea.select();
  textarea.setSelectionRange(0, 99999);

  try {
    document.execCommand("copy");
    showStatus("Resultado copiado al portapapeles 📋");
  } catch (err) {
    showStatus("Error al copiar");
  }
}
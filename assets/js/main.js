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

// 🔐 CIFRAR
function encryptMessage() {
  const text = document.getElementById("text").value;
  const key = document.getElementById("key").value;

  if (!text || !key) {
    showStatus("Escribe mensaje y clave", "error");
    return;
  }

  loadingEffect("Cifrando mensaje...");

  setTimeout(() => {
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();

    typeEffect(document.getElementById("result"), encrypted);

    showStatus("Mensaje cifrado correctamente");
  }, 300);
}

// 🔓 DESCIFRAR
function decryptMessage() {
  const text = document.getElementById("text").value;
  const key = document.getElementById("key").value;

  if (!text || !key) {
    showStatus("Escribe mensaje y clave", "error");
    return;
  }

  loadingEffect("Descifrando mensaje...");

  setTimeout(() => {
    try {
      const bytes = CryptoJS.AES.decrypt(text, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) throw new Error();

      typeEffect(document.getElementById("result"), decrypted);

      showStatus("Mensaje descifrado correctamente");
    } catch {
      showStatus("Clave incorrecta o texto inválido", "error");
    }
  }, 300);
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

      // 🔥 VALIDACIÓN DE TAMAÑO
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
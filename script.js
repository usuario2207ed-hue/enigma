let publicKey, privateKey;

async function generateKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 4096, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );
  publicKey = keyPair.publicKey;
  privateKey = keyPair.privateKey;
}

function buf2str(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function str2buf(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

document.getElementById("encryptBtn").addEventListener("click", async () => {
  const plaintext = document.getElementById("plaintext").value;
  const enc = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, enc.encode(plaintext));
  document.getElementById("encrypted").value = buf2str(encrypted);
});

document.getElementById("decryptBtn").addEventListener("click", async () => {
  const encrypted = str2buf(document.getElementById("encrypted").value);
  const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
  document.getElementById("decrypted").value = new TextDecoder().decode(decrypted);
});

generateKeys();

const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');

function isImageFile(filename) {
  const lower = filename.toLowerCase();
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.svg');
}

function openModal(filename, title) {
  if (filename.includes('..')) {
    alert('Arquivo inválido.');
    return;
  }

  modalTitle.textContent = title || filename;

  modalBody.innerHTML = '';

  const encoded = encodeURI(filename);

  if (isImageFile(filename)) {
    const img = document.createElement('img');
    img.alt = title || filename;
    img.src = encoded;
    img.onload = () => {};
    img.onerror = () => {
      modalBody.innerHTML = '<div style="padding:1rem;">Não foi possível carregar a imagem.</div>';
    };
    modalBody.appendChild(img);
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = encoded;
    iframe.title = title || filename;
    iframe.onload = () => {};
    iframe.onerror = () => {
      modalBody.innerHTML = '<div style="padding:1rem;">Não foi possível carregar o arquivo.</div>';
    };
    modalBody.appendChild(iframe);
  }

  modalOverlay.style.display = 'flex';
  modalOverlay.setAttribute('aria-hidden', 'false');

  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  modalOverlay.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
  document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.style.display === 'flex') closeModal();
});

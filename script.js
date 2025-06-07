const video = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const loader = document.getElementById('loader');

// Fungsi untuk meminta akses kamera
function requestCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // agar tidak fullscreen di iOS
      video.play();
      loader.innerText = "Arahkan kamera ke QR Code...";
      // Hapus tombol jika sudah ada
      removeButtons();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      console.error("Error mengakses kamera:", err);
      if (err.name === "NotAllowedError") {
        loader.innerText = "Akses kamera ditolak. Silakan aktifkan akses kamera di browser Anda.";
        // Tampilkan tombol untuk membuka dengan Chrome
        showOpenWithChromeButton();
      } else {
        loader.innerText = "Tidak dapat mengakses kamera.";
      }
    });
}

// Fungsi untuk menampilkan tombol "Buka dengan Chrome"
function showOpenWithChromeButton() {
  // Hapus tombol yang ada sebelumnya
  removeButtons();

  // Buat tombol
  const openWithChromeBtn = document.createElement('a');
  openWithChromeBtn.href = window.location.href;
  openWithChromeBtn.innerText = "Buka dengan Chrome";
  openWithChromeBtn.className = "button";
  openWithChromeBtn.onclick = function(event) {
    event.preventDefault();
    window.location.href = "intent://xvannn07.github.io/qr-scanner#Intent;scheme=http;package=com.android.chrome;end";
  };

  // Tambahkan tombol ke loader
  loader.appendChild(openWithChromeBtn);
}

// Fungsi untuk menghapus tombol yang ada
function removeButtons() {
  const existingButtons = document.querySelectorAll('.button');
  existingButtons.forEach(btn => btn.remove());
}

// Panggil fungsi untuk pertama kali
requestCamera();

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loader.style.display = "none";
    
    // Sesuaikan ukuran canvas dengan video
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    
    // Ambil data gambar dari canvas
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    
    // Deteksi QR Code menggunakan jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      console.log("QR Code terdeteksi:", code.data);
      // Hentikan stream kamera setelah QR Code terdeteksi
      video.srcObject.getTracks().forEach(track => track.stop());
      // Arahkan browser ke URL yang ada pada data QR
      window.location.href = code.data;
      return;
    }
  }
  requestAnimationFrame(tick);
}

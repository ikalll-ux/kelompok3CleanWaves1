// ==========================================================================
// CleanWaves — index.js
// Logika khusus landing page (index.html): hero slider, navigasi antar
// section dalam satu halaman, tabel harga dinamis, dan pelacakan status
// laundry via nomor struk (TANPA perlu login).
//
// Data transaksi/nota dibaca dari localStorage key "laundry_orders", yaitu
// sumber data yang sama yang ditulis oleh admin.js saat admin merilis
// transaksi baru di halaman admin. Dengan begini nomor struk yang diberikan
// admin ke pelanggan langsung bisa dilacak di halaman ini.
// ==========================================================================

let currentHeroIndex = 0;

// --- INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    // Deteksi hash URL (misal index.html#tracking)
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash) {
        navigateTo(currentHash);
    }

    // Auto-play slider hero setiap 5 detik
    setInterval(() => {
        nextHero();
    }, 5000);

    // Render tabel harga dari data layanan yang sama dipakai admin
    renderHargaTable();
});

// --- NAVIGATION CORE CONTROL (antar section dalam 1 halaman) ---
function navigateTo(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.classList.add('animate-fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.location.hash = pageId;
    }
}

// --- LAYOUT SLIDER MULTI-HERO ---
function showHero(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');

    if (index >= slides.length) currentHeroIndex = 0;
    if (index < 0) currentHeroIndex = slides.length - 1;

    slides.forEach((slide, i) => {
        if (i === currentHeroIndex) {
            slide.classList.add('active');
            dots[i].style.opacity = "1";
        } else {
            slide.classList.remove('active');
            dots[i].style.opacity = "0.4";
        }
    });
}

function nextHero() {
    currentHeroIndex++;
    showHero(currentHeroIndex);
}

function prevHero() {
    currentHeroIndex--;
    showHero(currentHeroIndex);
}

function setHero(index) {
    currentHeroIndex = index;
    showHero(currentHeroIndex);
}

// --- DAFTAR HARGA (bersumber dari data layanan yang sama dengan admin) ---
function getServiceList() {
    const stored = localStorage.getItem('laundry_services');
    if (stored) return JSON.parse(stored);

    // Data layanan default (dipakai juga oleh admin.js & order.js jika localStorage kosong)
    return [
        { id: "reguler", name: "Cuci Kiloan Reguler", unit: "kg", price: 10000, eta: "2 - 3 Hari" },
        { id: "kilat", name: "Cuci Kiloan Kilat", unit: "kg", price: 18000, eta: "24 Jam" },
        { id: "satuan", name: "Cuci Satuan Kemeja", unit: "pcs", price: 15000, eta: "2 Hari" },
        { id: "jas", name: "Cuci Jas Premium", unit: "pcs", price: 65000, eta: "3 Hari" },
        { id: "bedcover", name: "Bed Cover Large", unit: "pcs", price: 35000, eta: "2 Hari" }
    ];
}

function renderHargaTable() {
    const tbody = document.getElementById('hargaTableBody');
    if (!tbody) return;
    const services = getServiceList();

    tbody.innerHTML = services.map(s => `
        <tr>
            <td class="p-4">${s.name}</td>
            <td class="p-4">${s.eta}</td>
            <td class="p-4 text-right font-medium text-sky-600">Rp ${s.price.toLocaleString('id-ID')} / ${s.unit}</td>
        </tr>
    `).join('');
}

// --- TRACKING STATUS VIA NOMOR STRUK (TANPA LOGIN) ---
// Membaca langsung nota yang diterbitkan admin (localStorage "laundry_orders")
function checkOrderStatus() {
    const trackIdInput = document.getElementById('trackInput').value.trim().toUpperCase();

    if (trackIdInput === "") {
        alert("Silakan masukkan nomor struk terlebih dahulu!");
        return;
    }

    const allOrders = JSON.parse(localStorage.getItem('laundry_orders') || '{}');
    const orderData = allOrders[trackIdInput];

    if (!orderData) {
        alert("Nomor struk tidak ditemukan! Pastikan format benar (Contoh: NOTA-1025), atau tanyakan ke petugas outlet.");
        document.getElementById('trackingResultBox').classList.add('hidden');
        document.getElementById('defaultTrackInfo').classList.remove('hidden');
        return;
    }

    // Render Detail Data Profil Order
    document.getElementById('resOrderId').innerText = orderData.id;
    document.getElementById('resOrderNama').innerText = orderData.customerName;
    document.getElementById('resOrderPaket').innerText = orderData.serviceType;

    // Render Visual Progres Linimasa Status Pemesanan (deskripsi ikut kode operator, bukan nama asli)
    updateTimelineVisual(orderData.status, orderData.operatorCode);

    document.getElementById('trackingResultBox').classList.remove('hidden');
    document.getElementById('defaultTrackInfo').classList.add('hidden');
}

// Mengatur status kelas CSS + teks deskripsi pada komponen timeline berdasarkan status nota
function updateTimelineVisual(status, operatorCode) {
    const steps = ['antrian', 'cuci', 'setrika', 'siap'];
    steps.forEach(s => {
        document.getElementById(`step-${s}`).classList.remove('step-active');
    });

    const opLabel = operatorCode || 'operator kami';

    // Deskripsi status: khusus tahap cuci & setrika menyebutkan kode operator (bukan nama asli)
    document.getElementById('desc-antrian').innerText =
        "Pesanan telah diterima outlet dan menunggu giliran proses pencucian.";
    document.getElementById('desc-cuci').innerText =
        `Pakaian Anda sedang dicuci dan ditangani oleh ${opLabel}.`;
    document.getElementById('desc-setrika').innerText =
        `Pakaian Anda sedang disetrika/dirapikan oleh ${opLabel}.`;
    document.getElementById('desc-siap').innerText =
        "Pakaian sudah di-packing rapi dalam plastik tersegel wangi dan siap diambil/diantar.";

    const order = ['antrian', 'cuci', 'setrika', 'siap'];
    const activeUntil = order.indexOf(status);
    for (let i = 0; i <= activeUntil; i++) {
        document.getElementById(`step-${order[i]}`).classList.add('step-active');
    }
}

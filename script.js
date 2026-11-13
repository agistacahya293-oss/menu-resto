// Objek untuk menyimpan daftar pesanan: { "Nama Menu": { harga: 28000, jumlah: 2 } }
let pesanan = {};

// Otomatis membaca nomor meja dari URL jika dibuka lewat QR Code (contoh: index.html?meja=05)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mejaDariQR = urlParams.get('meja');
    
    if (mejaDariQR) {
        const inputMeja = document.getElementById('nomor-meja');
        inputMeja.value = mejaDariQR;
        inputMeja.readOnly = true; // Mengunci nomor meja agar tidak salah ubah
        inputMeja.style.backgroundColor = '#e5e7eb';
    }
});

// Fungsi menyaring kategori menu
function filterMenu(kategori, tombolAktif) {
    const cards = document.querySelectorAll('.menu-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    tombolAktif.classList.add('active');

    cards.forEach(card => {
        if (kategori === 'semua' || card.getAttribute('data-kategori') === kategori) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Fungsi menambah atau mengurangi porsi menu
function ubahJumlah(namaMenu, harga, perubahan) {
    if (!pesanan[namaMenu]) {
        pesanan[namaMenu] = { harga: harga, jumlah: 0 };
    }

    pesanan[namaMenu].jumlah += perubahan;

    // Pastikan jumlah tidak kurang dari 0
    if (pesanan[namaMenu].jumlah <= 0) {
        delete pesanan[namaMenu];
        document.getElementById(`qty-${namaMenu}`).innerText = '0';
    } else {
        document.getElementById(`qty-${namaMenu}`).innerText = pesanan[namaMenu].jumlah;
    }

    perbaruiKeranjang();
}

// Fungsi menghitung ulang total porsi dan total tagihan
function perbaruiKeranjang() {
    let totalPorsi = 0;
    let totalBayar = 0;

    for (let menu in pesanan) {
        totalPorsi += pesanan[menu].jumlah;
        totalBayar += pesanan[menu].harga * pesanan[menu].jumlah;
    }

    const checkoutBar = document.getElementById('checkout-bar');
    if (totalPorsi > 0) {
        checkoutBar.style.display = 'flex';
        document.getElementById('total-porsi').innerText = `${totalPorsi} Porsi dipilih`;
        document.getElementById('total-bayar').innerText = `Rp ${totalBayar.toLocaleString('id-ID')}`;
    } else {
        checkoutBar.style.display = 'none';
    }
}

// Fungsi mengirim rincian pesanan ke WhatsApp Kasir
function kirimPesananWA() {
    const nomorMeja = document.getElementById('nomor-meja').value.trim();
    const namaPemesan = document.getElementById('nama-pemesan').value.trim() || 'Pelanggan';
    const catatan = document.getElementById('catatan').value.trim();

    if (!nomorMeja) {
        alert('Harap isi Nomor Meja terlebih dahulu!');
        document.getElementById('nomor-meja').focus();
        return;
    }

    const nomorWAKasir = '6281234567890'; // Ganti dengan nomor WhatsApp restoran
    let pesan = `*PESANAN BARU - RESTO NUSANTARA*\n`;
    pesan += `📍 *Meja:* ${nomorMeja}\n`;
    pesan += `👤 *Nama:* ${namaPemesan}\n`;
    pesan += `------------------------------------\n`;

    let totalTagihan = 0;
    let nomorUrut = 1;

    for (let menu in pesanan) {
        const item = pesanan[menu];
        const subtotal = item.harga * item.jumlah;
        totalTagihan += subtotal;
        pesan += `${nomorUrut}. ${menu} (${item.jumlah}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
        nomorUrut++;
    }

    pesan += `------------------------------------\n`;
    if (catatan) {
        pesan += `📝 *Catatan:* ${catatan}\n`;
    }
    pesan += `💰 *TOTAL BAYAR: Rp ${totalTagihan.toLocaleString('id-ID')}*`;

    const urlWA = `https://wa.me{nomorWAKasir}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
}

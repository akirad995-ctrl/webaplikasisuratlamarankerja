const form = document.getElementById("suratForm");
const hasil = document.getElementById("hasilSurat");

const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");

const fotoInput = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");

let sedangMenggambar = false;
let tandaTanganAda = false;
let fotoData = "";

ctx.strokeStyle = "#29243e";
ctx.lineWidth = 2.5;
ctx.lineCap = "round";
ctx.lineJoin = "round";

// Mengambil nilai input
function ambil(id) {
    return document.getElementById(id).value.trim();
}

// Menggambar tanda tangan dengan mouse atau layar sentuh
function posisi(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
    };
}

canvas.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    sedangMenggambar = true;
    canvas.setPointerCapture(event.pointerId);

    const p = posisi(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
});

canvas.addEventListener("pointermove", function(event) {
    if (!sedangMenggambar) return;

    event.preventDefault();

    const p = posisi(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    tandaTanganAda = true;
});

function selesaiMenggambar() {
    sedangMenggambar = false;
}

canvas.addEventListener("pointerup", selesaiMenggambar);
canvas.addEventListener("pointercancel", selesaiMenggambar);

// Menghapus tanda tangan
document.getElementById("hapusTtd").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tandaTanganAda = false;
});

// Mengunggah foto
fotoInput.addEventListener("change", function() {
    const file = fotoInput.files[0];

    fotoData = "";
    previewFoto.hidden = true;

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Pilih foto berformat JPG, PNG, atau WebP.");
        fotoInput.value = "";
        return;
    }

    if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran foto maksimal 3 MB.");
        fotoInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        fotoData = reader.result;
        previewFoto.src = fotoData;
        previewFoto.hidden = false;
    };

    reader.readAsDataURL(file);
});

// Membuat surat lamaran
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nama = ambil("nama");
    const lahir = ambil("lahir");
    const alamat = ambil("alamat");
    const email = ambil("email");
    const telepon = ambil("telepon");
    const perusahaan = ambil("perusahaan");
    const alamatPerusahaan = ambil("alamatPerusahaan");
    const posisiDilamar = ambil("posisi");
    const pendidikan = ambil("pendidikan");
    const keahlian = ambil("keahlian");

    const tanggal = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Membersihkan pratinjau sebelumnya
    hasil.replaceChildren();

    // Membuat paragraf dengan aman
    function paragraf(teks, className = "") {
        const p = document.createElement("p");
        p.textContent = teks;

        if (className) {
            p.className = className;
        }

        hasil.appendChild(p);
        return p;
    }

    paragraf("Jakarta, " + tanggal);

    paragraf(
        "Kepada Yth.\nHRD " + perusahaan +
        "\n" + alamatPerusahaan
    );

    paragraf("Perihal: Lamaran Pekerjaan " + posisiDilamar, "judul");

    paragraf("Dengan hormat,");

    paragraf(
        "Berdasarkan informasi lowongan pekerjaan yang tersedia, " +
        "saya bermaksud mengajukan lamaran untuk posisi " +
        posisiDilamar + " di " + perusahaan + "."
    );

    paragraf(
        "Berikut data diri saya:\n" +
        "Nama: " + nama + "\n" +
        "Tempat, tanggal lahir: " + lahir + "\n" +
        "Alamat: " + alamat + "\n" +
        "Email: " + email + "\n" +
        "Nomor HP: " + telepon + "\n" +
        "Pendidikan terakhir: " + pendidikan
    );

    paragraf(
        "Saya memiliki keahlian sebagai berikut:\n" +
        keahlian + ". Saya bersedia terus belajar, mengembangkan " +
        "kemampuan, serta menjalankan tanggung jawab pekerjaan dengan baik."
    );

    paragraf(
        "Sebagai bahan pertimbangan, saya siap melengkapi dokumen " +
        "pendukung yang diperlukan. Saya berharap mendapat kesempatan " +
        "untuk mengikuti tahap seleksi berikutnya."
    );

    paragraf(
        "Demikian surat lamaran ini saya sampaikan. Atas perhatian " +
        "Bapak/Ibu, saya mengucapkan terima kasih."
    );

    paragraf("Hormat saya,");

    // Menampilkan tanda tangan
    if (tandaTanganAda) {
        const gambarTtd = document.createElement("img");
        gambarTtd.src = canvas.toDataURL("image/png");
        gambarTtd.alt = "Tanda tangan pelamar";
        gambarTtd.className = "ttd-surat";
        hasil.appendChild(gambarTtd);
    } else {
        paragraf("\n\n");
    }

    paragraf(nama);

    // Menampilkan foto jika diunggah
    if (fotoData) {
        paragraf("Lampiran: Foto diri");

        const gambarFoto = document.createElement("img");
        gambarFoto.src = fotoData;
        gambarFoto.alt = "Foto diri pelamar";
        gambarFoto.className = "foto-lampiran";

        hasil.appendChild(gambarFoto);
    }
});

// Menyalin surat
document.getElementById("salin").addEventListener("click", async function() {
    if (!hasil.querySelector("p") || hasil.querySelector(".empty-state")) {
        alert("Buat surat terlebih dahulu.");
        return;
    }

    try {
        await navigator.clipboard.writeText(hasil.innerText);
        alert("Surat berhasil disalin!");
    } catch (error) {
        alert("Gagal menyalin. Coba buka website melalui HTTPS.");
    }
});

// Mencetak atau menyimpan sebagai PDF
document.getElementById("cetak").addEventListener("click", function() {
    if (hasil.querySelector(".empty-state")) {
        alert("Buat surat terlebih dahulu.");
        return;
    }

    window.print();
});
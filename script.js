document.addEventListener('DOMContentLoaded', function() {
    
    // ====== I. REFERENSI ELEMEN HTML ======
    
    const navBeranda = document.getElementById('navBeranda');
    const navDaftarBuku = document.getElementById('navDaftarBuku');
    const navTambahBuku = document.getElementById('navTambahBuku');
    
    const dashboardSection = document.getElementById('dashboard');
    const daftarBukuSection = document.getElementById('daftar-buku');
    const tambahBukuSection = document.getElementById('tambah-buku');

    const formTambahBuku = document.getElementById('formTambahBuku');
    const judulBukuInput = document.getElementById('judulBuku');
    const penulisBukuInput = document.getElementById('penulisBuku');
    const isbnBukuInput = document.getElementById('isbnBuku');
    const pesanError = document.getElementById('pesanError');
    
    const inputCari = document.getElementById('input-cari');
    const tombolCari = document.getElementById('tombolCari');
    const bodyTabelBuku = document.getElementById('bodyTabelBuku');
    const pesanKosongBuku = document.getElementById('pesanKosongBuku');
    const tabelDaftarBuku = document.getElementById('tabelDaftarBuku');

    // ====== II. VARIABEL DAN KONSTANTA ======
    
    const STORAGE_KEY = 'books';
    let currentBooks = []; // Array global untuk menyimpan data yang sedang aktif

    // ====== III. FUNGSI LOCAL STORAGE (CRUD DASAR) ======

    function loadBooksFromLocalStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        try {
            return serializedData === null ? [] : JSON.parse(serializedData);
        } catch (e) {
            console.error("Error parsing JSON dari Local Storage. Data mungkin rusak. Menghapus data lama.", e);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    function updateLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBooks));
    }
    
    // ====== IV. FUNGSI NAVIGASI DAN TOGGLE ======

    function showSection(sectionToShow) {
        // Sembunyikan semua, tampilkan yang dipilih
        [dashboardSection, daftarBukuSection, tambahBukuSection].forEach(section => {
            section.style.display = (section === sectionToShow) ? 'block' : 'none';
        });
        
        // KRUSIAL: Muat data terbaru dan render jika menuju Daftar Buku
        if (sectionToShow === daftarBukuSection) {
             currentBooks = loadBooksFromLocalStorage(); // MUAT ULANG DATA TERBARU
             renderBooksToTable(currentBooks);
             // Reset pencarian saat pindah halaman
             inputCari.value = '';
        }
        
        sectionToShow.scrollIntoView({ behavior: 'smooth' });
    }

    // ====== V. FUNGSI RENDER DAN MANIPULASI DATA ======

    function renderBooksToTable(booksArray) {
        bodyTabelBuku.innerHTML = ''; 

        // Tampilkan/Sembunyikan pesan kosong dan tabel
        if (booksArray.length === 0) {
            pesanKosongBuku.style.display = 'block';
            tabelDaftarBuku.style.display = 'none';
        } else {
            pesanKosongBuku.style.display = 'none';
            tabelDaftarBuku.style.display = 'table';
        }

        // Iterasi dan sisipkan baris
        booksArray.forEach((book, index) => {
            const row = document.createElement('tr');
            if (book.isComplete) {
                row.classList.add('book-complete');
            }

            row.innerHTML = `
                <td>${index + 1}</td> 
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.isComplete ? 'Selesai Dibaca' : 'Belum Selesai'}</td>
                <td>
                    <button class="toggle-status-btn" data-id="${book.id}">
                        ${book.isComplete ? 'Tandai Belum' : 'Tandai Selesai'}
                    </button>
                    <button class="delete-book-btn" data-id="${book.id}">Hapus</button>
                </td>
            `;
            bodyTabelBuku.appendChild(row);
        });

        addTableButtonListeners(); 
    }
    
    function addTableButtonListeners() {
        document.querySelectorAll('.toggle-status-btn').forEach(button => {
            button.addEventListener('click', function() {
                toggleBookStatus(parseInt(this.dataset.id));
            });
        });

        document.querySelectorAll('.delete-book-btn').forEach(button => {
            button.addEventListener('click', function() {
                deleteBook(parseInt(this.dataset.id));
            });
        });
    }
    
    function toggleBookStatus(bookId) {
        const bookIndex = currentBooks.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            currentBooks[bookIndex].isComplete = !currentBooks[bookIndex].isComplete; 
            updateLocalStorage(); // Simpan perubahan status
            renderBooksToTable(currentBooks); 
        }
    }

    function deleteBook(bookId) {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
            currentBooks = currentBooks.filter(book => book.id !== bookId); 
            updateLocalStorage(); // Simpan array baru
            renderBooksToTable(currentBooks); 
        }
    }
    
    function filterBooks(booksArray, searchTerm) {
        if (!searchTerm) {
            return booksArray;
        }

        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        
        return booksArray.filter(book => {
            const normalizedTitle = book.title.toLowerCase();
            const normalizedAuthor = book.author.toLowerCase();
            const isbnString = String(book.isbn);

            // Filter Judul ATAU Penulis ATAU ISBN
            return normalizedTitle.includes(normalizedSearchTerm) || 
                   normalizedAuthor.includes(normalizedSearchTerm) ||
                   isbnString.includes(normalizedSearchTerm);
        });
    }
    
    // ====== VI. FUNGSI RENDER STATISTIK DASHBOARD (BARU/TIDAK ADA) ======
    
    // FUNGSI INI PERLU DITAMBAHKAN UNTUK MELENGKAPI DASHBOARD
    function renderDashboardStats() {
        const totalBuku = currentBooks.length;
        const selesaiDibaca = currentBooks.filter(book => book.isComplete).length;
        const belumSelesai = totalBuku - selesaiDibaca;
        
        const ringkasanStatistik = document.getElementById('ringkasan-statistik');
        
        // Memastikan elemen ada sebelum merender
        if (ringkasanStatistik) {
             ringkasanStatistik.innerHTML = `
                <p>Total Buku dalam Koleksi: <strong>${totalBuku}</strong></p>
                <p style="color: green;">Selesai Dibaca: <strong>${selesaiDibaca}</strong></p>
                <p style="color: orange;">Belum Selesai Dibaca: <strong>${belumSelesai}</strong></p>
             `;
        }
    }


    // ====== VII. EVENT LISTENERS (NAVIGASI, FORM, SEARCH) ======

    // Navigasi
    navBeranda.addEventListener('click', (e) => { 
        e.preventDefault(); 
        currentBooks = loadBooksFromLocalStorage(); // Muat data terbaru
        renderDashboardStats(); // Render statistik sebelum menampilkan dashboard
        showSection(dashboardSection); 
    });
    navDaftarBuku.addEventListener('click', (e) => { e.preventDefault(); showSection(daftarBukuSection); });
    navTambahBuku.addEventListener('click', (e) => { e.preventDefault(); showSection(tambahBukuSection); });

    // Formulir Submit dan Validasi
    formTambahBuku.addEventListener('submit', function(event) {
        event.preventDefault(); 

        let isValid = true; 
        pesanError.style.display = 'none'; 
        
        [judulBukuInput, penulisBukuInput, isbnBukuInput].forEach(input => input.classList.remove('error-field'));

        // Cek validasi
        if (judulBukuInput.value.trim() === '') { isValid = false; judulBukuInput.classList.add('error-field'); }
        if (penulisBukuInput.value.trim() === '') { isValid = false; penulisBukuInput.classList.add('error-field'); }
        if (isbnBukuInput.value.trim() === '') { isValid = false; isbnBukuInput.classList.add('error-field'); }

        if (!isValid) {
            pesanError.textContent = 'Mohon isi semua field yang wajib diisi!';
            pesanError.style.display = 'block';
        } else {
            // Formulir Valid: Buat dan Simpan Objek Buku
            const newBook = {
                id: Date.now(), 
                title: judulBukuInput.value.trim(),
                author: penulisBukuInput.value.trim(),
                isbn: isbnBukuInput.value.trim(),
                isComplete: false
            };
            
            // 1. TAMBAHKAN ke array GLOBAL currentBooks
            currentBooks.push(newBook); 
            console.log("Buku baru ditambahkan ke array:", currentBooks); // <-- TAMBAHKAN INI
            
            // 2. SIMPAN array GLOBAL yang sudah diperbarui ke Local Storage
            updateLocalStorage(); 
            
            formTambahBuku.reset(); 
            
            // 3. Pindah ke Daftar Buku, yang akan memicu render ulang
            showSection(daftarBukuSection); 
        }
    });
    
    // Pencarian
    // ====== VII. EVENT LISTENERS (NAVIGASI, FORM, SEARCH) ======
// ... (kode sebelumnya) ...

// Pencarian
tombolCari.addEventListener('click', function() {
    const searchTerm = inputCari.value;
    // PENTING: Selalu muat data terbaru dari Local Storage saat akan memfilter
    const allBooks = loadBooksFromLocalStorage(); 
    const booksToRender = filterBooks(allBooks, searchTerm); 
    renderBooksToTable(booksToRender);

    if (booksToRender.length === 0 && searchTerm) {
        // Pesan jika tidak ditemukan hasil
        document.getElementById('pesanKosongBuku').textContent = `Tidak ditemukan buku dengan kata kunci "${searchTerm}".`;
    } else {
        // Pesan default jika tidak ada buku
        document.getElementById('pesanKosongBuku').textContent = `Belum ada buku dalam koleksi Anda.`;
    }
});

inputCari.addEventListener('keyup', function(event) {
    if (inputCari.value.trim() === '') {
         // Jika input kosong, tampilkan semua buku (refresh data global)
         currentBooks = loadBooksFromLocalStorage(); // MUAT ULANG DATA TERBARU
         renderBooksToTable(currentBooks);
         // Pastikan pesan kosong kembali ke default
         document.getElementById('pesanKosongBuku').textContent = `Belum ada buku dalam koleksi Anda.`;
    } else if (event.key === 'Enter') {
        tombolCari.click();
    }
});


    // ====== VIII. INISIALISASI (Awal Aplikasi) ======
    
    currentBooks = loadBooksFromLocalStorage(); // Muat data awal
    renderDashboardStats(); // Tampilkan statistik awal
    showSection(dashboardSection); // Tampilkan dashboard saat aplikasi dimuat

});
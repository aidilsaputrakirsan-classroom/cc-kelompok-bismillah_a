# User Interface Testing Results

Kegiatan ini bertujuan untuk melakukan pengujian terhadap antarmuka pengguna (UI) dengan menjalankan seluruh alur fitur pada aplikasi guna memastikan setiap fungsi dapat berjalan dengan baik, memastikan bahwa integrasi antara frontend dan API berjalan dengan benar serta seluruh fitur CRUD dapat digunakan tanpa kesalahan. Pengujian dilakukan dengan mensimulasikan aktivitas pengguna seperti membuka aplikasi, menambahkan data, mengedit data, mencari data, hingga menghapus data. 

---

## Ringkasan Hasil Pengujian

Jumlah skenario pengujian : 10

| Berhasil | Gagal | 
|------|------|
| 10   | 0    | 

Berdasarkan hasil pengujian yang dilakukan, seluruh fitur aplikasi dapat berjalan dengan baik sesuai dengan yang diharapkan.

---

## Daftar Skenario Pengujian

### 1. Cek Koneksi API

**Tujuan :** Pengujian ini bertujuan untuk memastikan aplikasi dapat dijalankan melalui browser dan berhasil terhubung dengan backend API.

**Hasil :** 

<img src="image/apiconnect.jpeg" />

Berdasarkan hasil pengujian, halaman utama aplikasi berhasil ditampilkan dengan indikator API Connected pada bagian header, yang menandakan bahwa koneksi antara frontend dan backend telah berjalan dengan baik.

---

### 2. Menampilkan Daftar Item

**Tujuan :** Pengujian ini bertujuan untuk memastikan item yang tersimpan di database dapat ditampilkan pada halaman utama aplikasi.

**Hasil :** 

<img src="image/items.jpeg" />

Berdasarkan hasil pengujian, beberapa item seperti Keyboard Mechanical, Laptop, dan Mouse Wireless berhasil ditampilkan dalam bentuk kartu yang berisi nama item, harga, deskripsi, jumlah stok, serta tombol Edit dan Hapus. Hal ini menunjukkan bahwa data dari database berhasil dimuat dan ditampilkan pada daftar item di aplikasi.

---

### 3. Menambahkan Item Baru

**Tujuan :** Pengujian ini bertujuan untuk memastikan fitur penambahan item melalui form pada halaman aplikasi dapat digunakan untuk menyimpan data item baru ke dalam sistem.

**Hasil :** 

<img src="image/tambah.jpeg" />

Berdasarkan pengujian yang dilakukan, form Tambah Item Baru berhasil diisi dengan data item berupa nama Hp, harga 200000, deskripsi baru, dan jumlah stok 5. Kemudian, data tersebut dikirim melalui tombol Tambah Item untuk menunjukkan bahwa form penambahan item dapat digunakan dengan baik.

---

### 4. Memastikan Item Baru Muncul di Daftar

**Tujuan :** Pengujian ini bertujuan untuk memastikan item yang baru ditambahkan melalui form berhasil disimpan dan ditampilkan pada daftar item di halaman aplikasi.

**Hasil :** 

<img src="image/newitem.jpeg" />

Berdasarkan hasil pengujian, item dengan nama Hp berhasil muncul pada daftar item dengan informasi harga Rp 200.000, deskripsi baru, dan jumlah stok 5. Hal ini menunjukkan bahwa data item yang ditambahkan telah berhasil disimpan dan ditampilkan pada sistem.

---

### 5. Memperbarui Data Item

**Tujuan :** Pengujian ini bertujuan untuk memastikan fitur edit item dapat digunakan untuk mengubah data item yang sudah ada pada sistem.

**Hasil :** 

<img src="image/edit.jpeg" />

Berdasarkan hasil pengujian, setelah tombol Edit dipilih, halaman menampilkan form Edit Item yang berisi data item sebelumnya seperti nama Hp Samsung, harga 200000, deskripsi Samsung A30, dan jumlah stok 5. Hal ini menunjukkan bahwa data item berhasil dimuat ke dalam form untuk dilakukan proses pengeditan. Kemudian, dilakukan pengeditan pada harga dan jumlah stok untuk memastikan fitur edit dapat digunakan dengan baik.

---

### 6. Memastikan Item Berhasil Diperbarui

**Tujuan :** Pengujian ini bertujuan untuk memastikan perubahan data item melalui fitur Edit dapat disimpan dan ditampilkan pada daftar item

**Hasil :** 

<img src="image/newupdate.jpeg" />

Berdasarkan hasil pengujian, setelah data item diperbarui melalui form edit, item berhasil ditampilkan kembali pada daftar dengan informasi yang telah diperbarui, yaitu nama Hp Samsung, harga Rp 1.000.000, deskripsi Samsung A30, dan jumlah stok 10. Hal ini menunjukkan bahwa proses pembaruan data item berhasil dilakukan.

---

### 7. Mencari Data Item

**Tujuan :** Pengujian ini bertujuan untuk memastikan fitur pencarian item dapat digunakan untuk menemukan item berdasarkan nama atau deskripsi.

**Hasil :** 

<img src="image/search.jpeg" />

Berdasarkan hasil pengujian, ketika kata kunci “Hp” dimasukkan pada kolom pencarian, sistem berhasil menampilkan item yang sesuai yaitu Hp Samsung dengan informasi harga Rp 1.000.000, deskripsi Samsung A30, dan jumlah stok 10. Hal ini menunjukkan bahwa fitur pencarian item pada aplikasi berfungsi dengan baik.

---

### 8. Cek Dialog Konfirmasi Penghapusan

**Tujuan :** Pengujian ini bertujuan untuk memastikan sistem menampilkan dialog konfirmasi sebelum item dihapus dari daftar.

**Hasil :** 

<img src="image/confirm.jpeg" />

Berdasarkan hasil pengujian, ketika tombol Hapus pada item dipilih, sistem menampilkan dialog konfirmasi dengan pesan “Yakin ingin menghapus 'Hp Samsung'?” serta pilihan OK dan Cancel. Hal ini menunjukkan bahwa fitur konfirmasi penghapusan item berfungsi dengan baik sebelum proses penghapusan dilakukan.

---

### 9. Item Terhapus dari Daftar

**Tujuan :** Pengujian ini bertujuan untuk memastikan item yang telah dikonfirmasi untuk dihapus tidak lagi ditampilkan pada daftar item di aplikasi.

**Hasil :** 

<img src="image/delete.jpeg" />

Berdasarkan hasil pengujian, setelah tombol OK pada dialog konfirmasi dipilih, item Hp Samsung tidak lagi muncul pada daftar item. Hal ini menunjukkan bahwa proses penghapusan data berhasil dilakukan dan item telah dihapus dari sistem.

---

### 10. Menampilkan Tampilan Data Kosong

**Tujuan :** Pengujian ini bertujuan untuk memastikan aplikasi menampilkan tampilan data kosong ketika tidak ada item yang tersimpan di dalam sistem.

**Hasil :** 

<img src="image/empty.jpeg" />

Berdasarkan hasil pengujian, setelah seluruh item dihapus dari daftar, halaman aplikasi menampilkan pesan “Belum ada item. Gunakan form di atas untuk menambahkan item pertama.” pada area daftar item. Hal ini menunjukkan bahwa tampilan data kosong muncul dengan baik ketika tidak ada data item yang tersedia.






















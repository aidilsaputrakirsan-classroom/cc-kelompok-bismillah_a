# dokumentasi hasil testing semua endpoint via Swagger/Thunder Client
<img src="/image/1.png" /> 
<img src="/image/2.png" /> 
<img src="/image/3.png" /> 
    Pada gambar tersebut ditunjukkan proses mengirim request POST melalui Swagger untuk menambahkan item baru ke dalam sistem menggunakan format JSON. Swagger digunakan untuk mencoba atau menguji API secara langsung tanpa harus membuat tampilan aplikasi terlebih dahulu.
    Pengguna diminta untuk mengisi beberapa data item seperti name(nama barang), price(harga), description(deskripsi), dan quantity(jumlah stok).
    Setelah data diisi, pilih Execute untuk mengirim request ke server. Server kemudian menerima data tersebut, melakukan validasi, dan menyimpannya ke dalam database sebagai item baru. Jika berhasil, server akan mengirimkan respon yang menandakan bahwa data item telah berhasil ditambahkan ke sistem.

<img src="/image/4.png" /> 
<img src="/image/5.png" /> 
<img src="/image/6.png" /> 
    Pada gambar tersebut ditunjukkan proses mengirim request GET melalui Swagger untuk mengambil daftar item yang ada di sistem. 
    Pada contoh di gambar, nilai skip diisi 0 yang berarti tidak ada data yang dilewati, limit diisi 20 yang berarti maksimal 20 data akan ditampilkan, dan search diisi kata "laptop" untuk mencari item yang berkaitan dengan laptop. Setelag diisi, lalu pilih Execute untuk mengirim request ke server.
    Server kemudian akan memproses permintaan tersebut, mencari data item yang sesuai dengan kata kunci, lalu mengembalikan respon berupa daftar item yang ditemukan dari database. Dengan cara ini pengguna dapat melihat data item yang tersedia serta melakukan pencarian dengan lebih mudah.

<img src="/image/7.png" /> 
<img src="/image/8.png" />
<img src="/image/9.png" />
    Pada gambar tersebut ditunjukkan proses mengirim request GET melalui Swagger untuk mengambil satu data item berdasarkan ID.
    Pada contoh digambar, item_id diisi dengan angka 1, yang berarti sistem akan mengambil data item dengan ID tersebut.
    Setelah itu pilih Execute, maka server akan memproses permintaan dan menampilkan detail item dengan ID 1 dari database. Jika ID tersebut tidak ditemukan, biasanya server akan mengembalikan pesan bahwa data tidak tersedia.

<img src="/image/10.png" /> 
<img src="/image/11.png" />
<img src="/image/12.png" />  
    Pada gambar tersebut menunjukkan proses mengirim request PUT melalui Swagger untuk memperbarui data item berdasarkan ID.
    item_id digunakan untuk menentukan item mana yang akan diupdate. Pada contoh di gambar, item_id diisi dengan angka 1, yang berarti sistem akan memperbarui data item dengan ID tersebut.
    Di bagian request body, pengguna mengirim data yang ingin diubah. Pada contoh hanya mengubah price menjadi 140000, sehingga sistem hanya akan memperbarui harga item tersebut tanpa mengubah data lainnya.
    Setelah itu pilih Execute, maka server akan memproses permintaan, memperbarui data item di database, lalu mengembalikan respon bahwa data berhasil di perbarui.

<img src="/image/13.png" /> 
<img src="/image/14.png" /> 
    Gambar tersebut menunjukkan proses mengirim request DELETE melalui Swagger untuk menghapus data item berdasarkan ID.
    item_id harus diisi untuk menentukan item mana yang akan dihapus. Pada contoh di gambar, item_id diisi dengan angka 1, yang berarti sistem akan menghapus item dengan ID tersebut dari database.
    Setelah itu pilih Execute, server akan memproses permintaan dan menghapus data item tersebut. Kalau berhasil, server akan mengirimkan respon bahwa item telah berhasil di hapus dari sistem.

<img src="/image/15.png" /> 
    Gambar tersebut menunjukkan tampilan Swagger UI yang digunakan untuk menguji endpoint API GET /items/stats pada server lokal dengan alamat http://127.0.0.1:8000. Endpoint ini berfungsi untuk menampilkan statistik data inventori yang tersimpan di dalam sistem. Pada bagian parameters terlihat bahwa endpoint ini tidak memerlukan parameter tambahan, sehingga pengguna dapat langsung menjalankan permintaan dengan memilih Execute. Setelah permintaan dikirim, server memberikan response dengan kode 200, yang menandakan bahwa permintaan berhasil diproses.
    Hasil respons ditampilkan dalam format JSON yang berisi beberapa informasi statistik, yaitu total_items yang menunjukkan jumlah keseluruhan item dalam inventori sebanyak 3, serta total_value yang menunjukkan total nilai seluruh barang sebesar 8.460.000. Selain itu, sistem juga menampilkan informasi mengenai barang dengan harga paling mahal (most_expensive) yaitu Laptop dengan harga 1.400.000, serta barang dengan harga paling murah (cheapest) yaitu Mouse Wireless dengan harga 250.000. Informasi ini membantu pengguna untuk melihat ringkasan kondisi inventori secara cepat dan terstruktur melalui satu endpoint API.
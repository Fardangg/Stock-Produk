document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const printReceiptButton = document.getElementById('printReceiptButton');
    const modal = document.getElementById("myModal");
    const modalContent = document.querySelector(".modal-content");
    const productListContent = document.getElementById("productListContent");
    const closeButton = document.querySelector(".close");

    // Load products from localStorage
    loadProducts();

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        const productStock = document.getElementById('productStock').value;
        
        addProductToTable(productName, productPrice, productStock);
        saveProduct(productName, productPrice, productStock);
        productForm.reset();
    });

    printReceiptButton.addEventListener('click', function() {
        window.location.href = 'invoince.html'; // Mengarahkan ke invoice.html saat tombol cetak nota ditekan
    });

    closeButton.addEventListener('click', function() {
        closeModal();
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    function printReceipt() {
        const productList = getProductList();
        productListContent.innerHTML = productList.join("<br>");
        openModal();
    }

    function openModal() {
        modal.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function getProductList() {
        const productList = [];
        const rows = productTable.rows;
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            const productName = cells[0].textContent;
            const productPrice = cells[1].textContent;
            const productStock = cells[2].textContent;
            productList.push(`${productName} - Price: ${productPrice}, Stock: ${productStock}`);
        }
        return productList;
    }

    function addProductToTable(name, price, stock) {
        const newRow = productTable.insertRow();
        
        const nameCell = newRow.insertCell(0);
        const priceCell = newRow.insertCell(1);
        const stockCell = newRow.insertCell(2);
        const actionCell = newRow.insertCell(3);
    
        nameCell.textContent = name;
        priceCell.textContent = price;
        stockCell.textContent = stock;
    
        const decreaseStockButton = document.createElement('button');
        decreaseStockButton.textContent = '-1 Stock';
        decreaseStockButton.addEventListener('click', function() {
            let currentStock = parseInt(stockCell.textContent);
            if (currentStock > 0) {
                currentStock--;
                stockCell.textContent = currentStock;
                updateProduct(name, price, currentStock);
            }
        });
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            productTable.deleteRow(newRow.rowIndex - 1);
            deleteProduct(name);
        });
    
        const addToInvoiceButton = document.createElement('button'); // Tombol Tambah ke Nota
        addToInvoiceButton.textContent = `Tambah ke Nota (${getProductCount()})`; // Tampilkan jumlah produk di samping tombol
        addToInvoiceButton.addEventListener('click', function() {
            addToInvoice(name, price, stock);
        });
    
        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');
        actionButtons.appendChild(decreaseStockButton);
        actionButtons.appendChild(deleteButton);
        actionButtons.appendChild(addToInvoiceButton); // Menambahkan tombol Tambah ke Nota
    
        actionCell.appendChild(actionButtons);
    }
    
    // Fungsi untuk mendapatkan jumlah produk di invoice
    function getProductCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return cart.length;
    }

    function saveProduct(name, price, stock) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({ name, price, stock });
        localStorage.setItem('products', JSON.stringify(products));
    }

    function updateProduct(name, price, stock) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.map(product => 
            product.name === name ? { name, price, stock } : product
        );
        localStorage.setItem('products', JSON.stringify(products));
    }

    function deleteProduct(name) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(product => product.name !== name);
        localStorage.setItem('products', JSON.stringify(products));
    }

    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.forEach(product => {
            addProductToTable(product.name, product.price, product.stock);
        });
    }

    function addToInvoice(name, price, stock) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({ title: name, price: parseFloat(price), stock: parseInt(stock) });
        localStorage.setItem('cart', JSON.stringify(cart));
        loadProductFromLocalStorage(); // Muat ulang informasi barang di invoice setelah menambahkan produk
    }

    function loadProductFromLocalStorage() {
        const productList = document.getElementById('product-list');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Bersihkan konten sebelum memuat ulang
        productList.innerHTML = '';

        // Buat elemen baru untuk setiap barang dan tambahkan ke daftar barang di invoice
        cart.forEach(item => {
            const row = document.createElement('tr');
            const descriptionCell = document.createElement('td');
            const priceCell = document.createElement('td');

            descriptionCell.textContent = `${item.title} `; // Nama dan deskripsi barang
            priceCell.textContent = item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }); // Harga barang

            row.appendChild(descriptionCell);
            row.appendChild(priceCell);

            productList.appendChild(row);
        });

        // Hitung kembali total belanja setelah produk ditambahkan
        calculateTotal();
    }

    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
        localStorage.setItem('total', total);
    }
});

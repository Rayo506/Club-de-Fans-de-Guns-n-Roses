document.addEventListener('DOMContentLoaded', function () {
    // Controla el marketplace y el carrito
    var container = document.getElementById('productos-contenedor-js');
    var searchInput = document.getElementById('buscar-productos');
    var typeInput = document.getElementById('filtro-type');
    var cartButton = document.getElementById('btn-ver-carrito');
    var cartPanel = document.getElementById('carrito-panel');
    var cartList = document.getElementById('carrito-lista');
    var cartCount = document.getElementById('carrito-contador');
    var buyButton = document.getElementById('btn-comprar-carrito');
    var cartMessage = document.getElementById('carrito-mensaje');
    var productMessage = document.getElementById('productos-mensaje');
    var allProducts = [];

    // Muestra mensajes de productos
    function setProductMessage(text, isError) {
        if (!productMessage) {
            return;
        }
        productMessage.textContent = text;
        productMessage.className = isError ? 'mensaje-eventos mensaje-error' : 'mensaje-eventos mensaje-ok';
    }

    function setCartMessage(text) {
        if (cartMessage) {
            cartMessage.textContent = text;
        }
    }

    // Lee y guarda el carrito en localStorage
    function readCart() {
        try {
            return JSON.parse(localStorage.getItem('gnr_cart') || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('gnr_cart', JSON.stringify(cart));
    }

    // Pinta el carrito con los productos guardados
    function renderCart() {
        var cart = readCart();
        if (cartCount) {
            cartCount.textContent = String(cart.length);
        }
        if (!cartList) {
            return;
        }
        cartList.innerHTML = '';
        if (cart.length === 0) {
            var empty = document.createElement('p');
            empty.textContent = 'El carrito está vacío.';
            cartList.appendChild(empty);
            return;
        }
        cart.forEach(function (item, index) {
            var row = document.createElement('div');
            row.className = 'carrito-fila';

            var name = document.createElement('span');
            name.textContent = item.nombre + ' - ' + GNR_API.formatPrice(item.precio);

            // Permite eliminar productos del carrito
            var removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn-eliminar-carrito';
            removeButton.textContent = 'Eliminar';
            removeButton.addEventListener('click', function () {
                var updatedCart = readCart();
                updatedCart.splice(index, 1);
                saveCart(updatedCart);
                setCartMessage('Producto eliminado del carrito');
                renderCart();
            });

            row.appendChild(name);
            row.appendChild(removeButton);
            cartList.appendChild(row);
        });
    }

    // Solo deja añadir un producto cada vez al carrito
    function addToCart(product) {
        var cart = readCart();
        if (cart.length > 0) {
            if (String(cart[0].id) === String(product.id)) {
                setCartMessage('Ese producto ya está en el carrito');
            } else {
                setCartMessage('Solo puedes comprar un producto cada vez. Elimina el producto actual para añadir otro');
            }
            if (cartPanel) {
                cartPanel.style.display = 'block';
            }
            return;
        }
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio
        });
        saveCart(cart);
        setCartMessage('Producto añadido al carrito');
        renderCart();
        if (cartPanel) {
            cartPanel.style.display = 'block';
        }
    }

    // Crea cada tarjeta de producto desde JavaScript
    function createProductCard(product) {
        var article = document.createElement('article');
        article.className = 'tarjeta-producto';

        var imageContainer = document.createElement('div');
        imageContainer.className = 'producto-img-contenedor';
        var image = document.createElement('img');
        image.src = GNR_API.productImage(product);
        image.alt = product.nombre;
        imageContainer.appendChild(image);

        var details = document.createElement('div');
        details.className = 'producto-detalles';
        var title = document.createElement('h3');
        title.className = 'producto-nombre';
        title.textContent = product.nombre;

        var meta = document.createElement('div');
        meta.className = 'producto-meta';
        var price = document.createElement('span');
        price.className = 'producto-precio';
        price.textContent = GNR_API.formatPrice(product.precio);
        var viewLink = document.createElement('a');
        viewLink.href = 'detalle-producto.html?id=' + product.id;
        viewLink.className = 'link-ver-producto';
        viewLink.textContent = 'Ver';
        meta.appendChild(price);
        meta.appendChild(viewLink);

        var category = document.createElement('p');
        category.className = 'producto-categoria';
        category.textContent = GNR_API.formatProductCategory(product.categoria) + ' | ' + product.estado;

        details.appendChild(title);
        details.appendChild(meta);
        details.appendChild(category);

        var buttonContainer = document.createElement('div');
        buttonContainer.className = 'carrito-button-contenedor';
        var addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn-añadir-carrito';
        addButton.textContent = 'Añadir carrito';
        addButton.addEventListener('click', function () {
            addToCart(product);
        });
        buttonContainer.appendChild(addButton);

        article.appendChild(imageContainer);
        article.appendChild(details);
        article.appendChild(buttonContainer);
        return article;
    }

    // Filtra productos por texto y categoria
    function filteredProducts() {
        var search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var type = typeInput ? typeInput.value : 'todos';
        return allProducts.filter(function (product) {
            var matchesSearch = !search || product.nombre.toLowerCase().indexOf(search) !== -1 || product.descripcion.toLowerCase().indexOf(search) !== -1;
            var matchesType = type === 'todos' || product.categoria === type;
            return matchesSearch && matchesType;
        });
    }

    // Pinta los productos que coinciden con la busqueda
    function renderProducts() {
        if (!container) {
            return;
        }
        container.innerHTML = '';
        var products = filteredProducts();
        if (products.length === 0) {
            var empty = document.createElement('p');
            empty.textContent = 'No hay productos que coincidan con la búsqueda.';
            container.appendChild(empty);
            return;
        }
        products.forEach(function (product) {
            container.appendChild(createProductCard(product));
        });
        var clear = document.createElement('div');
        clear.style.clear = 'both';
        container.appendChild(clear);
    }

    // Carga los productos aprobados desde el backend
    function loadProducts() {
        GNR_API.request('/products').then(function (data) {
            allProducts = data.products || [];
            renderProducts();
        }).catch(function (error) {
            setProductMessage(error.message, true);
        });
    }

    // El boton del carrito enseña u oculta el panel
    if (cartButton && cartPanel) {
        cartButton.addEventListener('click', function () {
            cartPanel.style.display = cartPanel.style.display === 'block' ? 'none' : 'block';
        });
    }

    // La compra solo muestra un mensaje porque no esta implementada
    if (buyButton) {
        buyButton.addEventListener('click', function () {
            setCartMessage('La compra todavía no está disponible.');
        });
    }

    [searchInput, typeInput].forEach(function (input) {
        if (input) {
            input.addEventListener('input', renderProducts);
            input.addEventListener('change', renderProducts);
        }
    });

    renderCart();
    loadProducts();
});

document.addEventListener('DOMContentLoaded', function () {
    // Carga el id del producto desde la URL
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    var message = document.getElementById('detalle-producto-mensaje');
    var addButton = document.getElementById('btn-agregar-carrito-detalle');
    var currentProduct = null;

    // Muestra avisos del detalle del producto
    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-eventos mensaje-error' : 'mensaje-eventos mensaje-ok';
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

    // Pinta en pantalla los datos del producto
    function renderProduct(product) {
        currentProduct = product;
        GNR_API.setText('producto-titulo', product.nombre);
        GNR_API.setText('producto-vendedor', product.vendedor);
        GNR_API.setText('producto-precio', GNR_API.formatPrice(product.precio));
        GNR_API.setText('producto-categoria', GNR_API.formatProductCategory(product.categoria));
        GNR_API.setText('producto-estado', product.estado);
        GNR_API.setText('producto-descripcion', product.descripcion);

        var image = document.getElementById('producto-imagen');
        if (image) {
            image.src = GNR_API.productImage(product);
            image.alt = product.nombre;
        }
    }

    // Si no hay id de producto, se muestra un error
    if (!productId) {
        setMessage('No se ha indicado el producto', true);
        if (addButton) {
            addButton.disabled = true;
        }
        return;
    }

    // Pide al backend la informacion del producto
    GNR_API.request('/products/' + productId).then(function (data) {
        renderProduct(data.product);
    }).catch(function (error) {
        setMessage(error.message, true);
        if (addButton) {
            addButton.disabled = true;
        }
    });

    if (addButton) {
        // Añade el producto al carrito si esta vacio
        addButton.addEventListener('click', function () {
            if (!currentProduct) {
                return;
            }
            var cart = readCart();
            // No deja meter mas de un producto en el carrito
            if (cart.length > 0) {
                // Tambien evita añadir dos veces el mismo producto
                if (String(cart[0].id) === String(currentProduct.id)) {
                    setMessage('Ese producto ya está en el carrito', true);
                } else {
                    setMessage('Solo puedes comprar un producto cada vez. Elimina el producto actual del carrito para añadir otro', true);
                }
                return;
            }
            cart.push({
                id: currentProduct.id,
                nombre: currentProduct.nombre,
                precio: currentProduct.precio
            });
            saveCart(cart);
            setMessage('Producto añadido al carrito', false);
        });
    }
});

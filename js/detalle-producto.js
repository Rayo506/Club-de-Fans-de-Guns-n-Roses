document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    var message = document.getElementById('detalle-producto-mensaje');
    var addButton = document.getElementById('btn-agregar-carrito-detalle');
    var currentProduct = null;

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-eventos mensaje-error' : 'mensaje-eventos mensaje-ok';
    }

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

    if (!productId) {
        setMessage('No se ha indicado el producto', true);
        if (addButton) {
            addButton.disabled = true;
        }
        return;
    }

    GNR_API.request('/products/' + productId).then(function (data) {
        renderProduct(data.product);
    }).catch(function (error) {
        setMessage(error.message, true);
        if (addButton) {
            addButton.disabled = true;
        }
    });

    if (addButton) {
        addButton.addEventListener('click', function () {
            if (!currentProduct) {
                return;
            }
            var cart = readCart();
            if (cart.length > 0) {
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

document.addEventListener('DOMContentLoaded', function () {
    // Controla el formulario para subir un producto
    var form = document.getElementById('form-subir-producto');
    var message = document.getElementById('subir-producto-mensaje');
    var seller = document.getElementById('subir-producto-vendedor');

    // Muestra mensajes del formulario de producto
    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-form mensaje-error' : 'mensaje-form mensaje-ok';
    }

    // Primero comprueva que el usuario este logeado
    GNR_API.getMe().then(function (data) {
        if (seller) {
            seller.textContent = data.user.nombre + ' (' + data.user.email + ')';
        }
    }).catch(function () {
        window.location.href = 'login.html';
    });

    if (!form) {
        return;
    }

    // Recoge los datos escritos del producto
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var payload = {
            nombre: document.getElementById('producto-nombre-input').value.trim(),
            precio: document.getElementById('producto-precio-input').value,
            categoria: document.getElementById('producto-categoria-input').value,
            estado: document.getElementById('producto-estado-input').value.trim(),
            imagen_url: document.getElementById('producto-imagen-input').value.trim(),
            descripcion: document.getElementById('producto-descripcion-input').value.trim()
        };

        // Envia el producto al backend para que quede pendiente de validacion
        GNR_API.request('/products', {
            method: 'POST',
            body: JSON.stringify(payload)
        // Si se sube bien, redirige al detalle del producto
        }).then(function (data) {
            setMessage(data.message, false);
            form.reset();
            window.setTimeout(function () {
                window.location.href = 'detalle-producto.html?id=' + data.product.id;
            }, 800);
        }).catch(function (error) {
            setMessage(error.message, true);
            // Si falta sesion, manda al login
            if (error.status === 401) {
                window.location.href = 'login.html';
            }
        });
    });
});

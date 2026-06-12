document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('form-crear-evento');
    var message = document.getElementById('crear-evento-mensaje');
    var creador = document.getElementById('crear-evento-creador');

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-form mensaje-error' : 'mensaje-form mensaje-ok';
    }

    GNR_API.getMe().then(function (data) {
        if (creador) {
            creador.textContent = data.user.nombre + ' (' + data.user.email + ')';
        }
    }).catch(function () {
        window.location.href = 'login.html';
    });

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            setMessage('Enviando evento a moderación...', false);

            var payload = {
                titulo: document.getElementById('evento-titulo-input').value.trim(),
                fecha: document.getElementById('evento-fecha-input').value,
                hora: document.getElementById('evento-hora-input').value,
                localizacion: document.getElementById('evento-localizacion-input').value.trim(),
                precio: document.getElementById('evento-precio-input').value,
                plazas_totales: document.getElementById('evento-plazas-input').value,
                imagen_url: document.getElementById('evento-imagen-input').value.trim(),
                descripcion: document.getElementById('evento-descripcion-input').value.trim()
            };

            GNR_API.request('/events', {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(function () {
                form.reset();
                setMessage('Evento creado. Un moderador debe validarlo antes de aparecer en la lista', false);
            }).catch(function (error) {
                setMessage(error.message, true);
                if (error.status === 401) {
                    window.location.href = 'login.html';
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var eventId = params.get('id');
    var message = document.getElementById('detalle-evento-mensaje');
    var joinButton = document.getElementById('btn-apuntar-evento');
    var currentEvent = null;

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-eventos mensaje-error' : 'mensaje-eventos mensaje-ok';
    }

    function updateJoinButton(event) {
        if (!joinButton) {
            return;
        }
        joinButton.disabled = false;
        if (event.registrado) {
            joinButton.textContent = 'Desapuntarse';
        } else {
            joinButton.textContent = 'Apuntarse';
        }
    }

    function renderEvent(event) {
        currentEvent = event;
        GNR_API.setText('evento-titulo', event.titulo);
        GNR_API.setText('evento-creador', event.creador);
        GNR_API.setText('evento-fecha', GNR_API.formatDate(event.fecha));
        GNR_API.setText('evento-hora', event.hora);
        GNR_API.setText('evento-localizacion', event.localizacion);
        GNR_API.setText('evento-precio', GNR_API.formatPrice(event.precio));
        GNR_API.setText('evento-plazas-actuales', event.plazas_disponibles);
        GNR_API.setText('evento-plazas-totales', event.plazas_totales);
        GNR_API.setText('evento-descripcion', event.descripcion);

        var image = document.getElementById('evento-imagen');
        if (image) {
            image.src = GNR_API.eventImage(event);
            image.alt = event.titulo;
        }
        updateJoinButton(event);
    }

    if (!eventId) {
        setMessage('No se ha indicado el evento', true);
        if (joinButton) {
            joinButton.disabled = true;
        }
        return;
    }

    GNR_API.request('/events/' + eventId).then(function (data) {
        renderEvent(data.event);
    }).catch(function (error) {
        setMessage(error.message, true);
        if (joinButton) {
            joinButton.disabled = true;
        }
    });

    if (joinButton) {
        joinButton.addEventListener('click', function () {
            if (!currentEvent) {
                return;
            }
            var method = currentEvent.registrado ? 'DELETE' : 'POST';
            GNR_API.request('/events/' + eventId + '/registrations', {
                method: method
            }).then(function (data) {
                renderEvent(data.event);
                setMessage(currentEvent.registrado ? 'Te has apuntado al evento' : 'Te has desapuntado del evento', false);
            }).catch(function (error) {
                setMessage(error.message, true);
                if (error.status === 401) {
                    window.location.href = 'login.html';
                }
            });
        });
    }
});

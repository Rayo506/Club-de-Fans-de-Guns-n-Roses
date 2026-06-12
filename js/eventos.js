document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('eventos-contenedor-js');
    var searchInput = document.getElementById('buscar-evento');
    var dateInput = document.getElementById('filtro-fecha');
    var placeInput = document.getElementById('filtro-lugar');
    var createButton = document.getElementById('btn-crear-evento');
    var message = document.getElementById('eventos-mensaje');
    var allEvents = [];

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-eventos mensaje-error' : 'mensaje-eventos mensaje-ok';
    }

    function clearMessage() {
        if (message) {
            message.textContent = '';
            message.className = 'mensaje-eventos';
        }
    }

    function createEventCard(event) {
        var article = document.createElement('article');
        article.className = 'tarjeta-evento-horizontal';

        var imageContainer = document.createElement('div');
        imageContainer.className = 'evento-img-contenedor';
        var image = document.createElement('img');
        image.src = GNR_API.eventImage(event);
        image.alt = event.titulo;
        imageContainer.appendChild(image);

        var details = document.createElement('div');
        details.className = 'evento-detalles';
        var title = document.createElement('h3');
        title.textContent = event.titulo + ' - ' + GNR_API.formatDate(event.fecha);
        var meta = document.createElement('p');
        meta.textContent = event.localizacion + ' | Plazas disponibles: ' + event.plazas_disponibles + '/' + event.plazas_totales;
        details.appendChild(title);
        details.appendChild(meta);

        var actions = document.createElement('div');
        actions.className = 'evento-acciones';
        var viewLink = document.createElement('a');
        viewLink.href = 'detalles-evento.html?id=' + event.id;
        viewLink.className = 'btn-evento-link btn-ver';
        viewLink.textContent = 'Ver evento';

        var joinButton = document.createElement('a');
        joinButton.href = '#';
        joinButton.className = 'btn-evento-link btn-apuntar';
        joinButton.textContent = 'Apuntarse';
        joinButton.addEventListener('click', function (clickEvent) {
            clickEvent.preventDefault();
            GNR_API.request('/events/' + event.id + '/registrations', {
                method: 'POST'
            }).then(function () {
                setMessage('Te has apuntado al evento', false);
                loadEvents();
            }).catch(function (error) {
                setMessage(error.message, true);
                if (error.status === 401) {
                    window.location.href = 'login.html';
                }
            });
        });

        actions.appendChild(viewLink);
        actions.appendChild(joinButton);

        var clear = document.createElement('div');
        clear.style.clear = 'both';

        article.appendChild(imageContainer);
        article.appendChild(details);
        article.appendChild(actions);
        article.appendChild(clear);
        return article;
    }

    function filterEvents() {
        var search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var date = dateInput ? dateInput.value : '';
        var place = placeInput ? placeInput.value : 'todos';

        return allEvents.filter(function (event) {
            var matchesSearch = !search || event.titulo.toLowerCase().indexOf(search) !== -1 || event.localizacion.toLowerCase().indexOf(search) !== -1;
            var matchesDate = !date || event.fecha === date;
            var normalizedPlace = event.localizacion.toLowerCase();
            var matchesPlace = place === 'todos' || normalizedPlace.indexOf(place.toLowerCase()) !== -1;
            return matchesSearch && matchesDate && matchesPlace;
        });
    }

    function renderEvents() {
        if (!container) {
            return;
        }
        container.innerHTML = '';
        var filteredEvents = filterEvents();
        if (filteredEvents.length === 0) {
            var empty = document.createElement('p');
            empty.textContent = 'No hay eventos aprobados que coincidan con la búsqueda.';
            container.appendChild(empty);
            return;
        }
        filteredEvents.forEach(function (event) {
            container.appendChild(createEventCard(event));
        });
    }

    function loadEvents() {
        clearMessage();
        GNR_API.request('/events').then(function (data) {
            allEvents = data.events || [];
            renderEvents();
        }).catch(function (error) {
            setMessage(error.message, true);
        });
    }

    if (createButton) {
        createButton.addEventListener('click', function () {
            window.location.href = 'crear-evento.html';
        });
    }

    [searchInput, dateInput, placeInput].forEach(function (input) {
        if (input) {
            input.addEventListener('input', renderEvents);
            input.addEventListener('change', renderEvents);
        }
    });

    loadEvents();
});

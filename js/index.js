document.addEventListener('DOMContentLoaded', function () {
    // Controla el boton de leer mas en la pagina principal
    var readMoreButton = document.getElementById('btn-leer-mas');
    var infoExtra = document.getElementById('info-extra');

    if (readMoreButton && infoExtra) {
        // Muestra u oculta informacion extra de la banda
        readMoreButton.addEventListener('click', function () {
            if (infoExtra.classList.contains('contenido-oculto')) {
                infoExtra.classList.remove('contenido-oculto');
                this.textContent = 'Leer menos';
            } else {
                infoExtra.classList.add('contenido-oculto');
                this.textContent = 'Leer más';
            }
        });
    }

    // Carga los tres ultimos eventos aprobados
    var eventContainer = document.getElementById('eventos-js');
    if (eventContainer && window.GNR_API) {
        GNR_API.request('/events').then(function (data) {
            var events = (data.events || []).slice(0, 3);
            eventContainer.innerHTML = '';

            // Si no hay eventos, muestra un aviso
            if (events.length === 0) {
                var empty = document.createElement('p');
                empty.textContent = 'Todavía no hay eventos aprobados.';
                eventContainer.appendChild(empty);
                return;
            }

            // Crea las tarjetas pequeñas de eventos en la pagina de inicio
            events.forEach(function (event) {
                var article = document.createElement('article');
                article.className = 'tarjeta-evento';

                var imageBox = document.createElement('div');
                imageBox.className = 'evento-img-placeholder';
                var image = document.createElement('img');
                image.src = GNR_API.eventImage(event);
                image.alt = event.titulo;
                imageBox.appendChild(image);

                var info = document.createElement('div');
                info.className = 'evento-info';
                var title = document.createElement('h3');
                title.textContent = event.titulo;
                var text = document.createElement('p');
                text.textContent = GNR_API.formatDate(event.fecha) + ' - ' + event.localizacion;
                var link = document.createElement('a');
                link.href = 'detalles-evento.html?id=' + event.id;
                link.className = 'btn-evento';
                link.textContent = 'Ver evento';

                info.appendChild(title);
                info.appendChild(text);
                info.appendChild(link);

                var clear = document.createElement('div');
                clear.style.clear = 'both';

                article.appendChild(imageBox);
                article.appendChild(info);
                article.appendChild(clear);
                eventContainer.appendChild(article);
            });

            var clearFinal = document.createElement('div');
            clearFinal.style.clear = 'both';
            eventContainer.appendChild(clearFinal);
        // Si falla la carga, enseña un mensaje simple
        }).catch(function () {
            eventContainer.innerHTML = '<p>No se pudieron cargar los eventos.</p>';
        });
    }
});

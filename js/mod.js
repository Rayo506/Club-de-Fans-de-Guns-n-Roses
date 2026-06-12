document.addEventListener('DOMContentLoaded', function () {
    var welcome = document.getElementById('moderador-bienvenida');
    var logoutLink = document.getElementById('btn-mod-logout');
    var message = document.getElementById('mod-mensaje');

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-mod mensaje-error' : 'mensaje-mod mensaje-ok';
    }

    function setCount(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function statusLabel(status) {
        var span = document.createElement('span');
        span.className = 'estado-pendiente';
        span.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        return span;
    }

    function actionButton(text, className, handler) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-accion-mod ' + className;
        button.textContent = text;
        button.addEventListener('click', handler);
        return button;
    }

    function renderPendingEvents(events) {
        var body = document.getElementById('tabla-eventos-body');
        if (!body) {
            return;
        }
        body.innerHTML = '';
        if (!events || events.length === 0) {
            var emptyRow = document.createElement('tr');
            var cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No hay eventos pendientes';
            emptyRow.appendChild(cell);
            body.appendChild(emptyRow);
            return;
        }

        events.forEach(function (event) {
            var row = document.createElement('tr');

            var titleCell = document.createElement('td');
            titleCell.textContent = event.titulo;
            var userCell = document.createElement('td');
            userCell.textContent = event.creador;
            var dateCell = document.createElement('td');
            dateCell.textContent = GNR_API.formatDate(event.fecha);
            var statusCell = document.createElement('td');
            statusCell.appendChild(statusLabel(event.estado));
            var actionsCell = document.createElement('td');

            actionsCell.appendChild(actionButton('Aceptar', 'btn-validar', function () {
                updateEventStatus(event.id, 'aprobado');
            }));
            actionsCell.appendChild(actionButton('Rechazar', 'btn-rechazar', function () {
                updateEventStatus(event.id, 'rechazado');
            }));

            row.appendChild(titleCell);
            row.appendChild(userCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            body.appendChild(row);
        });
    }

    function renderEmptyProducts() {
        var body = document.getElementById('tabla-productos-body');
        if (!body) {
            return;
        }
        body.innerHTML = '';
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'La moderación de productos queda preparada para una futura ampliación';
        row.appendChild(cell);
        body.appendChild(row);
    }

    function renderEmptyReports() {
        var body = document.getElementById('tabla-reportes-body');
        if (!body) {
            return;
        }
        body.innerHTML = '';
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'No hay reportes pendientes';
        row.appendChild(cell);
        body.appendChild(row);
    }

    function loadDashboard() {
        GNR_API.request('/mod/dashboard').then(function (data) {
            if (welcome) {
                welcome.innerHTML = 'Bienvenido<br>' + data.moderator.nombre;
            }
            setCount('cnt-productos', data.counts.productos_pendientes);
            setCount('cnt-eventos', data.counts.eventos_pendientes);
            setCount('cnt-reportes', data.counts.reportes_pendientes);
            setCount('cnt-usuarios', data.counts.usuarios_registrados);
            renderPendingEvents(data.pending_events);
            renderEmptyProducts();
            renderEmptyReports();
        }).catch(function (error) {
            if (error.status === 401 || error.status === 403) {
                window.location.href = 'login.html';
                return;
            }
            setMessage(error.message, true);
        });
    }

    function updateEventStatus(eventId, status) {
        GNR_API.request('/mod/events/' + eventId, {
            method: 'PATCH',
            body: JSON.stringify({ estado: status })
        }).then(function () {
            setMessage('Evento actualizado correctamente', false);
            loadDashboard();
        }).catch(function (error) {
            setMessage(error.message, true);
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            GNR_API.logout().then(function () {
                window.location.href = 'login.html';
            }).catch(function (error) {
                setMessage(error.message, true);
            });
        });
    }

    loadDashboard();
});

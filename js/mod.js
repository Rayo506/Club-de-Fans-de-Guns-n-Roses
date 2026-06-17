document.addEventListener('DOMContentLoaded', function () {
    // Controla el panel de moderacion
    var welcome = document.getElementById('moderador-bienvenida');
    var logoutLink = document.getElementById('btn-mod-logout');
    var message = document.getElementById('mod-mensaje');

    // Muestra mensajes de error o de operacion correcta
    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.className = isError ? 'mensaje-mod mensaje-error' : 'mensaje-mod mensaje-ok';
    }

    // Actualiza los contadores del panel
    function setCount(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function formatStatusText(status) {
        if (!status) {
            return '';
        }
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    // Crea etiquetas para el estado pendiente, aprobado o rechazado
    function statusLabel(status) {
        var span = document.createElement('span');
        span.className = 'estado-pendiente';
        span.textContent = formatStatusText(status);
        return span;
    }

    // Crea los botones de aceptar y rechazar
    function actionButton(text, className, handler) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-accion-mod ' + className;
        button.textContent = text;
        button.addEventListener('click', handler);
        return button;
    }

    // Pinta la tabla de productos pendientes
    function renderPendingProducts(products) {
        var body = document.getElementById('tabla-productos-body');
        if (!body) {
            return;
        }
        body.innerHTML = '';
        if (!products || products.length === 0) {
            var emptyRow = document.createElement('tr');
            var cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No hay productos pendientes';
            emptyRow.appendChild(cell);
            body.appendChild(emptyRow);
            return;
        }

        products.forEach(function (product) {
            var row = document.createElement('tr');

            var titleCell = document.createElement('td');
            var link = document.createElement('a');
            link.href = 'detalle-producto.html?id=' + product.id;
            link.textContent = product.nombre;
            titleCell.appendChild(link);

            var userCell = document.createElement('td');
            userCell.textContent = product.vendedor;

            var dateCell = document.createElement('td');
            dateCell.textContent = product.created_at ? GNR_API.formatDate(product.created_at.split('T')[0]) : '';

            var statusCell = document.createElement('td');
            statusCell.appendChild(statusLabel(product.estado_validacion));

            var actionsCell = document.createElement('td');
            actionsCell.appendChild(actionButton('Aceptar', 'btn-validar', function () {
                updateProductStatus(product.id, 'aprobado');
            }));
            actionsCell.appendChild(actionButton('Rechazar', 'btn-rechazar', function () {
                updateProductStatus(product.id, 'rechazado');
            }));

            row.appendChild(titleCell);
            row.appendChild(userCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            body.appendChild(row);
        });
    }

    // Pinta la tabla de eventos pendientes
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

    // Los reportes se dejan vacios porque no estan implementados aun
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

    // Carga el resumen del panel desde el backend
    function loadDashboard() {
        GNR_API.request('/mod/dashboard').then(function (data) {
            if (welcome) {
                welcome.innerHTML = 'Bienvenido<br>' + data.moderator.nombre;
            }
            setCount('cnt-productos', data.counts.productos_pendientes);
            setCount('cnt-eventos', data.counts.eventos_pendientes);
            setCount('cnt-reportes', data.counts.reportes_pendientes);
            setCount('cnt-usuarios', data.counts.usuarios_registrados);
            renderPendingProducts(data.pending_products);
            renderPendingEvents(data.pending_events);
            renderEmptyReports();
        }).catch(function (error) {
            // Si el usuario no tiene permisos, lo manda al login
            if (error.status === 401 || error.status === 403) {
                window.location.href = 'login.html';
                return;
            }
            setMessage(error.message, true);
        });
    }

    // Cambia el estado de un evento desde moderacion
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

    // Cambia el estado de validacion de un producto
    function updateProductStatus(productId, status) {
        GNR_API.request('/mod/products/' + productId, {
            method: 'PATCH',
            body: JSON.stringify({ estado_validacion: status })
        }).then(function () {
            setMessage('Producto actualizado correctamente', false);
            loadDashboard();
        }).catch(function (error) {
            setMessage(error.message, true);
        });
    }

    // Permite cerrar sesion desde el panel
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

(function () {
    // Configuracion general para que todas las peticiones vayan al backend
    var API_BASE = window.GNR_API_BASE || '/api';

    // Funcion comun para hacer fetch y no repetir el mismo codigo en cada pagina
    function request(endpoint, options) {
        options = options || {};
        var headers = options.headers || {};

        // Si se manda informacion en JSON, se prepara la cabecera
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Aqui se comprueva si la respuesta del backend viene bien o con error
        return fetch(API_BASE + endpoint, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body,
            credentials: 'include'
        }).then(function (response) {
            return response.json().catch(function () {
                return {};
            }).then(function (data) {
                if (!response.ok) {
                    var error = new Error(data.error || 'Error en la petición');
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }
                return data;
            });
        });
    }

    // Funciones rapidas para saber el usuario logeado y cerrar sesion
    function getMe() {
        return request('/users/me');
    }

    function logout() {
        return request('/auth/logout', { method: 'POST' });
    }

    // Formatos usados en varias paginas para fechas y precios
    function formatDate(dateText) {
        if (!dateText) {
            return '';
        }
        var parts = dateText.split('-');
        if (parts.length !== 3) {
            return dateText;
        }
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    function formatPrice(value) {
        if (value === null || value === undefined || value === '') {
            return 'Gratis';
        }
        var number = Number(value);
        if (Number.isNaN(number) || number === 0) {
            return 'Gratis';
        }
        return number.toFixed(2) + ' euros';
    }

    // Imagenes por defecto si el evento o producto no tienen foto
    function eventImage(event) {
        if (event && event.imagen_url) {
            return event.imagen_url;
        }
        return 'img/banda.jpg';
    }


    function productImage(product) {
        if (product && product.imagen_url) {
            return product.imagen_url;
        }
        return 'img/logo.png';
    }

    // Cambia las categorias internas a un texto mas entendible
    function formatProductCategory(value) {
        var categories = {
            ropa: 'Ropa',
            accesorios: 'Accesorios',
            instrumentos: 'Instrumentos',
            musica: 'Vinilos / CDs',
            merch: 'Merchandising'
        };
        return categories[value] || value || '';
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Se guarda todo en GNR_API para poder usarlo desde los otros js
    window.GNR_API = {
        base: API_BASE,
        request: request,
        getMe: getMe,
        logout: logout,
        formatDate: formatDate,
        formatPrice: formatPrice,
        eventImage: eventImage,
        productImage: productImage,
        formatProductCategory: formatProductCategory,
        setText: setText
    };
}());

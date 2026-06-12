(function () {
    var API_BASE = window.GNR_API_BASE || 'http://localhost:5000/api';

    function request(endpoint, options) {
        options = options || {};
        var headers = options.headers || {};

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

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

    function getMe() {
        return request('/users/me');
    }

    function logout() {
        return request('/auth/logout', { method: 'POST' });
    }

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

    function eventImage(event) {
        if (event && event.imagen_url) {
            return event.imagen_url;
        }
        return 'img/banda.jpg';
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    window.GNR_API = {
        base: API_BASE,
        request: request,
        getMe: getMe,
        logout: logout,
        formatDate: formatDate,
        formatPrice: formatPrice,
        eventImage: eventImage,
        setText: setText
    };
}());

document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.getElementById('form-login');
    var registerForm = document.getElementById('form-registro');
    var loginMessage = document.getElementById('login-mensaje');
    var registerMessage = document.getElementById('registro-mensaje');
    var roleModerator = document.getElementById('rol-moderador-link');
    var roleAdmin = document.getElementById('rol-admin-link');

    function showMessage(element, text, isError) {
        if (!element) {
            return;
        }
        element.textContent = text;
        element.className = isError ? 'mensaje-form mensaje-error' : 'mensaje-form mensaje-ok';
    }

    function goToConsoleIfAllowed(event) {
        event.preventDefault();
        GNR_API.getMe().then(function (data) {
            var role = data.user.role;
            if (role === 'moderador' || role === 'admin') {
                window.location.href = 'mod.html';
                return;
            }
            showMessage(loginMessage, 'Solo moderadores y administradores pueden abrir la consola', true);
        }).catch(function () {
            showMessage(loginMessage, 'Primero inicia sesión como moderador', true);
        });
    }

    if (roleModerator) {
        roleModerator.addEventListener('click', goToConsoleIfAllowed);
    }

    if (roleAdmin) {
        roleAdmin.addEventListener('click', goToConsoleIfAllowed);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            showMessage(loginMessage, 'Validando credenciales...', false);

            var payload = {
                email: document.getElementById('login-email').value.trim(),
                password: document.getElementById('login-password').value
            };

            GNR_API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(function (data) {
                showMessage(loginMessage, 'Login correcto', false);
                if (data.user.role === 'moderador' || data.user.role === 'admin') {
                    window.location.href = 'mod.html';
                } else {
                    window.location.href = 'eventos.html';
                }
            }).catch(function (error) {
                showMessage(loginMessage, error.message, true);
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            showMessage(registerMessage, 'Validando registro...', false);

            var payload = {
                nombre: document.getElementById('reg-nombre').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value
            };

            GNR_API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(function () {
                registerForm.reset();
                showMessage(registerMessage, 'Registro completado. Ya puedes iniciar sesión', false);
            }).catch(function (error) {
                showMessage(registerMessage, error.message, true);
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Controla la pagina de login, registro y sesion activa
    var loginForm = document.getElementById('form-login');
    var registerForm = document.getElementById('form-registro');
    var loginMessage = document.getElementById('login-mensaje');
    var registerMessage = document.getElementById('registro-mensaje');
    var roleModerator = document.getElementById('rol-moderador-link');
    var roleAdmin = document.getElementById('rol-admin-link');
    var formsContainer = document.getElementById('contenedor-formularios-login');
    var activeSessionBox = document.getElementById('sesion-activa');
    var activeSessionName = document.getElementById('sesion-activa-nombre');
    var activeSessionRole = document.getElementById('sesion-activa-rol');
    var activeSessionMessage = document.getElementById('sesion-activa-mensaje');
    var loginLogoutButton = document.getElementById('btn-login-logout');
    var currentSessionUser = null;

    // Enseña mensajes de error o de que todo ha ido bien en los formularios
    function showMessage(element, text, isError) {
        if (!element) {
            return;
        }
        element.textContent = text;
        element.className = isError ? 'mensaje-form mensaje-error' : 'mensaje-form mensaje-ok';
    }

    // Cambia el nombre del rol para que se vea mas normal en pantalla
    function roleLabel(role) {
        if (role === 'admin') {
            return 'administrador';
        }
        if (role === 'moderador') {
            return 'moderador';
        }
        return 'usuario';
    }

    // Si ya hay sesion, se ocultan los formularios y se muestra el usuario
    function showLoggedIn(user) {
        currentSessionUser = user;
        if (formsContainer) {
            formsContainer.style.display = 'none';
        }
        if (activeSessionBox) {
            activeSessionBox.style.display = 'block';
        }
        if (activeSessionName) {
            activeSessionName.textContent = user.nombre + ' (' + user.email + ')';
        }
        if (activeSessionRole) {
            activeSessionRole.textContent = roleLabel(user.role);
        }
    }

    // Si no hay nadie logeado, se vuelven a enseñar login y registro
    function showLoggedOut() {
        currentSessionUser = null;
        if (formsContainer) {
            formsContainer.style.display = 'block';
        }
        if (activeSessionBox) {
            activeSessionBox.style.display = 'none';
        }
    }

    // Solo deja entrar al panel si el usuario es moderador o admin
    function goToConsoleIfAllowed(event) {
        event.preventDefault();
        var user = currentSessionUser;
        if (user) {
            if (user.role === 'moderador' || user.role === 'admin') {
                window.location.href = 'mod.html';
                return;
            }
            showMessage(loginMessage, 'Solo moderadores y administradores pueden abrir la consola', true);
            return;
        }
        GNR_API.getMe().then(function (data) {
            currentSessionUser = data.user;
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

    // Al entrar en la pagina se comprueva si ya habia una sesion iniciada
    GNR_API.getMe().then(function (data) {
        showLoggedIn(data.user);
    }).catch(function () {
        showLoggedOut();
    });

    // Cierra sesion y recarga la pagina
    if (loginLogoutButton) {
        loginLogoutButton.addEventListener('click', function () {
            showMessage(activeSessionMessage, 'Cerrando sesión...', false);
            GNR_API.logout().then(function () {
                window.location.reload();
            }).catch(function (error) {
                showMessage(activeSessionMessage, error.message, true);
            });
        });
    }

    // Los accesos de moderador y admin usan la misma comprovacion
    if (roleModerator) {
        roleModerator.addEventListener('click', goToConsoleIfAllowed);
    }

    if (roleAdmin) {
        roleAdmin.addEventListener('click', goToConsoleIfAllowed);
    }

    // Envia los datos del login al backend
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (currentSessionUser) {
                showMessage(loginMessage, 'Ya hay una sesión iniciada. Cierra sesión antes de entrar con otra cuenta', true);
                return;
            }
            showMessage(loginMessage, 'Validando credenciales...', false);

            var payload = {
                email: document.getElementById('login-email').value.trim(),
                password: document.getElementById('login-password').value
            };

            // Si el login es correcto, manda al usuario a su pagina correspondiente
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

    // Envia los datos del registro al backend
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (currentSessionUser) {
                showMessage(registerMessage, 'Ya hay una sesión iniciada. Cierra sesión antes de registrar otra cuenta', true);
                return;
            }
            showMessage(registerMessage, 'Validando registro...', false);

            var payload = {
                nombre: document.getElementById('reg-nombre').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value
            };

            // Si el registro sale bien, limpia el formulario
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

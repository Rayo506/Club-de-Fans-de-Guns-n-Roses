document.getElementById('btn-leer-mas').addEventListener('click', function () {
    var infoExtra = document.getElementById('info-extra');

    if (infoExtra.classList.contains('contenido-oculto')) {
        // Si está oculto, lo mostramos
        infoExtra.classList.remove('contenido-oculto');
        this.textContent = 'Leer menos';
    } else {
        // Si está visible, lo volvemos a ocultar
        infoExtra.classList.add('contenido-oculto');
        this.textContent = 'Leer más';
    }
});
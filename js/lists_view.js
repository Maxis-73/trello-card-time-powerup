var t = window.TrelloPowerUp.iframe({
    localization: {
        defaultLocale: "en",
        supportedLocales: ["en", "es"],
        resourceUrl: '../strings/{locale}.json'
    }
});

// Estado local para almacenar los cambios antes de guardar
var pendingStates = {};

t.render(function () {
    // Localizar los elementos de la UI
    t.localizeNode(document.body);

    return Promise.all([
        t.lists("all"),
        t.get('board', 'private', 'listStates', {})
    ])
        .then(function (results) {
            var lists = results[0];
            var savedStates = results[1];
            var container = document.getElementById('lists-container');

            // Copiar estados guardados al estado pendiente
            pendingStates = Object.assign({}, savedStates);

            if (lists.length === 0) {
                container.innerHTML = '<p>No hay listas en este tablero.</p>';
                return;
            }

            container.innerHTML = '';
            lists.forEach(function (list) {
                var listElement = document.createElement('div');
                listElement.className = 'list-item';

                var nameSpan = document.createElement('span');
                nameSpan.className = 'list-name';
                nameSpan.textContent = list.name;

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                // Si no hay estado guardado, por defecto es true
                checkbox.checked = pendingStates[list.id] !== false;

                checkbox.addEventListener('change', function () {
                    // Solo actualizar el estado local, no guardar aún
                    pendingStates[list.id] = checkbox.checked;
                });

                listElement.appendChild(nameSpan);
                listElement.appendChild(checkbox);
                container.appendChild(listElement);
            });

            // Configurar el botón de guardar
            var saveButton = document.getElementById('save-button');
            var savedMessage = document.getElementById('saved-message');

            saveButton.addEventListener('click', function () {
                saveButton.disabled = true;

                t.set('board', 'private', 'listStates', pendingStates)
                    .then(function () {
                        // Mostrar mensaje de éxito
                        savedMessage.classList.add('visible');

                        // Ocultar mensaje después de 2 segundos
                        setTimeout(function () {
                            savedMessage.classList.remove('visible');
                        }, 2000);

                        saveButton.disabled = false;
                    })
                    .catch(function (error) {
                        console.error('Error al guardar:', error);
                        saveButton.disabled = false;
                    });
            });
        })
        .catch(function (error) {
            console.error('Error al obtener listas o estados:', error);
            document.getElementById('lists-container').innerHTML = '<p>Error al cargar las listas.</p>';
        });
});

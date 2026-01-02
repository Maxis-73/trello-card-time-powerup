var t = window.TrelloPowerUp.iframe();

t.render(function () {
    return Promise.all([
        t.lists("all"),
        t.get('board', 'private', 'listStates', {})
    ])
        .then(function (results) {
            var lists = results[0];
            var savedStates = results[1];
            var container = document.getElementById('lists-container');

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
                checkbox.checked = savedStates[list.id] !== false;

                checkbox.addEventListener('change', function () {
                    savedStates[list.id] = checkbox.checked;
                    t.set('board', 'private', 'listStates', savedStates);
                });

                listElement.appendChild(nameSpan);
                listElement.appendChild(checkbox);
                container.appendChild(listElement);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener listas o estados:', error);
            document.getElementById('lists-container').innerHTML = '<p>Error al cargar las listas.</p>';
        });
});

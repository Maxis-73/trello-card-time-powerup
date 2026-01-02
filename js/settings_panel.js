var t = window.TrelloPowerUp.iframe();

// Función para renderizar las listas
function renderLists(lists) {
    var container = document.getElementById('lists-container');

    if (lists.length === 0) {
        container.innerHTML = '<div class="loading">No se encontraron listas en este tablero.</div>';
        return;
    }

    // Limpiar el contenedor
    container.innerHTML = '';

    // Crear un elemento para cada lista
    lists.forEach(function (list) {
        var listItem = document.createElement('div');
        listItem.className = 'list-item';

        var listName = document.createElement('div');
        listName.className = 'list-name';
        listName.textContent = list.name;

        var listId = document.createElement('div');
        listId.className = 'list-id';
        listId.textContent = 'ID: ' + list.id;

        listItem.appendChild(listName);
        listItem.appendChild(listId);
        container.appendChild(listItem);
    });
}

// Función para mostrar error
function showError(error) {
    var container = document.getElementById('lists-container');
    container.innerHTML = '<div class="error">Error al cargar las listas: ' + error.message + '</div>';
}

// Obtener las listas del tablero
t.lists()
    .then(function (lists) {
        console.log('Listas obtenidas:', lists);
        renderLists(lists);
    })
    .catch(function (error) {
        console.error('Error al obtener las listas:', error);
        showError(error);
    });


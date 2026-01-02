var t = window.TrelloPowerUp.iframe();

t.render(function () {
    return t.lists("all")
        .then(function (lists) {
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

                var countSpan = document.createElement('span');
                countSpan.className = 'card-count';
                var cardCount = list.cards ? list.cards.length : 0;
                countSpan.textContent = cardCount + (cardCount === 1 ? ' tarjeta' : ' tarjetas');

                listElement.appendChild(nameSpan);
                listElement.appendChild(countSpan);
                container.appendChild(listElement);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener listas:', error);
            document.getElementById('lists-container').innerHTML = '<p>Error al cargar las listas.</p>';
        });
});

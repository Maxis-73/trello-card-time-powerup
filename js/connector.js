import { utils } from './utils.js';

window.TrelloPowerUp.initialize({
    "board-buttons": function (t, opts) {
        return [
            {
                text: "Ver Listas",
                callback: function (t) {
                    return t.modal({
                        title: "Listas del Tablero",
                        url: "./views/lists_view.html",
                        height: 500,
                    });
                },
            },
        ];
    },
    "card-badges": function (t, opts) {
        return Promise.all([
            t.card("id", "idList", "name"),
            t.get('board', 'private', 'listStates', {}),
            t.get('card', 'private', 'listTimeTracking')
        ])
            .then(function (results) {
                var card = results[0];
                var listStates = results[1];
                var tracking = results[2];

                // Si la lista está desmarcada (false), no mostramos nada
                if (listStates[card.idList] === false) {
                    return [];
                }

                // Actualizar tracking si cambió de lista
                return utils.updateListTracking(t, card, tracking, listStates)
                    .then(function (updatedTracking) {
                        if (!updatedTracking) {
                            return [];
                        }

                        return [
                            {
                                dynamic: function () {
                                    const currentTime = utils.getCurrentListTime(updatedTracking);
                                    const relativeTime = utils.getRelativeTime(new Date(updatedTracking.entryTime));
                                    return {
                                        text: relativeTime,
                                        icon: "./icons/time.svg",
                                        refresh: 60,
                                    };
                                },
                            }
                        ];
                    });
            });
    },
    "card-detail-badges": function (t, opts) {
        return Promise.all([
            t.card("id", "idList", "name"),
            t.get('board', 'private', 'listStates', {}),
            t.get('card', 'private', 'listTimeTracking'),
            t.lists('all')
        ])
            .then(function (results) {
                var card = results[0];
                var listStates = results[1];
                var tracking = results[2];
                var lists = results[3];

                if (listStates[card.idList] === false) {
                    return [];
                }

                return utils.updateListTracking(t, card, tracking, listStates)
                    .then(function (updatedTracking) {
                        if (!updatedTracking) {
                            return [];
                        }

                        // Encontrar nombre de la lista actual
                        const currentList = lists.find(l => l.id === card.idList);
                        const listName = currentList ? currentList.name : 'esta lista';
                        const relativeTime = utils.getRelativeTime(new Date(updatedTracking.entryTime));

                        return [
                            {
                                dynamic: function () {
                                    return {
                                        title: "Tiempo en " + listName,
                                        text: relativeTime,
                                        refresh: 60,
                                    }
                                }
                            }
                        ];
                    });
            });
    },
    "card-back-section": function (t, opts) {
        return Promise.all([
            t.card("idList"),
            t.get('board', 'private', 'listStates', {})
        ])
            .then(function (results) {
                var card = results[0];
                var listStates = results[1];

                // Solo mostrar la sección si la tarjeta está en una lista seleccionada
                if (listStates[card.idList] === false) {
                    return [];
                }

                return [{
                    title: "Tiempo por Lista",
                    icon: "./icons/time.svg",
                    content: {
                        type: 'iframe',
                        url: t.signUrl('./views/card_history.html'),
                        height: 250
                    }
                }];
            });
    }
});
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
            t.card("id", "idList"),
            t.get('board', 'private', 'listStates', {})
        ])
            .then(function (results) {
                var card = results[0];
                var listStates = results[1];

                // Si la lista está desmarcada (false), no mostramos nada
                if (listStates[card.idList] === false) {
                    return [];
                }

                return [
                    {
                        dynamic: function () {
                            const creationDate = utils.getDateFromCardId(card.id);
                            const relativeTime = utils.getRelativeTime(creationDate);
                            return {
                                text: relativeTime,
                                icon: "./icons/time.svg",
                                refresh: 60,
                            };
                        },
                    }
                ];
            });
    },
    "card-detail-badges": function (t, opts) {
        return Promise.all([
            t.card("id", "idList"),
            t.get('board', 'private', 'listStates', {})
        ])
            .then(function (results) {
                var card = results[0];
                var listStates = results[1];

                if (listStates[card.idList] === false) {
                    return [];
                }

                return [
                    {
                        dynamic: function () {
                            const creationDate = utils.getDateFromCardId(card.id);
                            const relativeTime = utils.getRelativeTime(creationDate);
                            return {
                                title: "Tiempo en tablero",
                                text: relativeTime,
                                refresh: 60,
                            }
                        }
                    }
                ]
            })
    }
});

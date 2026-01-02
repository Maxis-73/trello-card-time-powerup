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
                        height: 300,
                        width: 400,
                    });
                },
            },
        ];
    },
    "card-badges": function (t, opts) {
        return t
            .card("id")
            .get("id")
            .then(function (cardId) {
                return [
                    {
                        dynamic: function () {
                            const creationDate = utils.getDateFromCardId(cardId);
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
        return t
            .card("id")
            .get("id")
            .then(function (cardId) {
                return [
                    {
                        dynamic: function () {
                            const creationDate = utils.getDateFromCardId(cardId);
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

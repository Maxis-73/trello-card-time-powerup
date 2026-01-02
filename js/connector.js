import { utils } from './utils.js';

window.TrelloPowerUp.initialize({
    "board-buttons": function (t, opts) {
        return [{
            icon: "./icons/settings.svg",
            text: "Tiempo de Tarjeta",
            callback: function (t) {
                return t.popup({
                    title: "Tiempo de Tarjeta: Configuración",
                    url: "./views/settings_panel.html",
                })
            }
        }]
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

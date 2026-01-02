import { utils } from './utils.js';

window.TrelloPowerUp.initialize({
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
                                icon: "../icons/time.svg",
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

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
                                color: "blue",
                                refresh: 120,
                            };
                        },
                    }
                ];
            });
    },
});

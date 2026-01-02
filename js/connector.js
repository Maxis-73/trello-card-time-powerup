import { utils } from "./utils.js";

window.TrelloPowerUp.initialize({
    'card-badges': function (t, options) {
        return t.card('id')
            .then(function (card) {
                const boardTime = utils.getRelativeTime(utils.getDateFromCardId(card.id));
                return [{
                    text: boardTime,
                    refresh: 60,
                }]
            })
    },
    'card-detail-badges': function (t, options) {
        return t.card('id')
            .then(function (card) {
                const boardTime = utils.getRelativeTime(utils.getDateFromCardId(card.id));
                return [{
                    title: 'Tiempo en tablero',
                    text: boardTime,
                    refresh: 60,
                }]
            })
    }
})
import { utils } from "./utils.js";

TrelloPowerUp.initialize({
    'card-badges': function (t, options) {
        return t.card('id')
            .then(function (card) {
                const boardTime = utils.getRelativeTime(utils.getDateFromCardId(card.id));
                console.log(boardTime);
                return [{
                    text: boardTime,
                }]
            })
    }
})
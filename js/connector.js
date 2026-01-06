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
            t.card("board", "private", "listStates", {}),
            t.get("card", "shared", "tracking", null)
        ])
            .then(function (results) {
                const card = results[0];
                const listStates = results[1];
                let tracking = results[2];

                // Si la lista esta desactivada, no mostrar nada
                if (listStates[card.idList] === false) {
                    return [];
                }

                const now = Date.now();

                // Si la tarjeta se movió de lista o no tiene registro, se inicia el contador de tiempo
                if (!tracking || tracking.lastListId !== card.idList) {
                    tracking = {
                        lastListId: card.idList,
                        enteredAt: now
                    }

                    // Se guarda el nuevo estado
                    t.set("card", "shared", "tracking", tracking);

                    const timeInBoard = utils.getRelativeTime(utils.getDateFromCardId(card.id));
                    const timeInList = utils.getRelativeTime(new Date(tracking.enteredAt));

                    return [
                        {
                            text: `Tablero: ${timeInBoard}`,
                            icon: "./icons/time.svg",
                            refresh: 60
                        },
                        {
                            text: `Lista: ${timeInList}`,
                            icon: "./icons/calendar.svg",
                            refresh: 60
                        }
                    ]
                }

            })
    },
    "card-detail-badges": function (t, opts) {
        return Promise.all([
            t.card("id", "idList"),
            t.get('board', 'private', 'listStates', {}),
            t.get('card', 'shared', 'tracking', null)
        ])
            .then(function (results) {
                const card = results[0];
                const listStates = results[1];
                const tracking = results[2];

                if (listStates[card.idList] === false) {
                    return [];
                }

                const timeInBoard = utils.getRelativeTime(utils.getDateFromCardId(card.id));

                let badges = [{
                    title: "Tiempo en tablero",
                    text: timeInBoard,
                    refresh: 60
                }];

                if (tracking && tracking.enteredAt) {
                    badges.push({
                        title: "Tiempo en esta lista",
                        text: utils.getRelativeTime(new Date(tracking.enteredAt)),
                        refresh: 60
                    });
                }

                return badges;
            });
    }
});

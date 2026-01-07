import { utils } from './utils.js';

/**
 * Actualizar el tracking en lista
 * Reinicia el contador si la tarjeta cambia de lista
 * @param {Object} t - Instancia de Trello Power-Up
 * @param {Object} card - Objeto de la tarjeta
 * @returns {Promise<Date>} - Fecha de entrada a la lista
 */
async function ensureListTracking(t, card) {
    // Obtener datos almacenados
    const [storedListId, storedEntryDate] = await Promise.all([
        t.get('card', 'private', 'currentListId', null),
        t.get('card', 'private', 'listEntryDate', null),
    ]);

    // Si cambió de lista o es la primera vez, reiniciar contador
    if (storedListId !== card.idList || !storedEntryDate) {
        const now = new Date().toISOString();
        await Promise.all([
            t.set('card', 'private', 'currentListId', card.idList),
            t.set('card', 'private', 'listEntryDate', now),
        ]);
        return new Date(now);
    }
    return new Date(storedEntryDate);
}

window.TrelloPowerUp.initialize({
    "board-buttons": function (t, opts) {
        return [
            {
                text: "Tiempo en lista",
                callback: function (t) {
                    return t.modal({
                        title: "Listas del Tablero",
                        url: "./views/lists_view.html",
                        height: 500,
                    })
                }
            }
        ]
    },

    "card-badges": function (t, opts) {
        return Promise.all([
            t.card("id", "idList"),
            t.get('board', 'private', 'listStates', {})
        ])
            .then(async function (results) {
                var card = results[0];
                var listStates = results[1];

                // Si la lista está desmarcada (false), no mostramos nada
                if (listStates[card.idList] === false) {
                    return [];
                }

                // Asegurar tracking de lista y obtener fecha de entrada
                const listEntryDate = await ensureListTracking(t, card);
                const creationDate = utils.getDateFromCardId(card.id);

                return [
                    {
                        // Badge 1: Tiempo en lista actual
                        dynamic: async function () {
                            // Re-verificar tracking (puede haber cambiado de lista)
                            const entryDate = await ensureListTracking(t, card);
                            return {
                                text: utils.getRelativeTime(entryDate),
                                icon: "./icons/time.svg",
                                refresh: 60,
                            };
                        },
                    },
                    {
                        // Badge 2: Tiempo total en tablero
                        dynamic: function () {
                            return {
                                text: utils.getRelativeTime(creationDate),
                                icon: "./icons/calendar.svg",
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
            .then(async function (results) {
                var card = results[0];
                var listStates = results[1];

                // Si la lista está desmarcada (false), no mostramos nada
                if (listStates[card.idList] === false) {
                    return [];
                }

                // Asegurar tracking de lista y obtener fecha de entrada
                const listEntryDate = await ensureListTracking(t, card);
                const creationDate = utils.getDateFromCardId(card.id);

                return [
                    {
                        // Badge 1: Tiempo en lista actual
                        dynamic: async function () {
                            // Re-verificar tracking (puede haber cambiado de lista)
                            const entryDate = await ensureListTracking(t, card);
                            return {
                                title: "Tiempo en lista",
                                text: utils.getRelativeTime(entryDate),
                                refresh: 60,
                            };
                        }
                    },
                    {
                        // Badge 2: Tiempo total en tablero
                        dynamic: function () {
                            return {
                                title: "Tiempo en tablero",
                                text: utils.getRelativeTime(creationDate),
                                refresh: 60,
                            };
                        }
                    }
                ];
            });
    },
    "card-back-history": function (t, opts) {
        return {
            text: "Historial",
            icon: "./icons/time.svg",
            content: {
                type: "iframe",
                url: t.signUrl("./views/card_history.html"),
                height: 300,
            }
        }
    }
})
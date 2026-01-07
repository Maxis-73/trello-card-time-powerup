import { utils } from './utils.js';

/**
 * Obtiene el nombre de una lista por su ID
 * @param {Object} t - Instancia de Trello Power-Up
 * @param {string} listId - ID de la lista
 * @returns {Promise<string>} - Nombre de la lista
 */
async function getListName(t, listId) {
    try {
        const lists = await t.lists('id', 'name');
        const list = lists.find(l => l.id === listId);
        return list ? list.name : 'Lista desconocida';
    } catch (error) {
        console.error('Error al obtener nombre de lista:', error);
        return 'Lista desconocida';
    }
}

/**
 * Actualizar el tracking en lista y guardar historial
 * Reinicia el contador si la tarjeta cambia de lista
 * @param {Object} t - Instancia de Trello Power-Up
 * @param {Object} card - Objeto de la tarjeta
 * @returns {Promise<Date>} - Fecha de entrada a la lista
 */
async function ensureListTracking(t, card) {
    // Obtener datos almacenados
    const [storedListId, storedEntryDate, listHistory] = await Promise.all([
        t.get('card', 'shared', 'currentListId', null),
        t.get('card', 'shared', 'listEntryDate', null),
        t.get('card', 'shared', 'listHistory', []),
    ]);

    // Si cambió de lista o es la primera vez
    if (storedListId !== card.idList || !storedEntryDate) {
        const now = new Date().toISOString();
        const newListName = await getListName(t, card.idList);

        // Crear copia del historial para modificar
        const updatedHistory = [...listHistory];

        // Si había una lista anterior, cerrar su entrada en el historial
        if (storedListId && storedEntryDate && updatedHistory.length > 0) {
            // Buscar la última entrada sin fecha de salida
            const lastEntryIndex = updatedHistory.findIndex(
                entry => entry.listId === storedListId && entry.exitDate === null
            );
            if (lastEntryIndex !== -1) {
                updatedHistory[lastEntryIndex].exitDate = now;
            }
        }

        // Agregar nueva entrada al historial
        updatedHistory.push({
            listId: card.idList,
            listName: newListName,
            entryDate: now,
            exitDate: null
        });

        // Guardar todo
        await Promise.all([
            t.set('card', 'shared', 'currentListId', card.idList),
            t.set('card', 'shared', 'listEntryDate', now),
            t.set('card', 'shared', 'listHistory', updatedHistory),
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
    "card-back-section": function (t, opts) {
        return {
            title: "Historial de listas",
            icon: "./icons/time.svg",
            content: {
                type: "iframe",
                url: t.signUrl("./views/card_history.html"),
                height: 300,
            }
        };
    }
})
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
 * Obtiene la fecha de entrada a la lista actual (solo lectura, no modifica nada)
 * @param {Object} t - Instancia de Trello Power-Up
 * @returns {Promise<Date>} - Fecha de entrada a la lista
 */
async function getListEntryDate(t) {
    const storedEntryDate = await t.get('card', 'shared', 'listEntryDate', null);
    return storedEntryDate ? new Date(storedEntryDate) : new Date();
}

/**
 * Cierra el tracking cuando la tarjeta entra a una lista no trackeada
 * @param {Object} t - Instancia de Trello Power-Up
 * @param {Object} card - Objeto de la tarjeta
 */
async function closeTrackingIfNeeded(t, card) {
    const [storedListId, listHistory] = await Promise.all([
        t.get('card', 'shared', 'currentListId', null),
        t.get('card', 'shared', 'listHistory', []),
    ]);

    // Si la tarjeta cambió de lista y hay historial con entrada abierta
    if (storedListId !== card.idList && listHistory.length > 0) {
        const lastIdx = listHistory.length - 1;
        if (listHistory[lastIdx].exitDate === null) {
            const now = new Date().toISOString();
            const updatedHistory = [...listHistory];
            updatedHistory[lastIdx].exitDate = now;

            await Promise.all([
                t.set('card', 'shared', 'currentListId', card.idList),
                t.set('card', 'shared', 'listEntryDate', null), // Limpiar fecha de entrada
                t.set('card', 'shared', 'listHistory', updatedHistory),
            ]);
        }
    }
}

/**
 * Actualizar el tracking en lista y guardar historial
 * Solo se debe llamar UNA vez cuando se detecta cambio de lista
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

    // Si NO cambió de lista y ya tiene fecha, retornar la fecha existente
    if (storedListId === card.idList && storedEntryDate) {
        return new Date(storedEntryDate);
    }

    // Verificar si la última entrada del historial ya es para esta lista y está abierta
    // Esto evita duplicados por race condition
    const lastEntry = listHistory.length > 0 ? listHistory[listHistory.length - 1] : null;
    if (lastEntry && lastEntry.listId === card.idList && lastEntry.exitDate === null) {
        // Ya existe una entrada abierta para esta lista, actualizar currentListId si es necesario
        if (storedListId !== card.idList) {
            await t.set('card', 'shared', 'currentListId', card.idList);
        }
        return new Date(lastEntry.entryDate);
    }

    // Es un cambio de lista real, proceder con la actualización
    const now = new Date().toISOString();
    const newListName = await getListName(t, card.idList);

    // Crear copia del historial para modificar
    const updatedHistory = [...listHistory];

    // Cerrar la última entrada abierta (si existe)
    if (updatedHistory.length > 0) {
        const lastIdx = updatedHistory.length - 1;
        if (updatedHistory[lastIdx].exitDate === null) {
            updatedHistory[lastIdx].exitDate = now;
        }
    }

    // Agregar nueva entrada al historial
    updatedHistory.push({
        listId: card.idList,
        listName: newListName,
        entryDate: now,
        exitDate: null
    });

    // Guardar todo de forma atómica
    await Promise.all([
        t.set('card', 'shared', 'currentListId', card.idList),
        t.set('card', 'shared', 'listEntryDate', now),
        t.set('card', 'shared', 'listHistory', updatedHistory),
    ]);

    return new Date(now);
}

window.TrelloPowerUp.initialize({
    "board-buttons": function (t, opts) {
        return [
            {
                icon: "./icons/list.svg",
                text: t.localizeKey('board-button-title', 'Time in list'),
                callback: function (t) {
                    return t.modal({
                        title: t.localizeKey('modal-title', 'Board Lists'),
                        url: "./views/lists_view.html",
                        height: 600,
                    });
                }
            }
        ];
    },

    "card-badges": function (t, opts) {
        return t.card("id", "idList")
            .then(async function (card) {
                const listStates = await t.get('board', 'private', 'listStates', {});

                // Si la lista está desmarcada (false), cerrar tracking y no mostrar nada
                if (listStates[card.idList] === false) {
                    await closeTrackingIfNeeded(t, card);
                    return [];
                }

                // Asegurar tracking de lista (solo escribe si es necesario)
                await ensureListTracking(t, card);
                const creationDate = utils.getDateFromCardId(card.id);

                return [
                    {
                        // Badge 1: Tiempo en lista actual
                        dynamic: async function () {
                            // Leer siempre la fecha actual del storage
                            const entryDate = await getListEntryDate(t);
                            return {
                                text: utils.getRelativeTime(entryDate, t),
                                icon: "./icons/time.svg",
                                refresh: 60,
                            };
                        },
                    },
                    {
                        // Badge 2: Tiempo total en tablero
                        dynamic: function () {
                            return {
                                text: utils.getRelativeTime(creationDate, t),
                                icon: "./icons/calendar.svg",
                                refresh: 60,
                            };
                        },
                    }
                ];
            });
    },

    "card-detail-badges": function (t, opts) {
        return t.card("id", "idList")
            .then(async function (card) {
                const listStates = await t.get('board', 'private', 'listStates', {});

                // Si la lista está desmarcada (false), cerrar tracking y no mostrar nada
                if (listStates[card.idList] === false) {
                    await closeTrackingIfNeeded(t, card);
                    return [];
                }

                // Asegurar tracking de lista (solo escribe si es necesario)
                await ensureListTracking(t, card);
                const creationDate = utils.getDateFromCardId(card.id);

                // Obtener traducciones (usando localizeKey que es síncrono)
                const timeInListTitle = t.localizeKey('time-in-list', 'Time in list');
                const timeOnBoardTitle = t.localizeKey('time-on-board', 'Time on board');

                return [
                    {
                        // Badge 1: Tiempo en lista actual
                        title: timeInListTitle,
                        dynamic: async function () {
                            // Leer siempre la fecha actual del storage
                            const entryDate = await getListEntryDate(t);
                            return {
                                title: timeInListTitle,
                                text: utils.getRelativeTime(entryDate, t),
                                refresh: 60,
                            };
                        }
                    },
                    {
                        // Badge 2: Tiempo total en tablero
                        title: timeOnBoardTitle,
                        dynamic: function () {
                            return {
                                title: timeOnBoardTitle,
                                text: utils.getRelativeTime(creationDate, t),
                                refresh: 60,
                            };
                        }
                    }
                ];
            });
    },
    "card-back-section": function (t, opts) {
            return t.card('id').then(function() {
                return {
                    title: t.localizeKey('history-title', 'List History'),
                    icon: "./icons/time.svg",
                    content: {
                        type: "iframe",
                        url: t.signUrl("./views/card_history.html"),
                        height: 300,
                    }
                };
            });
        }
}, {
    localization: {
        defaultLocale: "en",
        supportedLocales: ["en", "es"],
        resourceUrl: './strings/{locale}.json'
    }
})

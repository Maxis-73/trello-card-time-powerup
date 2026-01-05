export const utils = {
    getDateFromCardId: (id) => {
        return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    },

    getRelativeTime: (date) => {
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInMins < 1) return 'ahora';
        if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? 'minuto' : 'minutos'}`;
        if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
        if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
        if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
        if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
        return `${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
    },

    updateListTracking: async function (t, card, tracking, listStates) {
        const now = Date.now();
        const currentListId = card.idList;

        // Si la lista actual no está seleccionada, no hacer tracking
        if (listStates[currentListId] === false) {
            return null;
        }

        // Si no hay tracking, hay que inicializarlo
        if (!tracking) {
            // Obtener todas las listas para el nombre
            const lists = await t.lists('all');
            const currentList = lists.find(list => list.id === currentListId);

            tracking = {
                currentListId: currentListId,
                entryTime: now,
                history: [{
                    listId: currentListId,
                    listName: currentList ? currentList.name : 'Desconocida',
                    entryTime: now,
                    exitTime: null,
                    duration: null
                }]
            };

            await t.set('card', 'private', 'listTimeTracking', tracking);
            return tracking;
        }

        // Si cambió de lista, guardar historial y reiniciar
        if (tracking.currentListId !== currentListId) {
            const duration = now - tracking.entryTime;

            // Actualizar la última entrada del historial con exitTime y duration
            if (tracking.history.length > 0) {
                tracking.history[tracking.history.length - 1].exitTime = now;
                tracking.history[tracking.history.length - 1].duration = duration;
            }

            // Obtener nombre de la nueva lista
            const lists = await t.lists('all');
            const currentList = lists.find(list => list.id === currentListId);

            // Agregar nueva entrada al historial
            tracking.history.push({
                listId: currentListId,
                listName: currentList ? currentList.name : 'Desconocida',
                entryTime: now,
                exitTime: null,
                duration: null
            });

            // Actualizar tracking actual
            tracking.currentListId = currentListId;
            tracking.entryTime = now;
            await t.set('card', 'private', 'listTimeTracking', tracking);
        }

        return tracking;
    },

    // Calcular el tiempo actual en la lista
    getCurrentListTime: function (tracking) {
        if (!tracking || !tracking.entryTime) {
            return 0;
        }
        return Date.now() - tracking.entryTime;
    },

    // Formatea el historial para mostrar
    formatHistoryforDisplay: function (history, currentListId) {
        if (!history || history.length === 0) {
            return [];
        }

        return history.map(entry => {
            const isCurrent = entry.listId === currentListId && entre.exitTime === null;
            let displayTime;

            if (isCurrent) {
                const currentDuration = Date.now() - entry.entryTime;
                displayTime = this.formatDuration(currentDuration);
            } else {
                displayTime = this.formatDuration(entry.duration)
            }

            return {
                listName: entry.listName,
                time: displayTime,
                isCurrent: isCurrent
            }

        });
    },

    formatDuration: function (ms) {
        if (!ms || ms < 0) return '0 minutos';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            if (remainingHours > 0) {
                return `${days} ${days === 1 ? 'día' : 'días'} ${remainingHours} ${remainingHours === 1 ? 'hora' : 'horas'}`;
            }
            return `${days} ${days === 1 ? 'día' : 'días'}`;
        }
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            if (remainingMinutes > 0) {
                return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minuto' : 'minutos'}`;
            }
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        if (minutes > 0) {
            return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        }
        return 'menos de 1 minuto';
    }
};
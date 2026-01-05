var t = window.TrelloPowerUp.iframe();

// Importar utils (necesitamos adaptarlo porque no podemos usar import en iframe)
// Copiamos las funciones necesarias aquí

function formatDuration(ms) {
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

function renderHistory(tracking) {
    var container = document.getElementById('history-container');

    if (!tracking || !tracking.history || tracking.history.length === 0) {
        container.innerHTML = '<div class="no-history">No hay historial de movimientos aún.</div>';
        return;
    }

    container.innerHTML = '';

    tracking.history.forEach(function (entry) {
        var historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const isCurrent = entry.listId === tracking.currentListId && entry.exitTime === null;

        if (isCurrent) {
            historyItem.classList.add('current');
        }

        var listName = document.createElement('div');
        listName.className = 'list-name';
        listName.textContent = entry.listName;

        var time = document.createElement('div');
        time.className = 'time';

        if (isCurrent) {
            const currentDuration = Date.now() - entry.entryTime;
            time.textContent = formatDuration(currentDuration);
        } else {
            time.textContent = formatDuration(entry.duration);
        }

        historyItem.appendChild(listName);
        historyItem.appendChild(time);

        if (isCurrent) {
            var indicator = document.createElement('div');
            indicator.className = 'current-indicator';
            indicator.textContent = '⏱️';
            historyItem.appendChild(indicator);
        }

        container.appendChild(historyItem);
    });

    // Actualizar cada minuto para la entrada actual
    setTimeout(function () {
        t.get('card', 'private', 'listTimeTracking')
            .then(renderHistory)
            .catch(console.error);
    }, 60000);
}

function showError(message) {
    var container = document.getElementById('history-container');
    container.innerHTML = '<div class="error">' + message + '</div>';
}

// Cargar el historial
t.get('card', 'private', 'listTimeTracking')
    .then(function (tracking) {
        console.log('Tracking data:', tracking);
        renderHistory(tracking);
    })
    .catch(function (error) {
        console.error('Error loading tracking:', error);
        showError('Error al cargar el historial de tiempos.');
    });
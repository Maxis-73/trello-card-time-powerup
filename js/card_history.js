var t = window.TrelloPowerUp.iframe();

/**
 * Calcula la duración entre dos fechas
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {string} - Duración formateada
 */
function getDurationBetweenDates(startDate, endDate) {
    const diffInMs = endDate - startDate;
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
}

// Icono SVG
const listIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
</svg>`;

/**
 * Renderiza el historial en el DOM
 * @param {Array} history - Array de entradas del historial
 */
function renderHistory(history) {
    const container = document.getElementById('history-container');

    if (!history || history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No hay historial de listas disponible.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    history.forEach(function (item, index) {
        const isCurrent = item.exitDate === null;
        // Si tiene exitDate, calcular duración entre entry y exit
        // Si no tiene exitDate (lista actual), calcular desde entry hasta ahora
        const endDate = item.exitDate ? new Date(item.exitDate) : new Date();
        const duration = getDurationBetweenDates(new Date(item.entryDate), endDate);

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item' + (isCurrent ? ' current' : '');

        historyItem.innerHTML = `
            <div class="history-icon">${listIcon}</div>
            <div class="history-content">
                <div>
                    <span class="history-list-name">${escapeHtml(item.listName)}</span>
                    ${isCurrent ? '<span class="current-badge">Actual</span>' : ''}
                </div>
                <span class="history-duration">${duration}</span>
            </div>
        `;

        container.appendChild(historyItem);
    })
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    const container = document.getElementById('history-container');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-text">${message}</div>
        </div>
    `;
}

// Obtener y renderizar el historial
t.get('card', 'shared', 'listHistory', [])
    .then(function (history) {
        renderHistory(history);
        // Ajustar altura del iframe al contenido
        t.sizeTo('#history-container').catch(function () { });
    })
    .catch(function (error) {
        console.error('Error al obtener el historial:', error);
        showError('Error al cargar el historial.');
    });
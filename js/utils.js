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

    /**
     * Calcula la duración entre dos fechas
     * @param {string} startDate - Fecha de inicio (ISO string)
     * @param {string|null} endDate - Fecha de fin (ISO string) o null para fecha actual
     * @returns {string} Duración formateada
     */
    getDuration: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffInMs = end - start;
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
};
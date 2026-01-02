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

        if (diffInMins < 60) return `${diffInMins} min`;
        if (diffInHours < 24) return `${diffInHours} h`;
        return `${diffInDays} d`;
    }
};
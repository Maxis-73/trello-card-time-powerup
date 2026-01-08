export const utils = {
    getDateFromCardId: (id) => {
        return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    },

    getRelativeTime: (date, t = null) => {
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        const localize = (key, fallback) => t ? t.localizeKey(key, fallback) : fallback;

        if (diffInMins < 1) return localize('time-now', 'now');
        if (diffInMins < 60) {
            const unit = diffInMins === 1 ? localize('time-minute', 'minute') : localize('time-minutes', 'minutes');
            return `${diffInMins} ${unit}`;
        }
        if (diffInHours < 24) {
            const unit = diffInHours === 1 ? localize('time-hour', 'hour') : localize('time-hours', 'hours');
            return `${diffInHours} ${unit}`;
        }
        if (diffInDays < 7) {
            const unit = diffInDays === 1 ? localize('time-day', 'day') : localize('time-days', 'days');
            return `${diffInDays} ${unit}`;
        }
        if (diffInWeeks < 4) {
            const unit = diffInWeeks === 1 ? localize('time-week', 'week') : localize('time-weeks', 'weeks');
            return `${diffInWeeks} ${unit}`;
        }
        if (diffInMonths < 12) {
            const unit = diffInMonths === 1 ? localize('time-month', 'month') : localize('time-months', 'months');
            return `${diffInMonths} ${unit}`;
        }
        const unit = diffInYears === 1 ? localize('time-year', 'year') : localize('time-years', 'years');
        return `${diffInYears} ${unit}`;
    }
};
import moment from "moment";

export const getCurrentMonth = () => {
    const startOfMonth = moment().startOf('month').subtract(6, 'days').date()
    const endOfMonth = moment().endOf('month').subtract(6, 'days').date();
    const currentMonth = moment().date() > endOfMonth ? moment().add(1, 'month') : moment();
    const monthKey = currentMonth.clone().format('MMMM-YYYY')
    return { startOfMonth, endOfMonth, currentMonth, monthKey }
}

export const generateCalendar = (month, setCalendar) => {
    const startOfMonth = month.clone().startOf('month').subtract(6, 'days');
    const endOfMonth = month.clone().endOf('month').subtract(6, 'days');

    let startDate = startOfMonth.clone().startOf('week');
    let endDate = endOfMonth.clone().endOf('week');

    let day = startDate.clone();
    let calendarDays = [];

    // Generate weeks
    while (day.isBefore(endDate, 'day')) {
        const week = Array(7).fill(null).map(() => {
            const dayClone = day.clone();
            const isInactive = dayClone.isBefore(startOfMonth, 'day') || dayClone.isAfter(endOfMonth, 'day');
            day.add(1, 'day');
            return { date: dayClone, isInactive };
        });
        calendarDays.push(week);
    }

    setCalendar(calendarDays);
};

export const handleEventChange = ({ date, timeType, value, events, monthKey }) => {
    // Update the event in the state
    const updatedEvent = { ...events?.[monthKey]?.[date], [timeType]: value };
    if (updatedEvent.inTime) {
        const [hours, minutes] = updatedEvent.inTime.split(':').map(Number);
        if (hours >= 11 && minutes > 0) {
            updatedEvent.penalty = 1;
        } else {
            updatedEvent.penalty = 0;
        }
    }
    if (updatedEvent.inTime && updatedEvent.outTime) {
        const { hours, minutes } = getTimeDifference(updatedEvent.inTime, updatedEvent.outTime);
        const _hour = minutes < 60 && minutes >= 50 ? hours + 1 : hours

        updatedEvent.totalTime = {
            hours,
            minutes
        };
        // Determine if the hours should be counted as short or extra
        if (_hour < 9) {
            updatedEvent.shortHours = 9 - _hour;
            updatedEvent.extraHours = 0;
        } else if (_hour > 9) {
            updatedEvent.shortHours = 0;
            updatedEvent.extraHours = _hour - 9;
        } else {
            updatedEvent.shortHours = 0;
            updatedEvent.extraHours = 0;
        }
    } else {
        updatedEvent.shortHours = 0;
        updatedEvent.extraHours = 0;
    }
    return updatedEvent
};

const getTimeDifference = (time1, time2) => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const date1 = new Date(0, 0, 0, hours1, minutes1);
    const date2 = new Date(0, 0, 0, hours2, minutes2);

    const diffInMs = date2 - date1;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours: diffInHours, minutes: diffInMinutes };
};

export const calculateTotalHours = (events, monthKey) => {
    let totalHours = { hours: 0, minutes: 0 };
    let totalShortHours = 0;
    let totalExtraHours = 0;
    let penaltyHours = 0;

    Object.values(events?.[monthKey] || {}).forEach(event => {
        if (event.inTime && event.outTime) {
            const { hours, minutes } = event?.totalTime || {};

            // Aggregate total hours
            totalHours.hours += hours;
            totalHours.minutes += minutes;

            // Adjust minutes if they exceed 60
            if (totalHours.minutes >= 60) {
                totalHours.hours += Math.floor(totalHours.minutes / 60);
                totalHours.minutes = totalHours.minutes % 60;
            }

            // Sum up short and extra hours
            totalShortHours += event.shortHours || 0;
            totalExtraHours += event.extraHours || 0;
            penaltyHours += event.penalty || 0;
        }
    });

    const netShortHours = (penaltyHours + totalShortHours) - (totalExtraHours + 3)

    return { totalHours, totalShortHours, totalExtraHours, penaltyHours, netShortHours };
};
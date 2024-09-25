import moment from "moment";

export const getCurrentMonth = () => {
    const daysInMonth = moment().daysInMonth()
    const startOfMonth = daysInMonth > 30 ? 26 : 25
    const currentMonth = moment().date() >= startOfMonth ? moment().add(1, 'month') : moment();
    const monthKey = currentMonth.clone().format('MMMM-YYYY')
    return { daysInMonth, startOfMonth, currentMonth, monthKey }
}
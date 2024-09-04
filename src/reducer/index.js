// reducer/index.js
export const HANDLE_EVENT = 'HANDLE_EVENT';
export const INITIALIZE_EVENTS = 'INITIALIZE_EVENTS';
export const CLEAR_EVENT = 'CLEAR_EVENT';
export const MARK_ABSENT = 'MARK_ABSENT';
export const LOGIN = 'LOGIN';
export const LOGIN_OUT = 'LOGIN_OUT';

export const initialState = {
    events: {}, // Store events as key-value pairs where the key is the date
    user: {},
    isLogged: false
};

export const appReducer = (state, action) => {
    const { month, date, event } = action.payload || {};
    switch (action.type) {
        case HANDLE_EVENT:
            return {
                ...state,
                events: {
                    ...state.events,
                    [month]: {
                        ...state.events[month],
                        [date]: {
                            ...state.events[month]?.[date],
                            ...event
                        }
                    }
                }
            };
        case MARK_ABSENT:
            return {
                ...state,
                events: {
                    ...state.events,
                    [month]: {
                        ...state.events[month],
                        [date]: {
                            ...event
                        }
                    }
                }
            };
        case CLEAR_EVENT:
            const updatedEvents = { ...state.events };
            delete updatedEvents[action.payload.month][action.payload.date];
            return {
                ...state,
                events: updatedEvents,
            };
        case INITIALIZE_EVENTS:
            return {
                ...state,
                events: action.payload
            };
        case LOGIN:
            return {
                ...state,
                user: action.payload,
                isLogged: true
            };
        case LOGIN_OUT:
            return {
                ...state,
                events: {},
                user: {},
                isLogged: false
            };
        default:
            return state;
    }
};

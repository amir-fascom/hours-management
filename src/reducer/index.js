// reducer/index.js
export const HANDLE_EVENT = 'HANDLE_EVENT';
export const INITIALIZE_EVENTS = 'INITIALIZE_EVENTS';
export const CLEAR_EVENT = 'CLEAR_EVENT';
export const MARK_ABSENT = 'MARK_ABSENT';

export const initialState = {
    events: {}, // Store events as key-value pairs where the key is the date
};

export const appReducer = (state, action) => {
    const { month, date, event } = action.payload;
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
            delete updatedEvents[action.payload.date];
            return {
                ...state,
                events: updatedEvents,
            };
        case INITIALIZE_EVENTS:
            return {
                ...state,
                events: action.payload
            };
        default:
            return state;
    }
};

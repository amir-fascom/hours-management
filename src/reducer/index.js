// reducer/index.js
export const HANDLE_EVENT = 'HANDLE_EVENT';
export const INITIALIZE_EVENTS = 'INITIALIZE_EVENTS';
export const CLEAR_EVENT = 'CLEAR_EVENT';

export const initialState = {
    events: {}, // Store events as key-value pairs where the key is the date
};

export const appReducer = (state, action) => {
    switch (action.type) {
        case HANDLE_EVENT:
            const { date, event } = action.payload;
            return {
                ...state,
                events: {
                    ...state.events,
                    [date]: {
                        ...state.events[date],
                        ...event
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

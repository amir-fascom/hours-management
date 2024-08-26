// reducer.js

import { Utils } from "../utils";

export const ADD_ROW = 'ADD_ROW'
export const REMOVE_ROW = 'REMOVE_ROW'
export const INPUT_CHANGE = 'INPUT_CHANGE'
export const TIME_IN = 'TIME_IN'
export const TIME_OUT = 'TIME_OUT'

export const initialState = {
    formRows: [],
};

export const formReducer = (state, action) => {
    switch (action.type) {
        case ADD_ROW:
            return {
                ...state, formRows: [...state.formRows, {
                    id: Utils.generateId(),
                    timeIn: '00:00',
                    timeOut: '00:00'
                }]
            };
        case REMOVE_ROW:
            if (state.formRows.length === 1) {
                return state
            }
            return { ...state, formRows: state.formRows.filter(x => x.id !== action.payload) };
        case INPUT_CHANGE:
            const formData = [...state.formRows]
            const updatedFormData = formData.map(x => {
                if (x.id === action.payload.id) {
                    return {
                        ...x,
                        ...(action.payload.input === TIME_IN ? {
                            timeIn: action.payload.value
                        } : {
                            timeOut: action.payload.value
                        })
                    }
                }
                return x
            })
            return { ...state, formRows: updatedFormData };
        default:
            return state;
    }
};
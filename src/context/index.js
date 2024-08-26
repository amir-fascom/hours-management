// TodoContext.js
import React, { createContext, useReducer } from 'react';
import { formReducer, initialState } from '../reducer';

export const FormContext = createContext();

export const FormStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
};

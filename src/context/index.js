// context/index.js
import React, { createContext, useReducer, useEffect } from 'react';
import { appReducer, initialState } from '../reducer';

export const AppContext = createContext();

export const AppStateProvider = ({ data, children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  console.log("🚀 ~ AppStateProvider ~ state:", state)

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'INITIALIZE_EVENTS',
        payload: data
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

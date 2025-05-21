// context/index.js
import React, { createContext, useEffect, useReducer } from 'react';
import { appReducer, initialState } from '../reducer';

export const AppContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme${state.theme}`);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

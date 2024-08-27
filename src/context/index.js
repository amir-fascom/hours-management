// context/index.js
import React, { createContext, useReducer, useEffect } from 'react';
import { appReducer, initialState } from '../reducer';

export const AppContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // Load from localStorage when the app starts
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      dispatch({
        type: 'INITIALIZE_EVENTS',
        payload: JSON.parse(savedEvents)
      });
    }
  }, []);

  // Save to localStorage whenever the state changes
  useEffect(() => {
    if (state.events) {
      localStorage.setItem('events', JSON.stringify(state.events));
    }
  }, [state.events]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

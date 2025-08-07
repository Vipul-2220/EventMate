import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const EventContext = createContext();

const initialState = {
  events: [],
  featuredEvents: [],
  userEvents: [],
  registeredEvents: [],
  currentEvent: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    featured: false,
    sortBy: 'date',
    sortOrder: 'asc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  }
};

const eventReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload.events,
        pagination: {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
          limit: action.payload.limit
        },
        loading: false
      };
    case 'SET_FEATURED_EVENTS':
      return {
        ...state,
        featuredEvents: action.payload,
        loading: false
      };
    case 'SET_USER_EVENTS':
      return {
        ...state,
        userEvents: action.payload,
        loading: false
      };
    case 'SET_REGISTERED_EVENTS':
      return {
        ...state,
        registeredEvents: action.payload,
        loading: false
      };
    case 'SET_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
        loading: false
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.payload, ...state.events],
        userEvents: [action.payload, ...state.userEvents]
      };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event._id === action.payload._id ? action.payload : event
        ),
        userEvents: state.userEvents.map(event =>
          event._id === action.payload._id ? action.payload : event
        ),
        currentEvent: state.currentEvent?._id === action.payload._id ? action.payload : state.currentEvent
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event._id !== action.payload),
        userEvents: state.userEvents.filter(event => event._id !== action.payload)
      };
    case 'REGISTER_FOR_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
        registeredEvents: [action.payload, ...state.registeredEvents]
      };
    case 'UNREGISTER_FROM_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
        registeredEvents: state.registeredEvents.filter(event => event._id !== action.payload._id)
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    default:
      return state;
  }
};

export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Get all events with filters
  const getEvents = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = new URLSearchParams({
        ...state.filters,
        ...filters
      });
      
      const res = await api.get(`/events?${params}`);
      dispatch({
        type: 'SET_EVENTS',
        payload: res.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch events'
      });
    }
  };

  // Get featured events
  const getFeaturedEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/events?featured=true&limit=6');
      dispatch({
        type: 'SET_FEATURED_EVENTS',
        payload: res.data.events
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch featured events'
      });
    }
  };

  // Get single event
  const getEvent = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get(`/events/${id}`);
      dispatch({
        type: 'SET_CURRENT_EVENT',
        payload: res.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch event'
      });
    }
  };

  // Create event
  const createEvent = async (eventData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.post('/events', eventData);
      dispatch({
        type: 'ADD_EVENT',
        payload: res.data.event
      });
      return { success: true, event: res.data.event };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to create event'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Update event
  const updateEvent = async (id, eventData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.put(`/events/${id}`, eventData);
      dispatch({
        type: 'UPDATE_EVENT',
        payload: res.data.event
      });
      return { success: true, event: res.data.event };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to update event'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      dispatch({
        type: 'DELETE_EVENT',
        payload: id
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to delete event'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Register for event
  const registerForEvent = async (id) => {
    try {
      const res = await api.post(`/events/${id}/register`);
      dispatch({
        type: 'REGISTER_FOR_EVENT',
        payload: res.data.event
      });
      return { success: true, event: res.data.event };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to register for event'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Unregister from event
  const unregisterFromEvent = async (id) => {
    try {
      const res = await api.delete(`/events/${id}/register`);
      dispatch({
        type: 'UNREGISTER_FROM_EVENT',
        payload: res.data.event
      });
      return { success: true, event: res.data.event };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to unregister from event'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Get user's created events
  const getUserEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/events/user/created');
      dispatch({
        type: 'SET_USER_EVENTS',
        payload: res.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch user events'
      });
    }
  };

  // Get user's registered events
  const getRegisteredEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/events/user/registered');
      dispatch({
        type: 'SET_REGISTERED_EVENTS',
        payload: res.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch registered events'
      });
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters
    });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    events: state.events,
    featuredEvents: state.featuredEvents,
    userEvents: state.userEvents,
    registeredEvents: state.registeredEvents,
    currentEvent: state.currentEvent,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    getEvents,
    getFeaturedEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getUserEvents,
    getRegisteredEvents,
    setFilters,
    clearFilters,
    clearError
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

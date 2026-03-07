import { useState, useEffect, useCallback } from 'react';
import { ERROR_MESSAGES, LOADING_STATES } from '../utils/constants';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(LOADING_STATES.IDLE);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setStatus(LOADING_STATES.LOADING);
      
      const result = await apiFunction(...args);
      setData(result);
      setStatus(LOADING_STATES.SUCCESS);
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || ERROR_MESSAGES.GENERIC_ERROR;
      setError(errorMessage);
      setStatus(LOADING_STATES.ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setStatus(LOADING_STATES.IDLE);
  }, []);

  return {
    data,
    loading,
    error,
    status,
    execute,
    reset,
    isLoading: loading,
    isError: status === LOADING_STATES.ERROR,
    isSuccess: status === LOADING_STATES.SUCCESS,
  };
};

export const useAsyncApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || ERROR_MESSAGES.GENERIC_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
    error,
    isLoading: loading,
    isError: !!error,
  };
};

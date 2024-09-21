import { useState, useEffect, useCallback } from 'react';
import { User, AuthPayload, ApiResponse } from 'src/shared/types/index';
import { AUTH_TOKEN_KEY } from 'src/shared/constants/index';
import { handleApiResponse } from 'src/shared/utils/index';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((authPayload: AuthPayload) => {
    setUser(authPayload.user);
    localStorage.setItem(AUTH_TOKEN_KEY, authPayload.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      // TODO: Implement token validation and user fetching
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, login, logout };
};

export const useApi = <T>(endpoint: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, options);
      const result = await handleApiResponse<ApiResponse<T>>(response);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  return { data, loading, error, fetchData };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

export const useNetworkValue = (userId: string) => {
  const { data, loading, error, fetchData } = useApi<number>(`/api/network-value/${userId}`);

  useEffect(() => {
    fetchData();
  }, [userId, fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { networkValue: data, loading, error, refresh };
};
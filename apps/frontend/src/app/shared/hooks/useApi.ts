import { useState } from 'react';

const useApi = <T>(baseUrl: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const get = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${`http://localhost:7071/api`}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const post = async (endpoint: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${`http://localhost:7071/api`}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Failed to post data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const put = async (endpoint: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${`http://localhost:7071/api`}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Failed to post data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const patch = async (endpoint: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${`http://localhost:7071/api`}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Failed to patch data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (endpoint: string, p0?: { id: number | undefined; }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${`http://localhost:7071/api`}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete data: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { get, post,put, patch, remove, loading, error };
};

export default useApi;
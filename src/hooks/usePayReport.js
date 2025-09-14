import { useState, useCallback } from 'react';

const usePayReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePayReport = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (params.siteId) queryParams.append('siteId', params.siteId);
      if (params.employeeId) queryParams.append('employeeId', params.employeeId);
      if (params.dateRange) queryParams.append('dateRange', params.dateRange);

      const response = await fetch(`/api/pay/report?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate pay report');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateEmployeeReport = useCallback(async (employeeId, params) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (params.siteId) queryParams.append('siteId', params.siteId);
      if (params.dateRange) queryParams.append('dateRange', params.dateRange);

      const response = await fetch(`/api/pay/report/employee/${employeeId}?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate employee report');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    generatePayReport,
    generateEmployeeReport,
    clearError
  };
};

export default usePayReport;

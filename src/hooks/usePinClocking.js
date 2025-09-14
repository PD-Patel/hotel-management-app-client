import { useState, useCallback } from 'react';

const usePinClocking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyPin = useCallback(async (pin, siteId, action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ pin, siteId, action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PIN verification failed');
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

  const performClockAction = useCallback(async (pin, siteId, action, coordinates = null) => {
    try {
      // First verify the PIN
      const verificationResult = await verifyPin(pin, siteId, action);
      
      if (!verificationResult) {
        return false;
      }

      // Perform the actual clock action
      const clockResponse = await fetch('/api/clock/toggle-clock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          pin,
          siteId,
          ...(coordinates && {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          })
        })
      });

      if (!clockResponse.ok) {
        const errorData = await clockResponse.json();
        throw new Error(errorData.message || 'Clock action failed');
      }

      const clockData = await clockResponse.json();
      return {
        success: true,
        data: clockData,
        employee: verificationResult.employee
      };
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }, [verifyPin]);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Unable to retrieve your location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    verifyPin,
    performClockAction,
    getCurrentLocation,
    clearError
  };
};

export default usePinClocking;

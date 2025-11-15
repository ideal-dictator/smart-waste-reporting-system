import { useState, useEffect } from 'react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  timestamp?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);

  const getCurrentLocation = async (highAccuracy: boolean = true) => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 15000 : 10000,
      maximumAge: highAccuracy ? 60000 : 300000 // 1 minute for high accuracy, 5 minutes for normal
    };

    try {
      await getLocationWithRetry(options);
    } catch (err) {
      // If high accuracy fails, try with lower accuracy
      if (highAccuracy && retryCount === 0) {
        console.log('High accuracy failed, trying with lower accuracy...');
        await getCurrentLocation(false);
      }
    }
  };

  const getLocationWithRetry = (options: PositionOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy, timestamp } = position.coords;
          
          // Get address from coordinates
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData: LocationData = {
            lat: latitude,
            lng: longitude,
            address,
            accuracy,
            timestamp: timestamp || Date.now()
          };
          
          setLocation(locationData);
          setLocationHistory(prev => [locationData, ...prev.slice(0, 4)]); // Keep last 5 locations
          setLoading(false);
          resolve();
        },
        async (error) => {
          console.error('Geolocation error:', error);
          
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            console.log(`Retrying location fetch (attempt ${retryCount + 2}/3)...`);
            setTimeout(() => {
              getLocationWithRetry(options).then(resolve).catch(reject);
            }, 2000);
            return;
          }
          
          let errorMessage = 'Unable to retrieve location';
          let suggestion = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              suggestion = 'Please enable location permissions in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              suggestion = 'Please check your GPS/location services and internet connection.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              suggestion = 'Please try again or enter your address manually.';
              break;
          }
          
          setError(`${errorMessage}. ${suggestion}`);
          setLoading(false);
          reject(error);
        },
        options
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
    try {
      // Try multiple geocoding services for better reliability
      const services = [
        {
          name: 'Nominatim',
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          parser: (data: any) => data.display_name
        },
        {
          name: 'LocationIQ',
          url: `https://us1.locationiq.com/v1/reverse.php?key=demo&lat=${lat}&lon=${lng}&format=json`,
          parser: (data: any) => data.display_name
        }
      ];
      
      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'SmartWaste/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const address = service.parser(data);
            if (address && address.length > 10) {
              console.log(`Address resolved using ${service.name}`);
              return address;
            }
          }
        } catch (serviceError) {
          console.warn(`${service.name} geocoding failed:`, serviceError);
          continue;
        }
      }
      
      console.warn('All geocoding services failed, using coordinates');
      return fallbackAddress;
      
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return fallbackAddress;
    }
  };

  const selectPreviousLocation = (locationData: LocationData) => {
    setLocation(locationData);
    setError(null);
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return { 
    location, 
    loading, 
    error, 
    getCurrentLocation, 
    locationHistory,
    selectPreviousLocation,
    clearLocation,
    retryCount
  };
};
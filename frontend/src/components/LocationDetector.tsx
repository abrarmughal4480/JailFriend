import React, { useState } from 'react';

interface LocationData {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  timezone?: string;
  isp?: string;
  ip?: string;
  source?: string;
}

interface LocationDetectorProps {
  onLocationSelect: (location: LocationData | null) => void;
  disabled?: boolean;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ 
  onLocationSelect, 
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const detectCurrentLocation = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Reverse geocode to get address
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
              const data = await response.json();
              
              const locationData: LocationData = {
                name: data.display_name.split(',')[0] || 'Current Location',
                address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                coordinates: {
                  latitude: latitude,
                  longitude: longitude
                },
                country: data.address?.country,
                state: data.address?.state,
                city: data.address?.city || data.address?.town || data.address?.village
              };
              
              onLocationSelect(locationData);
            } catch (error) {
              // Fallback if reverse geocoding fails
              const locationData: LocationData = {
                name: 'Current Location',
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                coordinates: {
                  latitude: latitude,
                  longitude: longitude
                }
              };
              onLocationSelect(locationData);
            }
          },
          (error) => {
            setError('Could not get your current location. Please try again.');
            onLocationSelect(null);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
        onLocationSelect(null);
      }
    } catch (error) {
      setError('Failed to detect your location. Please try again.');
      onLocationSelect(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setError('');
    onLocationSelect(null);
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="location-detector">
      {isLoading && (
        <div className="location-loading">
          <div className="spinner"></div>
          <span>Getting your location...</span>
        </div>
      )}

      {error && (
        <div className="location-error">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={detectCurrentLocation}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="no-location">
          <button
            onClick={detectCurrentLocation}
            className="detect-location-btn"
            disabled={isLoading}
          >
            📍 Detect My Location
          </button>
        </div>
      )}

      <style jsx>{`
        .location-detector {
          width: 100%;
        }

        .location-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .location-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          color: #721c24;
          font-size: 14px;
        }

        .error-icon {
          font-size: 16px;
        }

        .retry-btn {
          margin-left: auto;
          padding: 4px 8px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #c82333;
        }

        .no-location {
          text-align: center;
          padding: 16px;
        }

        .detect-location-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .detect-location-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .detect-location-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Dark mode support */
        .dark .location-loading {
          background: #2d3748;
          color: #a0aec0;
        }

        .dark .location-error {
          background: #742a2a;
          border-color: #742a2a;
          color: #feb2b2;
        }

        .dark .detect-location-btn {
          background: #3182ce;
        }

        .dark .detect-location-btn:hover:not(:disabled) {
          background: #2c5aa0;
        }
      `}</style>
    </div>
  );
};

export default LocationDetector;

import React from 'react';

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

interface LocationDisplayProps {
  location: LocationData;
  compact?: boolean;
  showCoordinates?: boolean;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ 
  location, 
  compact = false,
  showCoordinates = false,
  className = ''
}) => {
  if (!location) return null;

  // Function to open location in maps
  const handleLocationClick = () => {
    if (location.coordinates && location.coordinates.latitude && location.coordinates.longitude) {
      // Open in Google Maps
      const googleMapsUrl = `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`;
      window.open(googleMapsUrl, '_blank');
    } else if (location.address) {
      // If no coordinates, search by address
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(location.address)}`;
      window.open(searchUrl, '_blank');
    }
  };

  // Always use compact mode for feed posts to make it more subtle
  if (compact) {
    return (
      <div 
        className={`location-display-compact ${className} cursor-pointer`}
        onClick={handleLocationClick}
        title="Click to open in maps"
      >
        <span className="location-icon">📍</span>
        <span className="location-name">{location.name}</span>
        {location.city && (
          <span className="location-city">
            • {location.city}
            {location.country && `, ${location.country}`}
          </span>
        )}
      </div>
    );
  }

  // For detailed view (when not in feed), show minimal information
  return (
    <div 
      className={`location-display-minimal ${className} cursor-pointer`}
      onClick={handleLocationClick}
      title="Click to open in maps"
    >
      <div className="location-content">
        <span className="location-icon">📍</span>
        <span className="location-name">{location.name}</span>
        {location.city && (
          <span className="location-city">
            • {location.city}
            {location.country && `, ${location.country}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;

// Add CSS styles for the new minimal design
const styles = `
  .location-display-compact {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6c757d;
    padding: 2px 6px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(0, 123, 255, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .location-display-compact:hover {
    background: rgba(0, 123, 255, 0.15);
    border-color: rgba(0, 123, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  .location-display-compact .location-icon {
    font-size: 10px;
    color: #007bff;
  }

  .location-display-compact .location-name {
    font-weight: 500;
    color: #495057;
    font-size: 11px;
  }

  .location-display-compact .location-city {
    color: #6c757d;
    font-size: 10px;
  }

  .location-display-minimal {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6c757d;
    padding: 4px 8px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(0, 123, 255, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .location-display-minimal:hover {
    background: rgba(0, 123, 255, 0.15);
    border-color: rgba(0, 123, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  .location-display-minimal .location-icon {
    font-size: 12px;
    color: #007bff;
  }

  .location-display-minimal .location-name {
    font-weight: 500;
    color: #495057;
    font-size: 12px;
  }

  .location-display-minimal .location-city {
    color: #6c757d;
    font-size: 11px;
  }

  /* Dark mode support */
  .dark .location-display-compact {
    background: rgba(49, 130, 206, 0.1);
    border-color: rgba(49, 130, 206, 0.2);
    color: #a0aec0;
  }

  .dark .location-display-compact:hover {
    background: rgba(49, 130, 206, 0.2);
    border-color: rgba(49, 130, 206, 0.3);
  }

  .dark .location-display-compact .location-name {
    color: #e2e8f0;
  }

  .dark .location-display-compact .location-city {
    color: #a0aec0;
  }

  .dark .location-display-minimal {
    background: rgba(49, 130, 206, 0.1);
    border-color: rgba(49, 130, 206, 0.2);
    color: #a0aec0;
  }

  .dark .location-display-minimal:hover {
    background: rgba(49, 130, 206, 0.2);
    border-color: rgba(49, 130, 206, 0.3);
  }

  .dark .location-display-minimal .location-name {
    color: #e2e8f0;
  }

  .dark .location-display-minimal .location-city {
    color: #a0aec0;
  }
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

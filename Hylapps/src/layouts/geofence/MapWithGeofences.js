import PropTypes from 'prop-types';
import React from 'react';
import { GeoJSON } from 'react-leaflet';

// Convert coordinate objects to arrays of numbers
const convertCoordinates = (coordinates) => {
  return coordinates.flat().map(coord => [coord.lat, coord.lng]);
};

const isValidPolygon = (coordinates) => {
  const validLatLng = Array.isArray(coordinates) && coordinates.every(pair =>
    Array.isArray(pair) && pair.length === 2 &&
    typeof pair[0] === 'number' && typeof pair[1] === 'number'
  );

  if (validLatLng && coordinates.length > 2 &&
      (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
       coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
    coordinates.push([...coordinates[0]]);
  }

  return validLatLng && coordinates.length > 2 &&
         coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
         coordinates[0][1] === coordinates[coordinates.length - 1][1];
};


const MapWithGeofences = ({ geofences }) => {
  return (
    <>
      {geofences.map((geofence, index) => {
        console.log(`Inspecting geofence:`, geofence);

        // Convert coordinates to [lng, lat] arrays
        const coordinates = convertCoordinates(geofence.coordinates);

        console.log(`Geofence ${geofence.geofenceName} with coordinates:`, coordinates);

        // Check if the geofence is a valid polygon
        if (isValidPolygon(coordinates)) {
          return (
            <GeoJSON 
              key={index} 
              data={{ 
                type: 'Feature', 
                geometry: { 
                  type: 'Polygon', 
                  coordinates: [coordinates] 
                } 
              }} 
            />
          );
        } else {
          console.error(`Invalid coordinates for polygon geofence ${geofence.geofenceName}`, coordinates);
          return null;
        }
      })}
    </>
  );
};


MapWithGeofences.propTypes = {
  geofences: PropTypes.arrayOf(
    PropTypes.shape({
      geofenceId: PropTypes.string.isRequired,
      geofenceName: PropTypes.string.isRequired,
      geofenceType: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      remarks: PropTypes.string.isRequired,
      coordinates: PropTypes.arrayOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
          }).isRequired
        ).isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
};

export default MapWithGeofences;

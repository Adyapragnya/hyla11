import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import MapWithGeofences from './MapWithGeofences';
import MapWithFullscreen from './MapWithFullscreen';
import MapWithMarkers from './MapWithMarkers';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/turf';
import 'leaflet.markercluster';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import MapWithDraw from './MapWithDraw';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MyMapComponent = ({ vessels, selectedVessel }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polygongeofences');
        console.log('Geofences Response:', response.data); // Log response data
        setPolygonGeofences(response.data);
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };
    fetchGeofences();
  }, []);

  // Function to ensure the polygon is closed (first and last points are the same)
  const ensureClosedPolygon = (coordinates) => {
    if (coordinates.length > 0) {
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      
      // Ensure first and last coordinates are identical
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        // Add the first point at the end if they are not identical
        coordinates.push([firstPoint[0], firstPoint[1]]);
      }
    }
    return coordinates;
  };

  useEffect(() => {
    const checkVesselsInGeofences = () => {
      vessels.forEach((vessel) => {
        const vesselPoint = point([vessel.lng, vessel.lat]);
        console.log(`Checking vessel: ${vessel.name} at [${vessel.lng}, ${vessel.lat}]`);

        polygonGeofences.forEach((geofence) => {
          let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lng, coord.lat]);

          // Ensure the polygon is closed
          geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);

          const geofencePolygon = polygon([geofenceCoordinates]);

          console.log(`Checking geofence: ${geofence.geofenceName} with coordinates`, geofenceCoordinates);
          console.log(`Vessel point:`, vesselPoint);

          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
          console.log(`Is vessel inside geofence: ${isInside}`);

          if (isInside) {
            const message = `Vessel ${vessel.name} is inside geofence ${geofence.geofenceName}`;
            console.log(message);
            setMessages(prevMessages => [...prevMessages, message]);
          }
        });
      });
    };

    if (vessels.length && polygonGeofences.length) {
      checkVesselsInGeofences();
    }
  }, [vessels, polygonGeofences]);

  return (
    <>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '65vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
        <MapWithFullscreen />
        <MapWithDraw />
        <MapWithGeofences geofences={polygonGeofences} />
      </MapContainer>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
    </>
  );
};

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
  })
};

export default MyMapComponent;

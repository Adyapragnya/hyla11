import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import MapWithGeofences from './MapWithGeofences';
import MapWithMarkers from './MapWithMarkers';
import MapWithFullscreen from './MapWithFullscreen';
import MapWithDraw from './MapWithDraw';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/turf';
import 'leaflet.markercluster';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MapWithPolylineGeofences from './MapWithPolylineGeofences';
import MapWithCircleGeofences from './MapWithCircleGeofences';
import './MyMapComponent.css'; // Import CSS file for styling
const MyMapComponent = ({ vessels, selectedVessel, setVesselEntries }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [polylineGeofences, setPolylineGeofences] = useState([]); 
  const [circleGeofences, setCircleGeofences] = useState([]); 
  const [buttonControl, setButtonControl] = useState(false);

  const handleButtonControl = () => {
    setButtonControl(prev => !prev);
  };

  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polygongeofences');
        const polylineResponse = await axios.get('http://localhost:5000/api/polylinegeofences');
        const circleResponse = await axios.get('http://localhost:5000/api/circlegeofences'); // Fetch circle geofences
        
       
        console.log('Geofences Response:', response.data); // Log response data
        console.log('Circle Geofences:', circleResponse.data); // Log circle geofences
        setPolygonGeofences(response.data);
        setPolylineGeofences(polylineResponse.data);
        setCircleGeofences(circleResponse.data); // Set circle geofences
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };
    fetchGeofences();
  }, []);

  const ensureClosedPolygon = (coordinates) => {
    if (coordinates.length > 0) {
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coordinates.push([firstPoint[0], firstPoint[1]]);
      }
    }
    return coordinates;
  };


  useEffect(() => {
    const checkVesselsInGeofences = () => {
      vessels.forEach((vessel) => {
        const vesselPoint = point([vessel.lat, vessel.lng]);
        console.log(`Checking vessel: ${vessel.name} at [${vessel.lng}, ${vessel.lat}]`);
  
        polygonGeofences.forEach((geofence) => {
          let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lng, coord.lat]);
          geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);
          const geofencePolygon = polygon([geofenceCoordinates]);
  
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
          console.log(`Is vessel inside geofence: ${isInside}`);
  
          setVesselEntries(prevEntries => {
            const existingEntry = prevEntries[vessel.name] || {};
            const isInSameGeofence = existingEntry.geofence === geofence.geofenceName;
  
            if (isInside) {
              // If vessel is inside and it's the first time, set entry time
              if (!existingEntry.entryTime && !isInSameGeofence) {
                // Swal.fire({
                //   title: 'Vessel Inside Geofence!',
                //   text: `Vessel ${vessel.name} is inside geofence ${geofence.geofenceName}`,
                //   icon: 'info',
                //   confirmButtonText: 'OK'
                // });
  
                return {
                  ...prevEntries,
                  [vessel.name]: {
                    entryTime: new Date().toISOString(), // Set entry time only once
                    geofence: geofence.geofenceName,
                    exitTime: null // Reset exit time
                  }
                };
              }
  
              // If vessel has entered a new geofence, update entry time
              if (!isInSameGeofence) {
                // Swal.fire({
                //   title: 'Vessel Moved Geofence!',
                //   text: `Vessel ${vessel.name} moved to geofence ${geofence.geofenceName}`,
                //   icon: 'info',
                //   confirmButtonText: 'OK'
                // });
  
                return {
                  ...prevEntries,
                  [vessel.name]: {
                    entryTime: existingEntry.entryTime || new Date().toISOString(), // Keep original entry time
                    geofence: geofence.geofenceName,
                    exitTime: null // Reset exit time
                  }
                };
              }
            } else if (isInSameGeofence) {
              // If the vessel is leaving the geofence, set the exit time
              return {
                ...prevEntries,
                [vessel.name]: {
                  ...existingEntry,
                  exitTime: new Date().toISOString() // Update exit time when exiting
                }
              };
            }
  
            return prevEntries; // No changes if conditions aren't met
          });
        });
      });
    };
  
    if (vessels.length && polygonGeofences.length) {
      checkVesselsInGeofences();
    }
  }, [vessels, polygonGeofences, setVesselEntries]);
  
    
    
 
  
  

  return (
    <>
     <label className="toggle-button">
        <input type="checkbox" checked={buttonControl} onChange={handleButtonControl} />
        <span className="slider" />
      </label>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '65vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
        <MapWithFullscreen />
        {buttonControl && <MapWithDraw />}
        <MapWithGeofences geofences={polygonGeofences} />
         <MapWithPolylineGeofences geofences={polylineGeofences} />
         <MapWithCircleGeofences geofences={circleGeofences} />
      </MapContainer>
      {/* <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div> */}
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
  }),
  setVesselEntries: PropTypes.func.isRequired,
};

export default MyMapComponent;

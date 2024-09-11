import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Function to create a custom icon with rotation
const createCustomIcon = (heading) => {
  const iconUrl = '/ship-popup.png'; 

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg);"><img src="${iconUrl}" style="width: 12px; height: 12px;" /></div>`,
    iconSize: [10, 10],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MyMapComponent = ({ selectedVessel, style }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && selectedVessel) {
      const { LATITUDE, LONGITUDE } = selectedVessel.AIS;
      const map = mapRef.current;

      // Smoothly pan to the new position
      map.flyTo([LATITUDE, LONGITUDE], 5, {
        duration: 1.5 // Adjust the duration for smoothness
      });
    }
  }, [selectedVessel]);

  const position = selectedVessel ? [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE] : [0, 0];
  const zoom = 2;

  return (
    <MapContainer center={position} zoom={zoom} style={{ height: '450px', width: '100%', borderRadius: '12px', ...style }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {selectedVessel && (
        <Marker
          position={[selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE]}
          icon={createCustomIcon(selectedVessel.AIS.HEADING)}
        >
          <Popup>
            <strong>Name:</strong> {selectedVessel.AIS.NAME || 'No name'}<br />
            <strong>IMO:</strong> {selectedVessel.AIS.IMO || 'N/A'}<br />
            <strong>Heading:</strong> {selectedVessel.AIS.HEADING || 'N/A'}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

MyMapComponent.propTypes = {
  selectedVessel: PropTypes.shape({
    AIS: PropTypes.shape({
      NAME: PropTypes.string,
      IMO: PropTypes.string,
      LATITUDE: PropTypes.number,
      LONGITUDE: PropTypes.number,
      HEADING: PropTypes.number
    })
  }),
  style: PropTypes.object
};

export default MyMapComponent;


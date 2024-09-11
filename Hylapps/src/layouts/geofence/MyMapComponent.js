import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, useMap, FeatureGroup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { EditControl } from 'react-leaflet-draw';

// Function to create a custom icon for selected vessel with rotation
const createCustomIcon = (heading) => {
  const iconUrl = '/ship-popup.png'; // Custom ship icon URL

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg);"><img src="${iconUrl}" style="width: 12px; height: 12px;" /></div>`,
    iconSize: [15, 15],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Function to create a small point icon for the global map
const createPointIcon = () => {
  return L.divIcon({
    className: 'point-icon',
    html: `<div style="width: 5px; height: 5px; background-color: red; border-radius: 50%;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [10, 10]
  });
};

// GeoJSON Data
const geoJsonData1 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Rotterdam",
        "distance": 45.7
      },
      "geometry": {
      "coordinates": [
          [
            1.0923746189525332,
            51.07254977870457
          ],
          [
            1.5975878864731214,
            50.92223698446651
          ],
          [
            1.7613800960344292,
            51.181946216365674
          ],
          [
            2.2014188679911513,
            51.073015002969356
          ],
          [
            2.32120720035752,
            51.351732623379235
          ],
          [
            2.5681178446225488,
            51.09144395557422
          ],
          [
            2.455663491789835,
            51.38225809585023
          ],
          [
            1.4460189761317963,
            51.38073230548227
          ]
        ],

        "type": "LineString"
      },
      "id": 0
    }
  ]
};

const geoJsonData2 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name ": "Rotterdam",
        "distance": "37.540 nm"
      },
      "geometry": {
       "coordinates": [
          [
            3.261337844275374,
            51.34638097445159
          ],
          [
            3.212654841295844,
            51.4137197093075
          ],
          [
            3.1672535586525328,
            51.464227862476804
          ],
          [
            3.1739499419701644,
            51.56041663816026
          ],
          [
            3.2760121081967526,
            51.80232992990963
          ],
          [
            3.611335574253502,
            52.093151003044625
          ],
          [
            3.855348018614194,
            52.23176598967464
          ],
          [
            3.988916847906701,
            52.27655431541207
          ],
          [
            4.132926787734661,
            52.27150001257465
          ],
          [
            4.216942906585164,
            52.26737625170945
          ],
          [
            4.330194134929307,
            52.19422038407782
          ],
          [
            4.335329561016408,
            52.17846522339195
          ],
          [
            4.335347720885977,
            52.15364953350388
          ]
        ],
        "type": "LineString"
      },
      "id": 0
    }
  ]
};

const MapWithMarkers = ({ vessels, selectedVessel }) => {
  const map = useMap();
  const markerClusterGroupRef = useRef(null);
  const markerRef = useRef();

  useEffect(() => {
    if (map) {
      // Initialize the MarkerClusterGroup
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers();
      } else {
        markerClusterGroupRef.current = L.markerClusterGroup();
        map.addLayer(markerClusterGroupRef.current);
      }

      vessels.forEach(vessel => {
        const marker = L.marker([vessel.lat, vessel.lng], {
          icon: selectedVessel && vessel.name === selectedVessel.name
            ? createCustomIcon(vessel.heading)
            : createPointIcon()
        });

        marker.bindPopup(`
          <strong>Name:</strong> ${vessel.name || 'No name'}<br />
          <strong>IMO:</strong> ${vessel.imo || 'N/A'}<br />
          <strong>Heading:</strong> ${vessel.heading || 'N/A'}<br />
          <strong>ETA:</strong> ${vessel.eta || 'N/A'}<br />
          <strong>Destination:</strong> ${vessel.destination || 'N/A'}
        `);

        markerClusterGroupRef.current.addLayer(marker);
      });

      // Add hover effect to clusters to show vessel count
      markerClusterGroupRef.current.on('clustermouseover', (event) => {
        const cluster = event.layer;
        const vesselCount = cluster.getAllChildMarkers().length;

        cluster.bindPopup(`
          <div>
            <strong>Vessels in the area:</strong> ${vesselCount}
          </div>
        `).openPopup();
      });

      if (selectedVessel) {
        if (markerRef.current) {
          markerRef.current.remove();
        }

        const customIcon = createCustomIcon(selectedVessel.heading);

        markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div>
              Name: ${selectedVessel.name}<br />
              IMO: ${selectedVessel.imo}<br />
            </div></br>
            <div style="text-align: right;">
              <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                <u>++View more</u>
              </a>
            </div>
          `)
          .openPopup();

        map.flyTo([selectedVessel.lat, selectedVessel.lng], 10, {
          duration: 2,
          easeLinearity: 0.5
        });
      } else if (vessels.length > 0) {
        const validVessels = vessels.filter(vessel => vessel.lat && vessel.lng);
        if (validVessels.length > 0) {
          const bounds = L.latLngBounds(validVessels.map(vessel => [vessel.lat, vessel.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [map, selectedVessel, vessels]);

  return (
    <>
      <GeoJSON data={geoJsonData1} style={{ color: 'blue' }} />
      <GeoJSON data={geoJsonData2} style={{ color: 'green' }} />
    </>
  );
};

MapWithMarkers.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.number,
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

const MapWithFullscreen = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const fullscreenControl = L.control.fullscreen({
        position: 'topright',
        title: 'View Fullscreen',
        titleCancel: 'Exit Fullscreen',
      }).addTo(map);

      const resetViewControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd() {
          const container = L.DomUtil.create('div', 'leaflet-bar');
          const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-reset-view', container);
          button.title = 'Reset View';
          button.innerHTML = '<i class="fas fa-sync-alt"></i>';
          L.DomEvent.on(button, 'click', () => {
            map.setView([0, 0], 2); // Reset to a default view
          });
          return container;
        }
      });

      const resetControl = new resetViewControl();
      resetControl.addTo(map);

      return () => {
        fullscreenControl.remove();
        resetControl.remove();
      };
    }
  }, [map]);

  return null;
};

const MapWithDraw = () => {
  const featureGroupRef = useRef(null);

  const handleCreated = (e) => {
    const { layer } = e;

    if (layer instanceof L.Polygon || layer instanceof L.Circle || layer instanceof L.Polyline) {
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div id="popup-content">
          <div class="property-row">
            <label>Select Type:</label>
            <select class="select-type">
              <option value="">Select Type</option>
              <option value="super admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div class="property-row">
            <label>Category Type:</label>
            <select class="category-type">
              <option value="">Category Type</option>
              <option value="global">Global</option>
              <option value="custom">Custom</option>
              <option value="user specific">User Specific</option>
              <option value="vessels specific">Vessels Specific</option>
              <option value="region specific">Region Specific</option>
            </select>
          </div>

          <div class="property-row">
            <label>Geofence ID:</label>
            <input type="text" class="property-id" placeholder="Enter Geofence ID" />
          </div>
          <div class="property-row">
            <label>Geofence Name:</label>
            <input type="text" class="property-name" placeholder="Enter Geofence Name" />
          </div>
          <div class="property-row">
            <label>Start Date:</label>
            <input type="date" id="start-date" />
          </div>
          <div class="property-row">
            <label>End Date:</label>
            <input type="date" id="end-date" />
          </div>
          <div class="property-row">
            <label>Geofence Priority:</label>
            <input type="text" class="property-priority" placeholder="Enter Priority" />
          </div>
        </div>
      `;

      layer.bindPopup(popupContent).openPopup();
    }
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topright"
        onCreated={handleCreated}
        draw={{
          rectangle: false,
          polyline: true,
          polygon: false,
          circle: false,
          circlemarker: false,
          marker: false
        }}
      />
    </FeatureGroup>
  );
};

const MyMapComponent = ({ vessels, center, zoom, selectedVessel }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '65vh', width: '100%' }}
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
      <MapWithFullscreen />
      <MapWithDraw />
    </MapContainer>
  );
};

MyMapComponent.propTypes = {
  vessels: PropTypes.array.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
  selectedVessel: PropTypes.object,
};

export default MyMapComponent;

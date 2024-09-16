import React,{useEffect} from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup } from 'react-leaflet';

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
  
  export default MapWithFullscreen;
  

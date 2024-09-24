import React from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';

// Define columns for the data grid
const columns = [
  { name: 'vesselName', header: 'Vessel Name', minWidth: 150 },
  { name: 'geofence', header: 'Geofence Name', minWidth: 150 },
  { name: 'message', header: 'Message', minWidth: 200 },
  { name: 'entryTime', header: 'Entry Time', minWidth: 150 },
  { name: 'exitTime', header: 'Exit Time', minWidth: 150 },
  { name: 'speed', header: 'Speed', minWidth: 100 },
  { name: 'heading', header: 'Heading', minWidth: 100 },
  { name: 'destination', header: 'Destination', minWidth: 150 },

];

// Convert vesselEntries into an array of objects
const formatEntries = (entries, vessels) => {
  const entriesArray = Array.isArray(entries)
    ? entries
    : Object.entries(entries).map(([key, value]) => ({
        ...value,
        vesselName: key,
      }));

  return entriesArray.map((entry) => {
    // Find corresponding vessel data to include speed, heading, and destination
    const vessel = vessels.find((v) => v.name === entry.vesselName);
    return {
      vesselName: entry.vesselName,
      geofence: entry.geofence,
      message: `Vessel ${entry.vesselName} is inside geofence ${entry.geofence}`,
      entryTime: entry.entryTime || 'N/A',
      exitTime: entry.exitTime || 'N/A',
      speed: vessel?.speed || 'N/A',
      heading: vessel?.heading || 'N/A',
      destination: vessel?.destination || 'N/A',
      
    };
  });
};



const GeofenceMessage = ({ vesselEntries, vessels, onRowClick }) => {
   console.log(vesselEntries);
  const dataSource = formatEntries(vesselEntries, vessels);

  return (
    <div className="geofence-message">
      <ReactDataGrid
        columns={columns}
        dataSource={dataSource}
        style={{ minHeight: 500 }}
        pagination
        paginationPosition="bottom"
        defaultSortInfo={{ name: 'entryTime', dir: 'desc' }}
        onRowClick={(rowData) => onRowClick(rowData.data)} // Handle row click
      />
    </div>
  );
};

GeofenceMessage.propTypes = {
  vesselEntries: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        vesselName: PropTypes.string.isRequired,
        geofence: PropTypes.string.isRequired,
        entryTime: PropTypes.string,
        exitTime: PropTypes.string,
      }).isRequired
    ),
    PropTypes.objectOf(
      PropTypes.shape({
        entryTime: PropTypes.string,
        exitTime: PropTypes.string,
        geofence: PropTypes.string,
      }).isRequired
    ),
  ]).isRequired,
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      speed: PropTypes.number.isRequired,
      heading: PropTypes.number.isRequired,
      destination: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRowClick: PropTypes.func.isRequired, // Add prop for row click handler
};

export default GeofenceMessage;

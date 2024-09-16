import React from 'react';
import PropTypes from 'prop-types';

const GeofenceMessage = ({ crossingMessages }) => {
  // Ensure crossingMessages is always an array
  const messages = Array.isArray(crossingMessages) ? crossingMessages : [];

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <h3>Geofence Crossing Messages</h3>
      <ul>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))
        ) : (
          <li>No messages</li>
        )}
      </ul>
    </div>
  );
};

GeofenceMessage.propTypes = {
  crossingMessages: PropTypes.arrayOf(PropTypes.string)
};

// Default props to ensure crossingMessages is an empty array if not provided
GeofenceMessage.defaultProps = {
  crossingMessages: []
};

export default GeofenceMessage;

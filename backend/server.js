const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 5000;
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');


// Middleware to handle JSON requests
app.use(express.json());
app.use(cors()); // This allows cross-origin requests


// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://udhay:123456789k@cluster0.cqc6pzu.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));


const nodemailer = require('nodemailer');

// Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service provider
    auth: {
        user: 'hylapps.admn@gmail.com', // Your email
        pass: 'myws cfuw isri uxko' // Your email password or app-specific password
    }
});


// Define Mongoose schema and model for vessel_master collection
const vesselSchema = new mongoose.Schema({
    imoNumber: Number,
    transportName: String,
    FLAG: String,
    StatCode5: String,
    transportCategory: String,
    transportSubCategory: String,
    SpireTransportType: String,
    buildYear: Number,
    GrossTonnage: Number,
    deadWeight: Number,
    LOA: Number,
    Beam: Number,
    MaxDraft: Number,
    ME_kW_used: Number,
    AE_kW_used: Number,
    RPM_ME_used: Number,
    Enginetype_code: String,
    subst_nr_ME: Number,
    Stofnaam_ME: String,
    Fuel_ME_code_sec: String,
    EF_ME: Number,
    Fuel_code_aux: String,
    EF_AE: Number,
    EF_gr_prs_ME: Number,
    EF_gr_prs_AE_SEA: Number,
    EF_gr_prs_AE_BERTH: Number,
    EF_gr_prs_BOILER_BERTH: Number,
    EF_gr_prs_AE_MAN: Number,
    EF_gr_prs_AE_ANCHOR: Number,
    NO_OF_ENGINE_active: Number,
    CEF_type: Number,
    Loadfactor_ds: Number,
    Speed_used_: Number,
    CRS_max: Number,
    Funnel_heigth: Number,
    MMSI: Number,
    updatedAt: Date,
    Engine_tier: Number,
    NOx_g_kwh: Number,
    summer_dwt: Number,
    transportNo: Number,
    transportType: String
});

// Index for search optimization
vesselSchema.index({ transportName: 'text' });

const Vessel = mongoose.model('vessel_master', vesselSchema, 'vessel_master');


// Define Mongoose schema and model for vesselstrackeds collection
const trackedVesselSchema = new mongoose.Schema({
    AIS: {
        MMSI: Number,
        TIMESTAMP: String,
        LATITUDE: Number,
        LONGITUDE: Number,
        COURSE: Number,
        SPEED: Number,
        HEADING: Number,
        NAVSTAT: Number,
        IMO: Number,
        NAME: String,
        CALLSIGN: String,
        TYPE: Number,
        A: Number,
        B: Number,
        C: Number,
        D: Number,
        DRAUGHT: Number,
        DESTINATION: String,
        LOCODE: String,
        ETA_AIS: String,
        ETA: String,
        SRC: String,
        ZONE: String,
        ECA: Boolean,
        DISTANCE_REMAINING: Number,
        ETA_PREDICTED: String
    },
    SpireTransportType: String,
    FLAG: String,
    GrossTonnage: Number,
    deadWeight: Number,
    geofenceFlag: String, // Add this field
}, { timestamps: true });

const TrackedVessel = mongoose.model('vesselstrackeds', trackedVesselSchema, 'vesselstrackeds');


// Define Geofence schema
const geofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: Date,
    remarks: String,
    coordinates: [{ lat: Number, lng: Number, radius: Number }]
});

const Geofence = mongoose.model('Geofence', geofenceSchema);

app.post('/api/addcirclegeofences', async (req, res) => {
    console.log('Received Circle Geofence:', req.body); // Add logging
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;

    // Perform additional checks if needed
    if (!coordinates || coordinates.length === 0 || coordinates[0].radius <= 0) {
        return res.status(400).json({ error: 'Invalid coordinates or radius.' });
    }

    const geofence = new Geofence({
        geofenceId,
        geofenceName,
        geofenceType,
        date,
        remarks,
        coordinates: coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng, radius: coord.radius })),
    });

    try {
        await geofence.save();
        res.status(201).json({ message: 'Circle geofence saved successfully!' });
    } catch (error) {
        console.error('Error saving geofence:', error); // Log the error
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve all circle geofences
app.get('/api/circlegeofences', async (req, res) => {
    try {
        const geofences = await Geofence.find(); // Adjust if necessary
        res.status(200).json(geofences);
    } catch (error) {
        console.error('Error fetching circle geofences:', error);
        res.status(500).json({ error: error.message });
    }
});

;

const PolygonGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    coordinates: Array,
    
  });

const PolygonGeofence = mongoose.model('PolygonGeofence', PolygonGeofenceSchema);
  
// Example POST endpoint for saving polygon geofences
app.post('/api/addpolygongeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
  
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({ error: 'Coordinates are required and should be an array.' });
    }
  
    const newGeofence = new PolygonGeofence({
      geofenceId,
      geofenceName,
      geofenceType,
      date,
      remarks,
      coordinates,
    });
  
    try {
      const savedGeofence = await newGeofence.save();
      res.status(201).json(savedGeofence);
    } catch (error) {
      console.error('Error saving geofence:', error);
      res.status(500).json({ error: 'Failed to save geofence data.' });
    }
  });
  
  
  
  // API to fetch polygon geofences
  app.get('/api/polygongeofences', async (req, res) => {
    try {
      const polygonGeofences = await PolygonGeofence.find();
      res.json(polygonGeofences);
    } catch (error) {
      console.error('Error fetching polygon geofences:', error);
      res.status(500).json({ error: 'Failed to fetch polygon geofences' });
    }
  });

  const PolylineGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    coordinates: Array,
});

const PolylineGeofence = mongoose.model('PolylineGeofence', PolylineGeofenceSchema);

// Example POST endpoint for saving polyline geofences
app.post('/api/addpolylinegeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
    console.log('Received polyline geofence data:', req.body);
    try {
        const newPolylineGeofence = new PolylineGeofence({
            geofenceId,
            geofenceName,
            geofenceType,
            date,
            remarks,
            coordinates,
        });

        await newPolylineGeofence.save();
        res.status(201).json(newPolylineGeofence);
    } catch (error) {
        console.error('Error saving polyline geofence:', error);
        res.status(500).json({ error: 'Failed to save polyline geofence data.' });
    }
});

// Route to get all polyline geofences
app.get('/api/polylinegeofences', async (req, res) => {
    try {
        const polylineGeofences = await PolylineGeofence.find();
        res.status(200).json(polylineGeofences);
    } catch (error) {
        console.error('Error fetching polyline geofences:', error);
        res.status(500).json({ error: 'Error fetching polyline geofences' });
    }
});

// Example DELETE endpoint for removing a polyline geofence by ID
app.delete('/api/polylinegeofences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGeofence = await PolylineGeofence.findByIdAndDelete(id);
        if (!deletedGeofence) {
            return res.status(404).json({ error: 'Geofence not found' });
        }
        res.status(200).json({ message: 'Geofence deleted successfully' });
    } catch (error) {
        console.error('Error deleting polyline geofence:', error);
        res.status(500).json({ error: 'Error deleting polyline geofence' });
    }
});


  app.post('/api/add-combined-data', async (req, res) => {
    try {
        console.log('Combined Data Request Body:', req.body); // Log the request body

        // Extract AIS data and other details from the request body
        const { '0': { AIS } = {}, SpireTransportType, FLAG, GrossTonnage, deadWeight } = req.body;

        if (!AIS || !SpireTransportType) {
            return res.status(400).json({ error: 'AIS data or SpireTransportType is missing' });
        }

        // Create a new CombinedData document
        const newCombinedData = new TrackedVessel({ AIS, SpireTransportType, FLAG, GrossTonnage, deadWeight });

        // Save the document to the database
        await newCombinedData.save();
        console.log('Combined data saved successfully');

        // Extract vessel details
        const vesselName = AIS.NAME;
        const imo = AIS.IMO;
        const zone = AIS.ZONE || 'N/A'; // Use 'N/A' if ZONE is not provided
        const flag = FLAG || 'N/A'; // Use 'N/A' if FLAG is not provided

        // List of email addresses
        const emailAddresses = ['hemanthsrinivas707@gmail.com', 'sales@adyapragnya.com','kdalvi@hylapps.com', 'abhishek.nair@hylapps.com'];

        // to: 'hemanthsrinivas707@gmail.com, sales@adyapragnya.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com',
        // Send an email notification to each recipient individually
        for (const email of emailAddresses) {
            await transporter.sendMail({
                from: 'hylapps.admn@gmail.com', // sender address
                to: email, // individual receiver address
                subject: 'Ship Tracking System - HYLA Admin', // Subject line
                text: `Dear User,

I hope this message finds you well.

I am pleased to inform you that we have successfully added your ship to our tracking system. As of today, ${new Date().toLocaleDateString()}, we will commence monitoring the vessel's journey and provide you with real-time updates on its current location and movements.

Here are the details of the ship:
Name: ${vesselName}
IMO: ${imo}
ZONE: ${zone}
FLAG: ${flag}

Please note that this tracking service will remain active for the next 30 days, during which you will receive regular updates on the ship's progress. Should you require any further assistance or specific details regarding the monitoring process, feel free to reach out at any time.

Thank you for choosing our services. We remain committed to ensuring the safe and timely navigation of your vessel.

With kind regards,

HYLA Admin
`,
            });
        }

        res.status(201).json({ message: 'Combined data saved successfully and emails sent' });
    } catch (error) {
        console.error('Error adding combined data:', error);
        res.status(500).json({ error: 'Error adding combined data' });
    }
  });

// Route to fetch specific fields from vesselstrackeds collection
app.get('/api/get-tracked-vessels', async (req, res) => {
    try {
        const fields = {
            AIS: 1,
            SpireTransportType: 1,
            FLAG: 1,
            GrossTonnage: 1,
            deadWeight: 1
        };

        // Fetch vessels with only the specified fields
        const trackedVessels = await TrackedVessel.find({}, fields).exec();
        
        res.json(trackedVessels);
    } catch (error) {
        console.error('Error fetching tracked vessels:', error);
        res.status(500).json({ error: 'Error fetching tracked vessels' });
    }
});

// Route to fetch vessels with search capability and pagination
app.get('/api/get-vessels', async (req, res) => {
    try {
        const searchQuery = req.query.search || "";
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        // Prepare the query for search
        const query = searchQuery ? {
            transportName: { $regex: searchQuery, $options: 'i' }
        } : {};

        // Fetch vessels with pagination
        const vessels = await Vessel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        
        // Count total documents for pagination
        const total = await Vessel.countDocuments(query);
        
        res.json({
            total,
            vessels
        });
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Error fetching vessels' });
    }
});

// Route to fetch vessel data from an external API (if needed)
app.get('/api/ais-data', async (req, res) => {
    const { imo } = req.query; // Extract IMO from query parameters
    const userkey = 'WS-096EE673-456A8B'; // Your API key

    try {
        const response = await axios.get('https://api.vtexplorer.com/vessels', {
            params: {
                userkey,
                imo,
                format: 'json'
            }
        });
        res.json(response.data); // Send the external API response back as JSON
    } catch (error) {
        console.error('Error fetching vessel data from external API:', error);
        res.status(500).send(error.toString());
    }
});


// VTExplorer API details
const userkey = 'WS-096EE673-456A8B'; // Your VTExplorer API key



async function checkAndUpdateVesselData() {
    try {
        const vessels = await TrackedVessel.find(); // Get all vessels from the database
        console.log(`Checking updates for ${vessels.length} vessels...`);

        for (const vessel of vessels) {
            const imo = vessel.AIS.IMO;

            // Fetch vessel data from VTExplorer API
            const response = await axios.get('https://api.vtexplorer.com/vessels', {
                params: {
                    userkey,
                    imo,
                    format: 'json'
                }
            });

            const apiData = response.data[0]?.AIS;

            // Check if latitude or longitude has changed
            if (apiData && (apiData.LATITUDE !== vessel.AIS.LATITUDE || apiData.LONGITUDE !== vessel.AIS.LONGITUDE)) {
                // Update MongoDB document
                const updatedFields = {
                    'AIS.LATITUDE': apiData.LATITUDE,
                    'AIS.LONGITUDE': apiData.LONGITUDE
                };

                // Call the endpoint to update vessel location and save history
                await axios.put(`http://localhost:5000/api/updateVesselLocation/${vessel._id}`, {
                    LATITUDE: apiData.LATITUDE,
                    LONGITUDE: apiData.LONGITUDE,
                    TIMESTAMP: new Date().toISOString()
                });

                // Log the update
                console.log(`Vessel ${vessel.AIS.NAME} (IMO: ${imo}) updated:`, updatedFields);
            }
        }
    } catch (error) {
        console.error('Error checking and updating vessel data:', error);
    }
}

// setInterval(checkAndUpdateVesselData, 60 * 100000); 


// Define the VesselHistory schema
const vesselHistorySchema = new mongoose.Schema({
    vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
    vesselName: String,
    IMO: Number,
    history: [{
        LATITUDE: Number,
        LONGITUDE: Number,
        TIMESTAMP: String,
        geofenceFlag: { type: String, default: null },
    }],
    updatedAt: { type: Date, default: Date.now }
});

const VesselHistory = mongoose.model('VesselHistory', vesselHistorySchema, 'vesselHistories');

// Update vessel location and save history
app.put('/api/updateVesselLocation/:id', async (req, res) => {
    const { LATITUDE, LONGITUDE, TIMESTAMP } = req.body;
    const vesselId = req.params.id;

    try {
        if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
            return res.status(400).json({ error: 'Invalid vessel ID' });
        }

        const vessel = await TrackedVessel.findById(vesselId);
        
        if (vessel) {
            const previousLocation = {
                LATITUDE: vessel.AIS.LATITUDE,
                LONGITUDE: vessel.AIS.LONGITUDE,
                TIMESTAMP: vessel.AIS.TIMESTAMP
            };

            let historyEntry = await VesselHistory.findOne({ vesselId: vessel._id });

            if (!historyEntry) {
                historyEntry = new VesselHistory({
                    vesselId: vessel._id,
                    vesselName: vessel.AIS.NAME,
                    IMO: vessel.AIS.IMO,
                    history: [previousLocation]
                });
            } else {
                historyEntry.history.push(previousLocation);
            }

            await historyEntry.save();

            vessel.AIS.LATITUDE = LATITUDE;
            vessel.AIS.LONGITUDE = LONGITUDE;
            vessel.AIS.TIMESTAMP = TIMESTAMP;
            
            await vessel.save();
            
            res.status(200).json({ message: 'Vessel location updated and history saved' });
        } else {
            res.status(404).json({ error: 'Vessel not found' });
        }
    } catch (error) {
        console.error('Error updating vessel location:', error);
        res.status(500).json({ error: 'Failed to update vessel location' });
    }
});

// Save vessel history
app.post('/api/vesselHistory/:id', async (req, res) => {
    const { LATITUDE, LONGITUDE, TIMESTAMP } = req.body;
    const vesselId = req.params.id;

    try {
        if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
            return res.status(400).json({ error: 'Invalid vessel ID' });
        }

        let historyEntry = await VesselHistory.findOne({ vesselId });

        const geofenceFlag = req.body.geofenceFlag || null; // Get geofenceFlag from request body

        if (!historyEntry) {
            historyEntry = new VesselHistory({
                vesselId,
                history: [{ LATITUDE, LONGITUDE, TIMESTAMP, geofenceFlag }]
            });
        } else {
            historyEntry.history.push({ LATITUDE, LONGITUDE, TIMESTAMP, geofenceFlag });
        }

        await historyEntry.save();
        res.status(200).json({ message: 'History saved' });
    } catch (error) {
        console.error('Error saving vessel history:', error);
        res.status(500).json({ error: 'Failed to save history' });
    }
});


// Get vessel history by vessel ID
app.get('/api/getvesselHistory/:id', async (req, res) => {
    const vesselId = req.params.id;

    try {
        if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
            return res.status(400).json({ error: 'Invalid vessel ID' });
        }

        const historyEntry = await VesselHistory.findOne({ vesselId });

        if (!historyEntry) {
            return res.status(404).json({ error: 'History not found for this vessel' });
        }

        res.status(200).json(historyEntry);
    } catch (error) {
        console.error('Error retrieving vessel history:', error);
        res.status(500).json({ error: 'Failed to retrieve vessel history' });
    }
});

app.put('/api/updateVesselFlag/:id', async (req, res) => {
    const { geofenceFlag } = req.body;
    const vesselId = req.params.id;

    try {
        if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
            return res.status(400).json({ error: 'Invalid vessel ID' });
        }

        const vessel = await TrackedVessel.findById(vesselId);
        if (vessel) {
            vessel.geofenceFlag = geofenceFlag; // Update the geofenceFlag field
            await vessel.save();
            res.status(200).json({ message: 'Geofence flag updated successfully' });
        } else {
            res.status(404).json({ error: 'Vessel not found' });
        }
    } catch (error) {
        console.error('Error updating geofence flag:', error);
        res.status(500).json({ error: 'Failed to update geofence flag' });
    }
});


// Start the server and listen on the specified port
app.listen(port,'0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});



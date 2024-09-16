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


// Define Schema and Model
const crossingSchema = new mongoose.Schema({
    vesselName: String,
    geofenceName: String,
    timestamp: Date,
  });
  
  const Crossing = mongoose.model('Crossing', crossingSchema);
  
  // Endpoint to save crossing data
  app.post('/api/save-crossing-data', async (req, res) => {
    try {
      const { vesselName, geofenceName, timestamp } = req.body;
      const newCrossing = new Crossing({ vesselName, geofenceName, timestamp });
      await newCrossing.save();
      res.status(200).json({ message: 'Crossing data saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error saving crossing data' });
    }
  });
  
  // Endpoint to fetch crossing data
  app.get('/api/get-crossing-data', async (req, res) => {
    try {
      const crossings = await Crossing.find({});
      res.status(200).json(crossings);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching crossing data' });
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

}, { timestamps: true });

const TrackedVessel = mongoose.model('vesselstrackeds', trackedVesselSchema, 'vesselstrackeds');

const geofenceSchema = new mongoose.Schema({
    geofenceName: String,
    geofenceId: String, // Updated to match frontend
    geofenceType: { type: String, enum: ['global', 'vessel', 'port'] },
    date: { type: Date, default: Date.now, immutable: true },
    remarks: String,
    coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
        validate: {
            validator: function (v) {
                // Ensure that the coordinates are in the correct format
                return v.every(arr => Array.isArray(arr) && arr.every(coord => Array.isArray(coord) && coord.length === 2 && coord.every(num => typeof num === 'number')));
            },
            message: 'Coordinates must be an array of arrays of arrays of numbers'
        }
    }
});


const Geofence = mongoose.model('geofences', geofenceSchema, 'geofences');

app.post('/api/add-geofence', async (req, res) => {
    try {
        const { geofenceName, geofenceId, geofenceType, date, remarks, coordinates } = req.body;
        console.log(req.body);

        // Convert coordinates from { lat, lng } to [lng, lat] format
        const formattedCoordinates = coordinates.map(coord => [coord.lng, coord.lat]);

        const newGeofence = new Geofence({
            geofenceName,
            geofenceId, // Updated to match schema
            geofenceType,
            date,
            remarks,
            coordinates: [formattedCoordinates] // Wrap in an extra array if needed
        });

        await newGeofence.save();
        res.status(201).json({ message: 'Geofence data saved successfully' });
    } catch (error) {
        console.error('Error adding geofence data:', error);
        res.status(500).json({ error: 'Error adding geofence data' });
    }
});





// Route to get all geofences
app.get('/api/geofences', async (req, res) => {
    try {
        const geofences = await Geofence.find();
        res.status(200).json(geofences);
    } catch (error) {
        console.error('Error fetching geofences:', error);
        res.status(500).json({ error: 'Error fetching geofences' });
    }
});


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
  
    try {
      const newGeofence = new PolygonGeofence({
        geofenceId,
        geofenceName,
        geofenceType,
        date,
        remarks,
        coordinates,
      });
  
      await newGeofence.save();
      res.status(201).json(newGeofence);
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

// Function to check and update vessel data
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
            const updatedFields = {};
            if (apiData && (apiData.LATITUDE !== vessel.AIS.LATITUDE || apiData.LONGITUDE !== vessel.AIS.LONGITUDE)) {
                updatedFields['AIS.LATITUDE'] = apiData.LATITUDE;
                updatedFields['AIS.LONGITUDE'] = apiData.LONGITUDE;

                // Update MongoDB document
                await TrackedVessel.updateOne({ _id: vessel._id }, { $set: updatedFields });

                // Log the update
                console.log(`Vessel ${vessel.AIS.NAME} (IMO: ${imo}) updated:`, updatedFields);
            }
        }
    } catch (error) {
        console.error('Error checking and updating vessel data:', error);
    }
}


setInterval(checkAndUpdateVesselData, 60 * 10000); 

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 5000;

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

}, { timestamps: true });

const TrackedVessel = mongoose.model('vesselstrackeds', trackedVesselSchema, 'vesselstrackeds');

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

HYLA Admin`,
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

// Start the server and listen on the specified port
app.listen(port,'104.225.218.43', () => {
    console.log(`Server running on http://104.225.218.43:${port}`);
});

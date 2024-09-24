import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
import GeofenceMessage from "./GeofenceMessage";

function Geofence() {
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselEntries, setVesselEntries] = useState({});
  const [notifications, setNotifications] = useState([]);

  const handleRowClick = (vessel) => {
    const selected = vessels.find(v => v.name === vessel.vesselName);
    if (selected) {
      setSelectedVessel(selected); // Set the vessel for zoom
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel ? [selectedVessel.lat, selectedVessel.lng] : calculateMapCenter();
  const zoom = selectedVessel ? 10 : 6;

  useEffect(() => {
    axios.get("http://localhost:5000/api/get-tracked-vessels")
      .then((response) => {
        const formattedData = response.data.map((vessel) => ({
          name: vessel.AIS.NAME || "",
          lat: Number(vessel.AIS.LATITUDE) || 0,
          lng: Number(vessel.AIS.LONGITUDE) || 0,
          heading: vessel.AIS.HEADING || 0,
          destination: vessel.AIS.DESTINATION || "",
          speed: vessel.AIS.SPEED || 0,
        }));
        setVessels(formattedData);
      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
      });
  }, []);

  // Add notifications when vessels enter geofences
  const handleNewGeofenceEntry = (message) => {
    setNotifications((prev) => [
      ...prev,
      {
        title: message.title,
        date: new Date().toLocaleTimeString(),
        image: <img src={team2} alt="vessel" />,
      }
    ]);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar vesselEntries={vesselEntries}/>
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "550px" }}>
              <CardContent>
                <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                  onNewGeofenceEntry={handleNewGeofenceEntry} // Handle geofence entries
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12}>
            <Card sx={{ height: "550px" }}>
              <CardContent>
                <GeofenceMessage
                  vesselEntries={vesselEntries}
                  vessels={vessels}
                  onRowClick={handleRowClick}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;





/**
=========================================================
* Argon Dashboard 2 MUI - v3.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-material-ui
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Argon Dashboard 2 MUI layouts
import Dashboard from "layouts/dashboard";
import Dashboardcopy from "layouts/dashboardcopy";
import Geofence from "layouts/geofence";
import Dashboardemission from "layouts/dashboardemission";
import Alerts from "layouts/Alerts";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import VirtualReality from "layouts/virtual-reality";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";

const routes = [

  {
    type: "route",
    name: "Dashboard",
    key: "HYLA",
    route: "/HYLA",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="fa fa-th" />
    ),
    component: <Dashboardcopy />,
  },
  {
    type: "route",
    name: "Ship Dashboard",
    key: "dashboard",
    route: "/dashboard/:vesselId",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa fa-ship" />,
    component: <Dashboard />,
  },
  
  {
    type: "route",
    name: "Geofence",
    key: "geofence",
    route: "/Geofence",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa fa-ship" />,
    component: <Geofence />,
  },
  // {
  //   type: "route",
  //   name: "Emission Management",
  //   key: "emission",
  //   route: "/emission",
  //   icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa fa-ship" />,
  //   component: <Dashboardemission />,
  // },
  // {
  //   type: "route",
  //   name: "Alerts & Notifications",
  //   key: "Alerts",
  //   route: "/alerts",
  //   icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa fa-ship" />,
  //   component: <Alerts />,
  // },
  

  
  
    // {
    //   type: "route",
    //   name: "Billing",
    //   key: "billing",
    //   route: "/billing",
    //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="ni ni-credit-card" />,
    //   component: <Billing />,
    // },
    // {
    //   type: "route",
    //   name: "Virtual Reality",
    //   key: "virtual-reality",
    //   route: "/virtual-reality",
    //   icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-app" />,
    //   component: <VirtualReality />,
    // },
    // {
    //   type: "route",
    //   name: "RTL",
    //   key: "rtl",
    //   route: "/rtl",
    //   icon: <ArgonBox component="i" color="error" fontSize="14px" className="ni ni-world-2" />,
    //   component: <RTL />,
    // },
    // { type: "title", title: "Account Pages", key: "account-pages" },
    // {
    //   type: "route",
    //   name: "Profile",
    //   key: "profile",
    //   route: "/profile",
    //   icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    //   component: <Profile />,
    // },
  {
    type: "route",
    name: "Logout",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-single-copy-04" />
    ),
    component: <SignIn />,
  },
  // {
  //   type: "route",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   route: "/authentication/sign-up",
  //   icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-collection" />,
  //   component: <SignUp />,
  // },
];

export default routes;

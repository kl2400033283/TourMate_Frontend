import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Existing Core Pages
import OAuth2Callback from "./Pages/OAuth2Callback";
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs"; 
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Explore from "./Pages/Explore";
import City from "./Pages/City"; // General city info
import Attraction from "./Pages/Attraction";
import Plan from "./Pages/Plan";
import Homestay from "./Pages/Homestay";
import Guide from "./Pages/Guide";


// Dashboard Components
import TouristDashboard from "./Pages/TouristDashboard";
import GuideDashboard from "./Pages/GuideDashboard";
import HomestayDashboard from "./Pages/HomestayDashboard";
import AdminDashboard from "./Pages/AdminDashboard";

// Dynamic City Attraction Component (The Bangalore-style page)
// import CityAttractions from "./Pages/CityAttractions"; 

// Auth & Password Recovery Pages
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import VerifyResetOtp from "./Pages/VerifyResetOtp.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";

// Layout Components
import Navbar from "./components/Navbar";
import Chat from "./Pages/Chat";

/**
 * Layout component handles conditional rendering of the Navbar
 */
function Layout() {
  const location = useLocation();

  // Define routes where the main Navbar should be hidden
  const hideNavbarOn = [
    "/dashboard", 
    "/guide-dashboard", 
    "/host-dashboard", 
    "/admin-dashboard", 
    "/login", 
    "/signup",
    "/forgot-password",
    "/verify-reset-otp",
    "/reset-password"
  ];

  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* Public Information Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        
        {/* Authentication & Recovery Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Core Application Features */}
        <Route path="/explore" element={<Explore />} />
        
        <Route path="/city/:slug" element={<City />} />
        <Route path="/attraction" element={<Attraction />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/homestay" element={<Homestay />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/chat" element={<Chat />} />

        {/* Role-Based Dashboards */}
        <Route path="/dashboard" element={<TouristDashboard />} />
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/host-dashboard" element={<HomestayDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      </Routes>
    </>
  );
}

function App() {
  
  // Clear login state on every fresh browser/tab open
  useEffect(() => {
    if (!sessionStorage.getItem("appStarted")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.setItem("appStarted", "true");
    }
  }, []);

  // ✅ AUTO-CREATE DEMO USERS
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    let updated = false;

    const demoUsers = [
      {
        fullName: "Demo Guide",
        email: "guide@test.com",
        phone: "9999999999",
        countryCode: "+91",
        password: "1234",
        role: "guide",
        approvalStatus: "approved"
      },
      {
        fullName: "Demo Host",
        email: "host@test.com",
        phone: "8888888888",
        countryCode: "+91",
        password: "1234",
        role: "host",
        approvalStatus: "approved"
      },
      {
        fullName: "Admin Portal",
        email: "admin@test.com",
        phone: "0000000000",
        countryCode: "+91",
        password: "admin",
        role: "admin",
        approvalStatus: "approved"
      }
    ];

    demoUsers.forEach(demoUser => {
      if (!users.some((u) => u.email === demoUser.email)) {
        users.push(demoUser);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
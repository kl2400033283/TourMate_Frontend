import { useState } from "react";
import { sendOtp } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    try {
      await sendOtp(email);
      alert("OTP sent to your email");
      localStorage.setItem("resetEmail", email);
      navigate("/verify-reset-otp");
    } catch (err) {
      alert(err.response?.data || "Error sending OTP");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Background Image */}
      <img
        src="https://picsum.photos/1920/1080?nature"
        alt="bg"
        style={bgStyle}
      />

      {/* Dark Overlay */}
      <div style={overlayStyle} />

      <div style={centerStyle}>
        <div style={cardStyle}>
          {/* Back to Login */}
          <Link 
            to="/login" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "5px", 
              color: "white", 
              fontSize: "14px", 
              textDecoration: "none",
              marginBottom: "20px",
              opacity: 0.8
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div style={{ textAlign: "center" }}>
            <MapPin size={40} style={{ marginBottom: "10px", color: "#f4b400" }} />
            <h2 style={{ marginBottom: "10px" }}>Forgot Password?</h2>
            <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "25px" }}>
              Don't worry! Enter your email below to receive a verification OTP.
            </p>
          </div>

          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button onClick={handleSendOtp} style={btnStyle}>
            Send Reset OTP
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES (Provided by you, applied above) ---

const containerStyle = {
  minHeight: "100vh",
  width: "100%",
  position: "relative",
  color: "white",
  overflow: "hidden",
};

const bgStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.55)", // Slightly darker for better readability
};

const centerStyle = {
  position: "relative",
  zIndex: 1,
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardStyle = {
  width: "400px",
  padding: "35px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  outline: "none",
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#f4b400",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  marginTop: "10px",
  cursor: "pointer",
  transition: "background 0.3s ease",
};

export default ForgotPassword;
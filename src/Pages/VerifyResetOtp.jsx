import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import axios from "axios";

function VerifyResetOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email,
        otp
      });

      navigate("/reset-password");

    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div style={containerStyle}>
      <img src="https://picsum.photos/1920/1080" alt="bg" style={bgStyle} />
      <div style={overlayStyle} />

      <div style={centerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <MapPin size={40} />
            <h2>Verify OTP</h2>
            <p style={{ fontSize: "14px", opacity: 0.8 }}>
              Enter OTP sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={inputStyle}
            />

            <button style={btnStyle}>Verify OTP</button>
          </form>

          <p style={{ textAlign: "center", marginTop: "10px", opacity: 0.8 }}>
            Email: {email}
          </p>
        </div>
      </div>
    </div>
  );
}
const containerStyle = {
  minHeight: "100vh",
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
  background: "rgba(0,0,0,0.45)",
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
  padding: "30px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
};

const btnStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#f4b400",
  border: "none",
  borderRadius: "8px",
  color: "white",
  marginTop: "10px",
  cursor: "pointer",
};

export default VerifyResetOtp;




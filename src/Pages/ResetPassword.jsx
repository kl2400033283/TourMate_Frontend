import { useState } from "react";
import { resetPassword } from "../api";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleReset = async () => {
    // Prevent empty clicks or accidental submits
    if (!password) {
      alert("Please enter a new password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await resetPassword(email, password);
      alert("Password reset successful! Please login with your new password.");
      localStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Error resetting password");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Background Image */}
      <img
        src="https://picsum.photos/1920/1080?mountain"
        alt="bg"
        style={bgStyle}
      />

      {/* Dark Overlay */}
      <div style={overlayStyle} />

      <div style={centerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              backgroundColor: "rgba(244, 180, 0, 0.2)", 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              margin: "0 auto 15px"
            }}>
              <Lock size={30} style={{ color: "#f4b400" }} />
            </div>
            <h2 style={{ marginBottom: "10px" }}>Set New Password</h2>
            <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "25px" }}>
              Secure your account by choosing a strong password.
            </p>
          </div>

          <div style={{ textAlign: "left", marginBottom: "15px" }}>
            <label style={{ fontSize: "14px" }}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label style={{ fontSize: "14px" }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={handleReset} style={btnStyle}>
            Update Password
          </button>
          
          <p style={{ 
            fontSize: "12px", 
            textAlign: "center", 
            marginTop: "20px", 
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px"
          }}>
            <ShieldCheck size={14} /> Your data is encrypted and secure.
          </p>
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
  background: "rgba(0,0,0,0.5)",
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
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
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
};

export default ResetPassword;
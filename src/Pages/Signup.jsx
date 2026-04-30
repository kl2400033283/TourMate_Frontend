import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    role: "tourist",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  FIXED ONLY BACKEND CONNECTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/signup",
        {
          name: form.fullName,             
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(res.data);

      // optional navigation after signup
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Signup failed!");
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data: googleUser } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const res = await axios.post("http://localhost:8080/api/auth/google-login", {
          email: googleUser.email,
          name: googleUser.name,
          role: form.role,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        const role = (res.data.role || "tourist").toLowerCase();
        if (role === "guide") navigate("/guide-dashboard");
        else if (role === "host") navigate("/host-dashboard");
        else if (role === "admin") navigate("/admin-dashboard");
        else navigate("/");
      } catch (err) {
        alert(err.response?.data?.message || "Google signup failed!");
      }
    },
    onError: () => alert("Google login failed. Please try again."),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        color: "white",
        overflow: "hidden",
      }}
    >
      <img
        src="https://picsum.photos/1920/1080"
        alt="bg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "400px",
            padding: "30px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <MapPin size={40} />
            <h2 style={{ marginTop: "10px" }}>Create an account</h2>
            <p style={{ fontSize: "14px", opacity: 0.8 }}>
              Enter your information to get started
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Phone Number</label>

              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  style={{ ...inputStyle, width: "110px" }}
                >
                  <option value="+91">IN (+91)</option>
                  <option value="+1">US (+1)</option>
                </select>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="tourist">Tourist 🧳</option>
                <option value="guide">Guide 👨‍🏫</option>
                <option value="host">Host 🏡</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Password</label>

              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeStyle}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Confirm Password</label>

              <div style={{ position: "relative" }}>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />

                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={eyeStyle}
                >
                  {showConfirm ? <Eye /> : <EyeOff />}
                </span>
              </div>
            </div>

            <button style={btnStyle}>Create an account</button>

            <button type="button" style={outlineBtn} onClick={handleGoogleSignup}>
              Sign up with Google
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#f4b400" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
};

const eyeStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
};

const btnStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#f4b400",
  border: "none",
  borderRadius: "8px",
  color: "white",
  marginBottom: "10px",
  cursor: "pointer",
};

const outlineBtn = {
  width: "100%",
  padding: "10px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
};

export default Signup;



import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Eye, EyeOff } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // --- HELPER: Unified Redirection Logic ---
  const handleUserRedirect = (userData) => {
    const from = location.state?.from;
    // Handle "guide", "tourist", "host", "admin"
    const role = (userData.role || "tourist").toLowerCase();
    
    console.log("Redirecting based on role:", role);

    if (from && from !== "/login") {
      navigate(from, { state: { loginSuccess: true }, replace: true });
    } else {
      switch (role) {
        case "guide":
          navigate("/guide-dashboard");
          break;
        case "host":
          navigate("/host-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/dashboard"); // Tourist Dashboard
          break;
      }
    }
  };

  // --- Standard Email/Password Login ---
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }

      if (!response.ok) {
        alert(result.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result));

      handleUserRedirect(result);

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Server error. Check if your backend is running on port 8080.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", position: "relative", overflow: "hidden", color: "white" }}>
      <img
        src="https://picsum.photos/1920/1080"
        alt="Travel Background"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)" }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: "380px", padding: "40px", borderRadius: "20px", background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        }}>
          <MapPin size={48} color="#f4b400" style={{ marginBottom: "15px", display: "inline-block" }} />
          <h2 style={{ marginBottom: "10px", fontWeight: "700" }}>TourMate</h2>
          <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "30px" }}>Access your personalized travel portal</p>

          <form onSubmit={handleLogin}>
            <div style={{ textAlign: "left", marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#f4b400" }}>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px", marginTop: "8px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.2)", color: "white", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                <label style={{ fontWeight: "600", color: "#f4b400" }}>PASSWORD</label>
                <Link to="/forgot-password" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "12px", paddingRight: "42px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(0,0,0,0.2)", color: "white", outline: "none"
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>

            <button type="submit" style={{
              width: "100%", padding: "14px", backgroundColor: "#f4b400", border: "none",
              borderRadius: "10px", color: "white", fontWeight: "bold", fontSize: "16px",
              marginBottom: "15px", cursor: "pointer", transition: "0.3s"
            }}>Sign In</button>

          </form>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
            New to TourMate?{" "}
            <Link to="/signup" style={{ color: "#f4b400", fontWeight: "bold", textDecoration: "none" }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
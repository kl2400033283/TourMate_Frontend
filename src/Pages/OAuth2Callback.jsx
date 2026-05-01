import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");

    console.log("OAuth Data:", { token, email, name });

    // Store token (important)
    if (token) {
      localStorage.setItem("token", token);
    }

    // Redirect to chat (or dashboard)
    navigate("/chat");
  }, []);

  return <h2>Logging you in...</h2>;
}
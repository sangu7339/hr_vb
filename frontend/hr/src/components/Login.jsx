import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json(); // { token: "...", role: "HR" | "EMPLOYEE" }

      // Save token and role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", data.role);

      // Update parent state
      onLogin({ email, role: data.role });

      // Redirect based on role
      navigate(data.role === "HR" ? "/hr-dashboard" : "/employee-dashboard");

    } catch (err) {
      alert("Login failed: " + err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p onClick={() => navigate("/register")} style={styles.link}>
          Don’t have an account? Register
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", backgroundColor: "#f5f5f5", padding: "20px", boxSizing: "border-box" },
  card: { backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
  link: { marginTop: "15px", color: "#007bff", cursor: "pointer", fontSize: "14px" },
};

export default Login;

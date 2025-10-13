import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      // Save JWT
      localStorage.setItem("token", data.token);

      // Decode payload safely
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const role = payload.role ? payload.role.toUpperCase() : "EMPLOYEE";

      onLogin({ username: payload.sub, role });

      alert("Login successful!");

      navigate(role === "HR" ? "/hr-dashboard" : "/employee-dashboard");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p onClick={() => navigate("/register")} style={styles.link}>
          Don’t have an account? Register
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
  title: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
  link: { marginTop: "15px", color: "#007bff", cursor: "pointer", fontSize: "14px" },
};

export default Login;

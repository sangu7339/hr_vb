
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HRDashboard from "./components/HRDashboard.jsx";
import EmployeeDashboard from "./components/EmployeeDashboard.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import './App.css'


function App() {
  const [user, setUser] = useState(null);

 useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Use role from payload, default to EMPLOYEE if missing
      const role = payload.role ? payload.role.toUpperCase() : "EMPLOYEE";
      setUser({ username: payload.sub, role });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
    }
  }
}, []);


  const handleLogin = (userData) => setUser(userData);

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === "HR" ? <Navigate to="/hr-dashboard" /> : <Navigate to="/employee-dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/hr-dashboard"
          element={<ProtectedRoute allowedRole="HR"><HRDashboard user={user} /></ProtectedRoute>}
        />
        <Route
          path="/employee-dashboard"
          element={<ProtectedRoute allowedRole="EMPLOYEE"><EmployeeDashboard user={user} /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;
  
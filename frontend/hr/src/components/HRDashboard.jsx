import React from "react";
import EmpManagement from "./EmpManagement";

function HRDashboard({ user }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>HR Dashboard</h2>
        <p>Welcome, {user?.email}</p>
        <p>You can manage employees here.</p>
        <EmpManagement />
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e3f2fd",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "900px",
    textAlign: "center",
  },
};

export default HRDashboard;

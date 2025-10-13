import React from "react";

function EmployeeDashboard({ user }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Employee Dashboard</h2>
        <p>Welcome, {user.email}</p>
        <p>Here you can view your profile and work details.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e8f5e9",
    height: "100vh",
    width: "100vw", // full screen width
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "0px", // optional: remove rounding for full width
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",       // stretch card to full width
    textAlign: "center",
  },
};


export default EmployeeDashboard;

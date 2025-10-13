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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
};

export default EmployeeDashboard;

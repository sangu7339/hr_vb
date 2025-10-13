import React from "react";

function HRDashboard({ user }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>HR Dashboard</h2>
        <p>Welcome, {user?.email}</p>
        <p>You can manage employees and company data here.</p>
      </div>
    </div>
  );
}

// const styles = {
//   container: {
//     backgroundColor: "#e3f2fd",
//     height: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: "40px",
//     borderRadius: "10px",
//     boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//     textAlign: "center",
//   },
// };
const styles = {
  container: {
    backgroundColor: "#e3f2fd",
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


export default HRDashboard;

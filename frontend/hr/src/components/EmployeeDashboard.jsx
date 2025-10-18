import React from "react";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeeLeave from "./EmployeeLeave";
import EmployeeAnnouncement from "./EmployeeAnnouncement";
import EmployeeSalary from "./EmployeeSalary";

function EmployeeDashboard({ user }) {
  if (!user || !user.email || !user.employeeCode) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        Please login to access the dashboard.
      </p>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Card */}
      <div style={styles.card}>
        <h2>Employee Dashboard</h2>
        <p>Welcome, {user.email}</p>
        <p>
          Here you can view your profile, check attendance, apply for leave,
          view announcements, and salary details.
        </p>
      </div>

      {/* Sections */}
      <div style={styles.section}>
        <EmployeeAttendance user={user} />
      </div>
      <div style={styles.section}>
        <EmployeeLeave user={user} />
      </div>
      <div style={styles.section}>
        <EmployeeAnnouncement user={user} />
      </div>
      <div style={styles.section}>
        <EmployeeSalary user={user} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e8f5e9",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 0",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "80%",
    maxWidth: "900px",
    textAlign: "center",
    marginBottom: "30px",
  },
  section: {
    width: "80%",
    maxWidth: "900px",
    marginBottom: "25px",
  },
};

export default EmployeeDashboard;
n
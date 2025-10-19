import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAttendance = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- Fetch attendance data ---
  const fetchAttendance = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8080/api/attendance/my/month?email=${user.email}&year=${year}&month=${month}`,
        axiosConfig
      );
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  // --- Check-in / Check-out ---
  const handleCheckIn = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/attendance/checkin?email=${user.email}`,
        {},
        axiosConfig
      );
      alert(res.data);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to check in.");
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/attendance/checkout?email=${user.email}`,
        {},
        axiosConfig
      );
      alert(res.data);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to check out.");
    }
  };

  // --- Helper: Status color ---
  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT": return "#16a34a";
      case "LATE": return "#f59e0b";
      case "HALF_DAY": return "#eab308";
      case "ABSENT": return "#dc2626";
      case "PENDING": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  // --- Enhanced summary ---
  const summary = attendance.reduce(
    (acc, record) => {
      switch (record.status) {
        case "PRESENT": acc.present++; break;
        case "LATE": acc.late++; break;
        case "HALF_DAY": acc.halfDay++; break;
        case "ABSENT": acc.absent++; break;
        case "PENDING": acc.pending++; break;
        default: break;
      }
      return acc;
    },
    { present: 0, late: 0, halfDay: 0, absent: 0, pending: 0 }
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📅 Attendance Tracking</h2>
        <p>Welcome, {user.email}</p>
      </div>

      {/* --- Month & Year selectors --- */}
      <div style={styles.controls}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          style={styles.select}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={styles.input}
          min="2020"
          max="2030"
        />
        <button onClick={fetchAttendance} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* --- Check-in / Check-out buttons --- */}
      <div style={styles.actions}>
        <button
          onClick={handleCheckIn}
          style={{ ...styles.actionBtn, background: "#16a34a" }}
        >
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          style={{ ...styles.actionBtn, background: "#1d4ed8" }}
        >
          Check Out
        </button>
      </div>

      {/* --- Summary Cards --- */}
      <div style={styles.summaryContainer}>
        <SummaryCard title="Present" count={summary.present} color="#16a34a" />
        <SummaryCard title="Late" count={summary.late} color="#f59e0b" />
        <SummaryCard title="Half Day" count={summary.halfDay} color="#eab308" />
        <SummaryCard title="Absent" count={summary.absent} color="#dc2626" />
        <SummaryCard title="Pending" count={summary.pending} color="#3b82f6" />
      </div>

      {/* --- Attendance Table --- */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: 20 }}>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? (
              attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.checkInTime || "-"}</td>
                  <td>{a.checkOutTime || "-"}</td>
                  <td
                    style={{
                      color: getStatusColor(a.status),
                      fontWeight: "bold",
                    }}
                  >
                    {a.status}
                  </td>
                  <td>{a.reason || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", color: "#666", padding: 16 }}
                >
                  No attendance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {message && (
        <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>
          {message}
        </p>
      )}
    </div>
  );
};

// --- Summary Card Component ---
const SummaryCard = ({ title, count, color }) => (
  <div style={{ ...styles.summaryCard, backgroundColor: `${color}20` }}>
    <h4 style={{ color }}>{title}</h4>
    <p style={{ color, fontWeight: "bold", fontSize: 16 }}>{count}</p>
  </div>
);

// --- Styles ---
const styles = {
  container: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
  },
  header: { marginBottom: 20, textAlign: "center" },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  select: { padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 100 },
  refreshBtn: { padding: "8px 14px", borderRadius: 6, border: "none", background: "#6b7280", color: "white", cursor: "pointer" },
  actions: { display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 },
  actionBtn: { color: "white", padding: "10px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse" },
  summaryContainer: { display: "flex", gap: 12, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" },
  summaryCard: { padding: 12, borderRadius: 8, textAlign: "center", minWidth: 80 },
};

export default EmployeeAttendance;

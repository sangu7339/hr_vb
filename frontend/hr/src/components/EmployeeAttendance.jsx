import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  PRESENT: "#16a34a",
  LATE: "#f59e0b",
  HALF_DAY: "#eab308",
  ABSENT: "#dc2626",
  PENDING: "#3b82f6",
  DEFAULT: "#6b7280",
};

const EmployeeAttendance = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  const fetchAttendance = async () => {
    if (!user?.email || !axiosConfig) return;
    try {
      setLoading(true);
      setMessage("");
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
  }, [month, year, user?.email]);

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
    // First confirmation
    if (!window.confirm("Are you sure you want to check out?")) return;
    // Second confirmation
    if (!window.confirm("This action will finalize your attendance for today. Confirm check-out?")) return;

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

  const summary = attendance.reduce(
    (acc, record) => {
      acc[record.status?.toLowerCase()] = (acc[record.status?.toLowerCase()] || 0) + 1;
      return acc;
    },
    { present: 0, late: 0, half_day: 0, absent: 0, pending: 0 }
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={styles.container}>
      {/* Month & Year Select */}
      <div style={styles.controls}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          style={styles.select}
          aria-label="Select month"
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
          aria-label="Select year"
        />
        <button onClick={fetchAttendance} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* --- Centered Check-in / Check-out buttons --- */}
      <div style={styles.actions}>
        <button
          onClick={handleCheckIn}
          style={{ ...styles.actionBtn, background: statusColors.PRESENT }}
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
        {Object.entries(summaryColorsMapping).map(([key, label]) => (
          <SummaryCard
            key={key}
            title={label}
            count={summary[key] || 0}
            color={statusColors[key.toUpperCase()] || statusColors.DEFAULT}
          />
        ))}
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
                <tr
                  key={a.id}
                  style={{
                    backgroundColor: a.date === today ? "#f0fdf4" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <td>{a.date}</td>
                  <td>{a.checkInTime || "-"}</td>
                  <td>{a.checkOutTime || "-"}</td>
                  <td
                    style={{
                      color: statusColors[a.status] || statusColors.DEFAULT,
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
                <td colSpan="5" style={{ textAlign: "center", padding: 16, color: "#666" }}>
                  No attendance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {message && (
        <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>{message}</p>
      )}
    </div>
  );
};

const summaryColorsMapping = {
  present: "Present",
  late: "Late",
  half_day: "Half Day",
  absent: "Absent",
  pending: "Pending",
};

const SummaryCard = ({ title, count, color }) => (
  <div style={{ ...styles.summaryCard, backgroundColor: `${color}20` }}>
    <h4 style={{ color }}>{title}</h4>
    <p style={{ color, fontWeight: "bold", fontSize: 16 }}>{count}</p>
  </div>
);

const styles = {
  container: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  select: { padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 100 },
  refreshBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: "#6b7280",
    color: "white",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  actionBtn: {
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 16,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  summaryContainer: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  summaryCard: { padding: 12, borderRadius: 8, textAlign: "center", minWidth: 80 },
};

export default EmployeeAttendance;

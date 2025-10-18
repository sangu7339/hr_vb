import React, { useEffect, useState } from "react";
import axios from "axios";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    pending: 0,
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/attendance/all",
        axiosConfig
      );
      const records = res.data;
      setAttendance(records);
      filterByDate(records, selectedDate);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filterByDate = (records, date) => {
    const filtered = records.filter((r) => r.date === date);
    setFilteredData(filtered);
    updateSummary(filtered);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    filterByDate(attendance, date);
  };

  const updateSummary = (records) => {
    let present = 0,
      absent = 0,
      late = 0,
      halfDay = 0,
      pending = 0;

    records.forEach((r) => {
      const status = getTodayStatus(r);
      switch (status) {
        case "PRESENT":
          present++;
          break;
        case "ABSENT":
          absent++;
          break;
        case "LATE":
          late++;
          break;
        case "HALF_DAY":
          halfDay++;
          break;
        default:
          pending++;
      }
    });

    setSummary({ present, absent, late, halfDay, pending });
  };

  const getTodayStatus = (record) => {
    const checkIn = record.checkInTime
      ? new Date(`${record.date}T${record.checkInTime}`)
      : null;
    const checkOut = record.checkOutTime
      ? new Date(`${record.date}T${record.checkOutTime}`)
      : null;

    const nineFifty = new Date(`${record.date}T09:50:00`);
    const eleven = new Date(`${record.date}T11:00:00`);
    const twelve = new Date(`${record.date}T12:00:00`);
    const two = new Date(`${record.date}T14:00:00`);
    const sixPm = new Date(`${record.date}T18:00:00`);

    if (!checkIn) return "Pending";
    if (checkIn > two) return "ABSENT";
    if (checkIn > twelve && checkIn <= two) return "HALF_DAY";
    if (checkIn > nineFifty && checkIn <= eleven) return "LATE";
    if (checkOut && checkOut < sixPm) return "HALF_DAY";
    return "PRESENT";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return { color: "#16a34a", fontWeight: "bold" };
      case "LATE":
        return { color: "#d97706", fontWeight: "bold" };
      case "HALF_DAY":
        return { color: "#eab308", fontWeight: "bold" };
      case "ABSENT":
        return { color: "#dc2626", fontWeight: "bold" };
      default:
        return { color: "#6b7280", fontWeight: "bold" };
    }
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setEditData({
      checkInTime: record.checkInTime || "",
      checkOutTime: record.checkOutTime || "",
      status: record.status || "PENDING",
    });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/attendance/${id}/edit`,
        editData,
        axiosConfig
      );
      setEditId(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance.");
    }
  };

  if (loading)
    return <p style={styles.loading}>Loading attendance overview...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Attendance Tracking</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          style={styles.datePicker}
        />
      </div>

      {/* Summary Overview */}
      <div style={styles.summaryContainer}>
        <SummaryCard title="Present" color="#16a34a" count={summary.present} />
        <SummaryCard title="Absent" color="#dc2626" count={summary.absent} />
        <SummaryCard title="Late" color="#d97706" count={summary.late} />
        <SummaryCard title="Half Day" color="#eab308" count={summary.halfDay} />
        <SummaryCard title="Pending" color="#6b7280" count={summary.pending} />
      </div>

      {/* Attendance Table */}
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Employee</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Check-In</th>
            <th style={styles.th}>Check-Out</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((att) => {
              const status = getTodayStatus(att);
              return (
                <tr key={att.id} style={styles.tr}>
                  <td style={styles.td}>{att.user?.email || "—"}</td>
                  <td style={styles.td}>{att.date}</td>

                  {editId === att.id ? (
                    <>
                      <td style={styles.td}>
                        <input
                          type="time"
                          name="checkInTime"
                          value={editData.checkInTime}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="time"
                          name="checkOutTime"
                          value={editData.checkOutTime}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </td>
                      <td style={styles.td}>
                        <select
                          name="status"
                          value={editData.status}
                          onChange={handleChange}
                          style={styles.select}
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="LATE">LATE</option>
                          <option value="HALF_DAY">HALF_DAY</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleSave(att.id)}
                          style={styles.saveBtn}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>{att.checkInTime || "-"}</td>
                      <td style={styles.td}>{att.checkOutTime || "-"}</td>
                      <td style={{ ...styles.td, ...getStatusColor(status) }}>
                        {status}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(att)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={styles.emptyCell}>
                No attendance records for selected date.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const SummaryCard = ({ title, count, color }) => (
  <div
    style={{
      backgroundColor: `${color}20`,
      padding: "16px",
      borderRadius: "10px",
      textAlign: "center",
      flex: 1,
    }}
  >
    <h4 style={{ color, fontWeight: "bold", marginBottom: "4px" }}>{title}</h4>
    <p style={{ fontSize: "20px", fontWeight: "700", color }}>{count}</p>
  </div>
);

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginTop: "30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  datePicker: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
  },
  summaryContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  thead: {
    backgroundColor: "#f3f4f6",
  },
  th: {
    border: "1px solid #e5e7eb",
    padding: "10px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
  },
  tr: {
    transition: "background-color 0.2s ease",
  },
  td: {
    border: "1px solid #e5e7eb",
    padding: "10px",
    color: "#374151",
  },
  input: {
    padding: "4px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
  },
  select: {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
  },
  editBtn: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginRight: "6px",
  },
  cancelBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  emptyCell: {
    textAlign: "center",
    padding: "20px",
    color: "#6b7280",
    fontStyle: "italic",
  },
  loading: {
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "500",
    marginTop: "40px",
  },
  error: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "500",
    marginTop: "40px",
  },
};

export default Attendance;

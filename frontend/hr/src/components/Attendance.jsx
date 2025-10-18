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

  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalSummary, setModalSummary] = useState({
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    total: 0,
  });
  const [modalEditId, setModalEditId] = useState(null);
  const [modalEditData, setModalEditData] = useState({});
  const [modalMonth, setModalMonth] = useState(new Date().getMonth() + 1);
  const [modalYear, setModalYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- Fetch All Attendance ---
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/attendance/all", axiosConfig);
      setAttendance(res.data);
      filterByDate(res.data, selectedDate);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // --- Filter by Selected Date ---
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

  // --- Daily Summary ---
  const updateSummary = (records) => {
    const counts = { present: 0, absent: 0, late: 0, halfDay: 0, pending: 0 };
    records.forEach((r) => {
      const s = r.status || "PENDING";
      switch (s) {
        case "PRESENT": counts.present++; break;
        case "ABSENT": counts.absent++; break;
        case "LATE": counts.late++; break;
        case "HALF_DAY": counts.halfDay++; break;
        default: counts.pending++;
      }
    });
    setSummary(counts);
  };

  // --- Edit in Main Table ---
  const handleEdit = (record) => {
    setEditId(record.id);
    setEditData({
      checkInTime: record.checkInTime || "",
      checkOutTime: record.checkOutTime || "",
      status: record.status || "PENDING",
    });
  };

  const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/attendance/${id}/edit`, editData, axiosConfig);
      setEditId(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance.");
    }
  };

  // --- Email Click (open modal) ---
  const handleEmailClick = (email) => {
    setModalEmployee(email);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    setModalMonth(month);
    setModalYear(year);
    loadModalData(email, year, month);
  };

  // --- Load Data for Modal (any month/year) ---
  const loadModalData = (email, year, month) => {
    const empRecords = attendance.filter((r) => {
      const d = new Date(r.date);
      return (
        r.user?.email === email &&
        d.getMonth() + 1 === Number(month) &&
        d.getFullYear() === Number(year)
      );
    });

    let total = 0, present = 0, late = 0, halfDay = 0, absent = 0;
    empRecords.forEach((r) => {
      switch (r.status) {
        case "PRESENT": present++; total += 1; break;
        case "LATE": late++; total += 1; break;
        case "HALF_DAY": halfDay++; total += 0.5; break;
        case "ABSENT": absent++; break;
        default: break;
      }
    });

    setModalSummary({ present, late, halfDay, absent, total });
    setModalData(empRecords);
    setModalOpen(true);
  };

  // --- Edit in Modal ---
  const handleModalEdit = (record) => {
    setModalEditId(record.id);
    setModalEditData({
      checkInTime: record.checkInTime || "",
      checkOutTime: record.checkOutTime || "",
      status: record.status || "PENDING",
    });
  };

  const handleModalChange = (e) => setModalEditData({ ...modalEditData, [e.target.name]: e.target.value });

  const handleModalSave = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/attendance/${id}/edit`, modalEditData, axiosConfig);
      setModalEditId(null);
      loadModalData(modalEmployee, modalYear, modalMonth); // refresh
      fetchAttendance(); // global refresh
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance.");
    }
  };

  const displayedData = filteredData.filter((att) =>
    att.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p style={styles.loading}>Loading attendance data...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Attendance Dashboard</h2>
        <input type="date" value={selectedDate} onChange={handleDateChange} style={styles.datePicker} />
      </div>

      <input
        type="text"
        placeholder="Search employee email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.summaryContainer}>
        <SummaryCard title="Present" color="#16a34a" count={summary.present} />
        <SummaryCard title="Late" color="#d97706" count={summary.late} />
        <SummaryCard title="Half Day" color="#eab308" count={summary.halfDay} />
        <SummaryCard title="Absent" color="#dc2626" count={summary.absent} />
      </div>

      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Employee</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Check-In</th>
            <th style={styles.th}>Check-Out</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.length > 0 ? (
            displayedData.map((att) => (
              <tr key={att.id}>
                <td
                  style={{ ...styles.td, color: "#2563eb", textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => handleEmailClick(att.user?.email)}
                >
                  {att.user?.email}
                </td>
                <td style={styles.td}>{att.date}</td>

                {editId === att.id ? (
                  <>
                    <td style={styles.td}>
                      <input type="time" name="checkInTime" value={editData.checkInTime} onChange={handleChange} style={styles.input} />
                    </td>
                    <td style={styles.td}>
                      <input type="time" name="checkOutTime" value={editData.checkOutTime} onChange={handleChange} style={styles.input} />
                    </td>
                    <td style={styles.td}>
                      <select name="status" value={editData.status} onChange={handleChange} style={styles.select}>
                        <option value="PRESENT">PRESENT</option>
                        <option value="LATE">LATE</option>
                        <option value="HALF_DAY">HALF_DAY</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleSave(att.id)} style={styles.saveBtn}>Save</button>
                      <button onClick={() => setEditId(null)} style={styles.cancelBtn}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={styles.td}>{att.checkInTime || "-"}</td>
                    <td style={styles.td}>{att.checkOutTime || "-"}</td>
                    <td style={{ ...styles.td, ...getStatusColor(att.status) }}>{att.status}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(att)} style={styles.editBtn}>Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={styles.emptyCell}>No records for this date.</td></tr>
          )}
        </tbody>
      </table>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{modalEmployee} - Attendance Details</h3>

            {/* Month & Year Selectors */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <input
                type="number"
                min="2000"
                max="2100"
                value={modalYear}
                onChange={(e) => setModalYear(e.target.value)}
                style={{ ...styles.input, width: "100px" }}
              />
              <input
                type="number"
                min="1"
                max="12"
                value={modalMonth}
                onChange={(e) => setModalMonth(e.target.value)}
                style={{ ...styles.input, width: "80px" }}
              />
              <button
                onClick={() => loadModalData(modalEmployee, modalYear, modalMonth)}
                style={styles.editBtn}
              >
                Load
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <SummaryCard title="Present" color="#16a34a" count={modalSummary.present} />
              <SummaryCard title="Late" color="#d97706" count={modalSummary.late} />
              <SummaryCard title="Half Day" color="#eab308" count={modalSummary.halfDay} />
              <SummaryCard title="Absent" color="#dc2626" count={modalSummary.absent} />
              <SummaryCard title="Total" color="#2563eb" count={modalSummary.total} />
            </div>

            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check-In</th>
                  <th style={styles.th}>Check-Out</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {modalData.length > 0 ? (
                  modalData.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.date}</td>
                      {modalEditId === r.id ? (
                        <>
                          <td style={styles.td}>
                            <input type="time" name="checkInTime" value={modalEditData.checkInTime} onChange={handleModalChange} style={styles.input} />
                          </td>
                          <td style={styles.td}>
                            <input type="time" name="checkOutTime" value={modalEditData.checkOutTime} onChange={handleModalChange} style={styles.input} />
                          </td>
                          <td style={styles.td}>
                            <select name="status" value={modalEditData.status} onChange={handleModalChange} style={styles.select}>
                              <option value="PRESENT">PRESENT</option>
                              <option value="LATE">LATE</option>
                              <option value="HALF_DAY">HALF_DAY</option>
                              <option value="ABSENT">ABSENT</option>
                              <option value="PENDING">PENDING</option>
                            </select>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => handleModalSave(r.id)} style={styles.saveBtn}>Save</button>
                            <button onClick={() => setModalEditId(null)} style={styles.cancelBtn}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={styles.td}>{r.checkInTime || "-"}</td>
                          <td style={styles.td}>{r.checkOutTime || "-"}</td>
                          <td style={{ ...styles.td, ...getStatusColor(r.status) }}>{r.status}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleModalEdit(r)} style={styles.editBtn}>Edit</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={styles.emptyCell}>No records found for this month.</td></tr>
                )}
              </tbody>
            </table>

            <button style={{ ...styles.saveBtn, marginTop: "12px" }} onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---
const SummaryCard = ({ title, count, color }) => (
  <div style={{ backgroundColor: `${color}20`, padding: "12px", borderRadius: "8px", textAlign: "center", flex: 1 }}>
    <h4 style={{ color, fontWeight: "600" }}>{title}</h4>
    <p style={{ fontSize: "18px", color, fontWeight: "700" }}>{count}</p>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case "PRESENT": return { color: "#16a34a", fontWeight: "bold" };
    case "LATE": return { color: "#d97706", fontWeight: "bold" };
    case "HALF_DAY": return { color: "#eab308", fontWeight: "bold" };
    case "ABSENT": return { color: "#dc2626", fontWeight: "bold" };
    default: return { color: "#6b7280", fontWeight: "bold" };
  }
};

const styles = {
  container: { background: "#fff", padding: 24, borderRadius: 12, marginTop: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "700" },
  datePicker: { padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  searchInput: { marginTop: 10, padding: 8, width: 260, borderRadius: 6, border: "1px solid #ccc" },
  summaryContainer: { display: "flex", gap: 12, margin: "20px 0", flexWrap: "wrap" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f9fafb" },
  th: { border: "1px solid #e5e7eb", padding: 8 },
  td: { border: "1px solid #e5e7eb", padding: 8 },
  input: { width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ccc" },
  select: { width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ccc" },
  editBtn: { background: "#2563eb", color: "#fff", padding: "5px 8px", borderRadius: 6, border: "none" },
  saveBtn: { background: "#16a34a", color: "#fff", padding: "5px 8px", borderRadius: 6, border: "none", marginRight: 4 },
  cancelBtn: { background: "#dc2626", color: "#fff", padding: "5px 8px", borderRadius: 6, border: "none" },
  emptyCell: { textAlign: "center", padding: 16, color: "#6b7280" },
  loading: { textAlign: "center", color: "#2563eb" },
  error: { textAlign: "center", color: "#dc2626" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },
  modalContent: { background: "#fff", padding: 20, borderRadius: 12, maxWidth: 800, width: "90%", maxHeight: "80vh", overflowY: "auto" },
};

export default Attendance;

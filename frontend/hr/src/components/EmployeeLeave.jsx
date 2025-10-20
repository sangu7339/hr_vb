import React, { useState, useEffect } from "react";
import axios from "axios";

const MAX_LEAVE_DAYS = 3;
const HR_EMAIL = "hr@company.com"; // Replace with actual HR email

const EmployeeLeave = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });
  const [message, setMessage] = useState("");
  const [showContactHR, setShowContactHR] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchLeaves = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/leave/my?email=${user.email}`, axiosConfig);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const openForm = (leave = null) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
      });
    } else {
      setEditingLeave(null);
      setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
    }
    setShowForm(true);
    setMessage("");
    setShowContactHR(false);
  };

  const calculateDays = (start, end) => {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleApplyLeave = async () => {
    const days = calculateDays(formData.startDate, formData.endDate);

    if (days <= 0) {
      setMessage("❌ End date must be after start date.");
      return;
    }

    if (days > MAX_LEAVE_DAYS) {
      setShowContactHR(true);
      setMessage(`Leave exceeds maximum ${MAX_LEAVE_DAYS} days.`);
      return;
    }

    try {
      if (editingLeave) {
        await axios.put(
          `http://localhost:8080/api/leave/${editingLeave.id}/edit?email=${user.email}`,
          formData,
          axiosConfig
        );
        setMessage("✅ Leave updated successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/leave/apply?email=${user.email}`,
          formData,
          axiosConfig
        );
        setMessage("✅ Leave applied successfully");
      }

      setShowForm(false);
      setEditingLeave(null);
      setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
      setShowContactHR(false);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message;
      setMessage(`❌ Failed to submit leave: ${errorMsg}`);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/leave/${leaveId}/delete?email=${user.email}`, axiosConfig);
      setMessage("✅ Leave deleted successfully");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message;
      setMessage(`❌ Failed to delete leave: ${errorMsg}`);
    }
  };

  return (
    <div style={styles.fullScreenContainer}>
      <div style={styles.contentWrapper}>
        <h3>My Leaves</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map(l => (
                    <tr key={l.id}>
                      <td>{l.leaveType}</td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td>{l.days}</td>
                      <td>{l.leaveStatus}</td>
                      <td>{l.reason}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        {l.leaveStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => openForm(l)}
                              style={styles.editButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLeave(l.id)}
                              style={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 16 }}>No leave records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {message && (
          <p style={{ color: message.includes("❌") ? "red" : "green", marginTop: 10 }}>{message}</p>
        )}

        {!showForm && (
          <button
            onClick={() => openForm()}
            style={styles.applyButton}
          >
            Apply Leave
          </button>
        )}

        {showForm && (
          <div style={styles.formContainer}>
            <h4>{editingLeave ? "Edit Leave" : "Apply Leave"}</h4>

            <select
              value={formData.leaveType}
              onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Type</option>
              <option value="SICK">Sick</option>
              <option value="CASUAL">Casual</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                style={{ flex: 1, ...styles.input }}
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                style={{ flex: 1, ...styles.input }}
              />
            </div>

            <input
              type="text"
              placeholder="Reason"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              style={styles.input}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={handleApplyLeave}
                style={styles.submitButton}
              >
                {editingLeave ? "Update" : "Submit"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingLeave(null);
                  setMessage("");
                  setShowContactHR(false);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showContactHR && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p>Leave exceeds maximum allowed days. Please contact HR.</p>
            <a
              href={`mailto:${HR_EMAIL}?subject=Leave%20Request%20Assistance&body=Hi%20HR,%20I%20need%20assistance%20with%20my%20leave%20request.`}
            >
              <button style={styles.contactHRButton}>
                Contact HR
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  fullScreenContainer: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#f0f2f5",
    padding: 20,
    boxSizing: "border-box",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 1200,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    boxSizing: "border-box",
    flex: 1,
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  editButton: {
    padding: "4px 8px",
    borderRadius: 4,
    background: "#16a34a",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "4px 8px",
    borderRadius: 4,
    background: "#dc2626",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  applyButton: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 6,
    background: "#1d4ed8",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  formContainer: {
    marginTop: 20,
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  submitButton: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "#16a34a",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "#ccc",
    color: "#333",
    border: "none",
    cursor: "pointer",
  },
  contactHRButton: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "#1d4ed8",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default EmployeeLeave;

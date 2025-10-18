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

  const handleApplyLeave = async () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24) + 1;

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
        await axios.post(`http://localhost:8080/api/leave/apply?email=${user.email}`, formData, axiosConfig);
        setMessage("✅ Leave applied successfully");
      }
      setShowForm(false);
      setEditingLeave(null);
      setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
      setShowContactHR(false);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit leave.");
    }
  };

  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, marginTop: 20, width: "80%", maxWidth: 900 }}>
      <h3>My Leaves</h3>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            {leaves.length > 0 ? leaves.map(l => (
              <tr key={l.id}>
                <td>{l.leaveType}</td>
                <td>{l.startDate}</td>
                <td>{l.endDate}</td>
                <td>{l.days}</td>
                <td>{l.leaveStatus}</td>
                <td>{l.reason}</td>
                <td>
                  {l.leaveStatus === "PENDING" && (
                    <button
                      onClick={() => openForm(l)}
                      style={{ padding: "4px 8px", borderRadius: 4, background: "#16a34a", color: "white", border: "none", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 16 }}>No leave records found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {message && <p style={{ color: message.includes("❌") ? "red" : "green", marginTop: 10 }}>{message}</p>}

      {!showForm && <button onClick={() => openForm()} style={{ marginTop: 20, padding: "8px 16px", borderRadius: 6 }}>Apply Leave</button>}

      {showForm && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
          <h4>{editingLeave ? "Edit Leave" : "Apply Leave"}</h4>
          <select value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}>
            <option value="">Select Type</option>
            <option value="SICK">Sick</option>
            <option value="CASUAL">Casual</option>
            
          </select>
          <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
          <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
          <input type="text" placeholder="Reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          <div style={{ marginTop: 10 }}>
            <button onClick={handleApplyLeave} style={{ marginRight: 10 }}>{editingLeave ? "Update" : "Submit"}</button>
            <button onClick={() => { setShowForm(false); setEditingLeave(null); setMessage(""); setShowContactHR(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Contact HR Button */}
      {showContactHR && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p>Leave exceeds maximum allowed days. Please contact HR.</p>
          <a href={`mailto:${HR_EMAIL}?subject=Leave%20Request%20Assistance&body=Hi%20HR,%20I%20need%20assistance%20with%20my%20leave%20request.`}>
            <button style={{ padding: "8px 16px", borderRadius: 6, background: "#1d4ed8", color: "white", border: "none", cursor: "pointer" }}>
              Contact HR
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;

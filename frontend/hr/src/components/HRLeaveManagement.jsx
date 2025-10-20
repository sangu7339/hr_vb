import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HRLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(""); 
  const [showReason, setShowReason] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/leave/all`, axiosConfig);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.put(`${API_URL}/api/leave/${id}/status?leaveStatus=${status}`, {}, axiosConfig);
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update leave status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openReason = (reason) => {
    setSelectedReason(reason);
    setShowReason(true);
  };
  const closeReason = () => {
    setSelectedReason("");
    setShowReason(false);
  };
  const handleOverlayClick = (e) => { if (e.target.id === "reasonOverlay") closeReason(); };

  if (loading) return <p style={styles.message}>Loading leave requests...</p>;
  if (error) return <p style={{ ...styles.message, color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" />
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>Employee</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Start Date</th>
            <th style={styles.th}>End Date</th>
            <th style={styles.th}>Days</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Approved By</th>
            <th style={styles.th}>Approved On</th>
            <th style={styles.th}>Reason</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id} style={styles.tableRow}>
              <td style={styles.td}>{leave.employee?.email || "-"}</td>
              <td style={styles.td}>{leave.leaveType}</td>
              <td style={styles.td}>{new Date(leave.startDate).toLocaleDateString()}</td>
              <td style={styles.td}>{new Date(leave.endDate).toLocaleDateString()}</td>
              <td style={styles.td}>{leave.days}</td>
              <td style={{
                ...styles.td, fontWeight: "bold",
                color: leave.leaveStatus === "APPROVED" ? "green" :
                       leave.leaveStatus === "REJECTED" ? "red" : "blue"
              }}>{leave.leaveStatus}</td>
              <td style={styles.td}>{leave.approvedByHr || "-"}</td>
              <td style={styles.td}>{leave.approvedOn ? new Date(leave.approvedOn).toLocaleDateString() : "-"}</td>
              <td style={styles.td}>
                {leave.reason ? (
                  <button
                    style={{ ...styles.button, ...styles.viewButton }}
                    onClick={() => openReason(leave.reason)}
                  >View</button>
                ) : "-"}
              </td>
              <td style={styles.td}>
                <button
                  onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                  disabled={updatingId === leave.id}
                  style={{
                    ...styles.button,
                    ...styles.approveButton,
                    cursor: updatingId === leave.id ? "not-allowed" : "pointer",
                    marginBottom: "4px"
                  }}
                >{updatingId === leave.id ? "Updating..." : "Approve"}</button>
                <button
                  onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                  disabled={updatingId === leave.id}
                  style={{
                    ...styles.button,
                    ...styles.rejectButton,
                    cursor: updatingId === leave.id ? "not-allowed" : "pointer"
                  }}
                >{updatingId === leave.id ? "Updating..." : "Reject"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showReason && (
        <div id="reasonOverlay" style={styles.reasonOverlay} onClick={handleOverlayClick}>
          <div style={styles.reasonBox}>
            <h4>Leave Reason</h4>
            <p style={styles.reasonText}>{selectedReason}</p>
            <button onClick={closeReason} style={{ ...styles.button, backgroundColor: "#007bff", marginTop: "10px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)" },
  tableHeaderRow: { backgroundColor: "#007bff", color: "#fff" },
  th: { padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" },
  tableRow: { borderBottom: "1px solid #ddd", transition: "background-color 0.2s" },
  td: { padding: "10px", textAlign: "left" },
  button: { padding: "5px 10px", marginRight: "5px", border: "none", borderRadius: "4px", color: "#fff" },
  approveButton: { backgroundColor: "green" },
  rejectButton: { backgroundColor: "red" },
  viewButton: { backgroundColor: "#007bff" },
  message: { padding: "20px", fontSize: "16px" },
  reasonOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  reasonBox: { backgroundColor: "#fff", padding: "15px", borderRadius: "6px", width: "300px", textAlign: "center", boxShadow: "0 0 8px rgba(0,0,0,0.2)" },
  reasonText: { wordWrap: "break-word", fontSize: "14px" },
};

export default HRLeaveManagement;

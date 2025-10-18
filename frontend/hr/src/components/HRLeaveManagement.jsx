import React, { useEffect, useState } from "react";
import axios from "axios";

const HRLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/leave/all", axiosConfig);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8080/api/leave/${id}/status?leaveStatus=${status}`,
        {},
        axiosConfig
      );
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to update leave status.");
    }
  };

  if (loading) return <p>Loading leave requests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>HR Leave Management</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{leave.employee?.email || "-"}</td>
              <td>{leave.leaveType}</td>
              <td>{leave.startDate}</td>
              <td>{leave.endDate}</td>
              <td>{leave.days}</td>
              <td>{leave.leaveStatus}</td>
              <td>{leave.reason || "-"}</td>
              <td>
                {leave.leaveStatus === "PENDING" && (
                  <>
                    <button onClick={() => handleStatusUpdate(leave.id, "APPROVED")}>
                      Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(leave.id, "REJECTED")}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HRLeaveManagement;
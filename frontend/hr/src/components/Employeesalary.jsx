import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeSalary = ({ user }) => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchSalary = async () => {
    if (!user?.employeeCode || !token) {
      setError("❌ User information missing. Please login.");
      setLoading(false);
      navigate("/login"); // Redirect to login
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:8080/api/salary/my?employeeCode=${user.employeeCode}`,
        axiosConfig
      );

      setSalaries(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch salary records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, [user, navigate]); // Added navigate to dependencies

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading salary data...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!salaries.length)
    return <p style={{ textAlign: "center" }}>No salary records found.</p>;

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>💰 Salary Records</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Month/Year</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th>Bank</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{new Date(s.payslipDate).toLocaleDateString()}</td>
              <td>{s.month}/{s.year}</td>
              <td>${s.netPay.toFixed(2)}</td>
              <td>{s.status}</td>
              <td>{s.bankName} ({s.accountNumber})</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeSalary;
import React, { useEffect, useState } from "react";
import axios from "axios";

const HRSalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPayslip, setShowAddPayslip] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  const [formData, setFormData] = useState({
    employeeCode: "",
    basicPay: "",
    hra: "",
    allowances: "",
    deductions: "",
    bankName: "",
    accountNumber: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [editFormData, setEditFormData] = useState({
    basicPay: "",
    hra: "",
    allowances: "",
    deductions: "",
    bankName: "",
    accountNumber: "",
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- Role-based Access ---
  if (role !== "HR") {
    return (
      <p style={{ color: "red", fontWeight: "bold", textAlign: "center", marginTop: 50 }}>
        Access denied ❌. Make sure you are logged in as HR.
      </p>
    );
  }

  // --- Fetch Salaries by month/year ---
  const fetchSalaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/salary/all/month?month=${formData.month}&year=${formData.year}`,
        axiosConfig
      );
      setSalaries(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch salary records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [formData.month, formData.year]);

  // --- Handle Input Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["basicPay", "hra", "allowances", "deductions", "month", "year"];
    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? Number(value) : value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["basicPay", "hra", "allowances", "deductions"];
    setEditFormData({
      ...editFormData,
      [name]: numericFields.includes(name) ? Number(value) : value,
    });
  };

  // --- Add Payslip ---
  const handleAddPayslip = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/generate`, null, {
        params: formData,
        ...axiosConfig,
      });
      alert("Payslip added successfully ✅");
      setShowAddPayslip(false);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error adding payslip ❌");
    }
  };

  // --- Edit / Update Salary (even after paid) ---
  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/hike`, null, {
        params: {
          employeeCode: editingSalary.employee.employeeId,
          newBasic: editFormData.basicPay,
          newHra: editFormData.hra,
          newAllowances: editFormData.allowances,
          newDeductions: editFormData.deductions,
          month: editingSalary.month,
          year: editingSalary.year,
          bankName: editFormData.bankName,
          accountNumber: editFormData.accountNumber,
        },
        ...axiosConfig,
      });
      alert("Salary updated successfully ✅");
      setEditingSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error updating salary ❌");
    }
  };

  // --- Start editing ---
  const startEdit = (salary) => {
    setEditingSalary(salary);
    setEditFormData({
      basicPay: salary.basicPay,
      hra: salary.hra,
      allowances: salary.allowances,
      deductions: salary.deductions,
      bankName: salary.bankName,
      accountNumber: salary.accountNumber,
    });
  };

  const cancelEdit = () => setEditingSalary(null);

  // --- Mark as Paid ---
  const markPaid = async (salaryId) => {
    try {
      await axios.put(`http://localhost:8080/api/salary/${salaryId}/pay`, {}, axiosConfig);
      alert("Salary marked as PAID ✅");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error updating salary ❌");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 20 }}>Loading salary records...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</p>;

  return (
    <div className="container">
      <h2>💼 HR Salary Management</h2>

      {/* --- Filter by Month / Year --- */}
      <div style={{ marginBottom: 15 }}>
        <select name="month" value={formData.month} onChange={handleChange}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          style={{ marginLeft: 10, width: 80 }}
        />
        <button onClick={fetchSalaries} style={{ marginLeft: 10 }}>
          Refresh
        </button>
      </div>

      {/* --- Add Payslip --- */}
      <button onClick={() => setShowAddPayslip(!showAddPayslip)}>
        {showAddPayslip ? "Cancel" : "Add Payslip"}
      </button>

      {showAddPayslip && (
        <form onSubmit={handleAddPayslip} style={{ margin: "15px 0" }}>
          {["employeeCode", "basicPay", "hra", "allowances", "deductions", "bankName", "accountNumber"].map((f) => (
            <input
              key={f}
              name={f}
              value={formData[f]}
              onChange={handleChange}
              placeholder={f}
              type={["basicPay","hra","allowances","deductions"].includes(f) ? "number" : "text"}
              required
              style={{ marginRight: 10, marginBottom: 5 }}
            />
          ))}
          <button type="submit">Save Payslip</button>
        </form>
      )}

      {/* --- Salary Table --- */}
      <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Basic</th>
            <th>HRA</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id}>
              <td>{s.employee?.name}</td>
              <td>{s.basicPay}</td>
              <td>{s.hra}</td>
              <td>{s.allowances}</td>
              <td>{s.deductions}</td>
              <td style={{ fontWeight: "bold" }}>{s.netPay}</td>
              <td style={{ fontWeight: "bold", color: s.status === "PAID" ? "green" : s.status === "PENDING" ? "orange" : "blue" }}>
                {s.status}
              </td>
              <td>
                <button onClick={() => startEdit(s)}>Edit</button>
                <button onClick={() => markPaid(s.id)} style={{ marginLeft: 5 }}>Mark Paid</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Edit Form --- */}
      {editingSalary && (
        <div style={{ marginTop: 20 }}>
          <h3>Editing Salary for {editingSalary.employee?.name}</h3>
          <form onSubmit={handleUpdateSalary}>
            {["basicPay","hra","allowances","deductions","bankName","accountNumber"].map((f) => (
              <input
                key={f}
                name={f}
                value={editFormData[f]}
                onChange={handleEditChange}
                type={["basicPay","hra","allowances","deductions"].includes(f) ? "number" : "text"}
                placeholder={f}
                required
                style={{ marginRight: 10, marginBottom: 5 }}
              />
            ))}
            <button type="submit">Update</button>
            <button type="button" onClick={cancelEdit} style={{ marginLeft: 5 }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSalaryManagement;

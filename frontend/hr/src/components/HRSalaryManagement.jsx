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
    basicPay: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
    bankName: "",
    accountNumber: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payslipDate: "",
    paidDate: "",
  });

  const [editFormData, setEditFormData] = useState({
    basicPay: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
    bankName: "",
    accountNumber: "",
    status: "PENDING",
    payslipDate: "",
    paidDate: "",
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Role-based access
  if (role !== "HR") {
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 50 }}>
        Access denied ❌. Please log in as HR.
      </p>
    );
  }

  // Fetch salaries
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

  // Add payslip
  const handleAddPayslip = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/generate`, null, {
        params: formData,
        ...axiosConfig,
      });
      alert("Payslip added ✅");
      setShowAddPayslip(false);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error adding payslip ❌");
    }
  };

  // Start edit
  const startEdit = (salary) => {
    setEditingSalary(salary);
    setEditFormData({
      basicPay: salary.basicPay,
      hra: salary.hra,
      allowances: salary.allowances,
      deductions: salary.deductions,
      bankName: salary.bankName,
      accountNumber: salary.accountNumber,
      status: salary.status,
      payslipDate: salary.payslipDate || "",
      paidDate: salary.paidDate || "",
    });
  };

  const cancelEdit = () => setEditingSalary(null);

  // Update salary
  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/api/salary/${editingSalary.id}/update`,
        null,
        {
          params: {
            ...editFormData,
            payslipDate: editFormData.payslipDate || undefined,
            paidDate: editFormData.paidDate || undefined,
          },
          ...axiosConfig,
        }
      );
      alert("Salary updated ✅");
      setEditingSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error updating salary ❌");
    }
  };

  // Delete salary
  const handleDelete = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/salary/${salaryId}`, axiosConfig);
      alert("Salary deleted ✅");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error deleting salary ❌");
    }
  };

  // Mark paid
  const markPaid = async (salaryId) => {
    try {
      await axios.put(`http://localhost:8080/api/salary/${salaryId}/pay`, {}, axiosConfig);
      alert("Salary marked as PAID ✅");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error marking paid ❌");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="container">
      <h2>💼 HR Salary Management</h2>

      {/* Month/Year filter */}
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

      {/* Add payslip */}
      <button onClick={() => setShowAddPayslip(!showAddPayslip)}>
        {showAddPayslip ? "Cancel" : "Add Payslip"}
      </button>

      {showAddPayslip && (
        <form onSubmit={handleAddPayslip} style={{ margin: "10px 0" }}>
          {["employeeCode","basicPay","hra","allowances","deductions","bankName","accountNumber"].map((f) => (
            <input
              key={f}
              name={f}
              value={formData[f]}
              onChange={handleChange}
              placeholder={f}
              type={["basicPay","hra","allowances","deductions"].includes(f) ? "number" : "text"}
              required
              style={{ marginRight: 5, marginBottom: 5 }}
            />
          ))}

          {/* Payslip & Paid Date */}
          <input
            type="date"
            name="payslipDate"
            
            value={formData.payslipDate || ""}
            onChange={handleChange}
            required
            style={{ marginRight: 5, marginBottom: 5 }}
          />
          <input
            type="date"
            name="paidDate"
            value={formData.paidDate || ""}
            onChange={handleChange}
            style={{ marginRight: 5, marginBottom: 5 }}
          />

          {/* Month/Year */}
          {/* <select
            name="month"
            value={formData.month}
            onChange={handleChange}
            style={{ marginRight: 5, marginBottom: 5 }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select> */}
          {/* <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            style={{ marginRight: 5, width: 80, marginBottom: 5 }}
            required
          /> */}

          <button type="submit">Save Payslip</button>
        </form>
      )}

      {/* Salary Table */}
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
            <th>Payslip Date</th>
            <th>Paid Date</th>
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
              <td>{s.netPay}</td>
              <td>{s.status}</td>
              <td>{s.payslipDate || "-"}</td>
              <td>{s.paidDate || "-"}</td>
              <td>
                <button onClick={() => startEdit(s)}>Edit</button>
                <button onClick={() => markPaid(s.id)} style={{ marginLeft: 5 }}>
                  Mark Paid
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ marginLeft: 5, color:"red" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Form */}
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
                placeholder={f}
                type="number"
                required
                style={{ marginRight: 5, marginBottom: 5 }}
              />
            ))}

            {/* Status Dropdown */}
            <select
              name="status"
              value={editFormData.status}
              onChange={handleEditChange}
              style={{ marginRight: 5, marginBottom: 5 }}
            >
              <option value="CURRENT">CURRENT</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>

            {/* Payslip Date */}
            <input
              type="date"
              name="payslipDate"
              value={editFormData.payslipDate || ""}
              onChange={handleEditChange}
              style={{ marginRight: 5, marginBottom: 5 }}
              required
            />
            {/* Paid Date */}
            <input
              type="date"
              name="paidDate"
              value={editFormData.paidDate || ""}
              onChange={handleEditChange}
              style={{ marginRight: 5, marginBottom: 5 }}
            />

            <button type="submit">Update</button>
            <button type="button" onClick={cancelEdit} style={{ marginLeft: 5 }}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSalaryManagement;

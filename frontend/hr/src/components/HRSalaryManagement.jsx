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
  const role = localStorage.getItem("role"); // Get role from localStorage
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Role-based access: show message if not HR
  if (role !== "HR") {
    return (
      <p style={{ color: "red", fontWeight: "bold", textAlign: "center", marginTop: "50px" }}>
        Access denied ❌. Make sure you are logged in as HR.
      </p>
    );
  }

  // Fetch all salaries by month/year
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

  // Handle form inputs
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

  // Add a new salary
  const handleAddPayslip = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/generate`, null, {
        params: formData,
        ...axiosConfig,
      });
      alert("Payslip added successfully ✅");
      fetchSalaries();
      setShowAddPayslip(false);
    } catch (err) {
      console.error(err);
      alert("Error adding payslip ❌");
    }
  };

  // Mark as paid
  const markPaid = async (salaryId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/salary/${salaryId}/pay`,
        {},
        axiosConfig
      );
      alert("Salary marked as PAID ✅");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert("Error updating salary ❌");
    }
  };

  // Edit salary
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

  // Apply hike (update)
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
          month: formData.month,
          year: formData.year,
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

  if (loading) return <p className="loading">Loading salary records...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h2 className="title">💼 HR Salary Management</h2>

      <button
        className="toggle-button"
        onClick={() => setShowAddPayslip(!showAddPayslip)}
      >
        {showAddPayslip ? "Cancel" : "Add Payslip"}
      </button>

      {showAddPayslip && (
        <form className="form" onSubmit={handleAddPayslip}>
          {[
            { name: "employeeCode", placeholder: "Employee Code", type: "text" },
            { name: "basicPay", placeholder: "Basic Pay", type: "number" },
            { name: "hra", placeholder: "HRA", type: "number" },
            { name: "allowances", placeholder: "Allowances", type: "number" },
            { name: "deductions", placeholder: "Deductions", type: "number" },
            { name: "bankName", placeholder: "Bank Name", type: "text" },
            { name: "accountNumber", placeholder: "Account Number", type: "text" },
          ].map((f) => (
            <input
              key={f.name}
              type={f.type}
              name={f.name}
              placeholder={f.placeholder}
              value={formData[f.name]}
              onChange={handleChange}
              required
            />
          ))}
          <button type="submit">Save Payslip</button>
        </form>
      )}

      <table className="table">
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
              <td
                className={
                  s.status === "PAID"
                    ? "status-paid"
                    : s.status === "PENDING"
                    ? "status-pending"
                    : "status-processing"
                }
              >
                {s.status}
              </td>
              <td className="action-buttons">
                {s.status !== "PAID" && (
                  <>
                    <button onClick={() => markPaid(s.id)} className="mark-paid">
                      Mark Paid
                    </button>
                    <button onClick={() => startEdit(s)} className="edit">
                      Edit
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingSalary && (
        <div className="edit-form">
          <h3>Editing Salary for {editingSalary.employee?.name}</h3>
          <form className="form" onSubmit={handleUpdateSalary}>
            {[
              { name: "basicPay", label: "Basic Pay" },
              { name: "hra", label: "HRA" },
              { name: "allowances", label: "Allowances" },
              { name: "deductions", label: "Deductions" },
              { name: "bankName", label: "Bank Name" },
              { name: "accountNumber", label: "Account Number" },
            ].map((f) => (
              <input
                key={f.name}
                type={f.name.includes("bank") ? "text" : "number"}
                name={f.name}
                value={editFormData[f.name]}
                onChange={handleEditChange}
                placeholder={f.label}
                required
              />
            ))}
            <button type="submit">Update</button>
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSalaryManagement;

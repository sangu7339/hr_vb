import React, { useEffect, useState } from "react";
import axios from "axios";

const HRSalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPayslip, setShowAddPayslip] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  const [formData, setFormData] = useState({
    employeeCode: "", // ⚡ changed from employeeId
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
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch all salaries by month/year
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

  // ✅ Handle form inputs
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

  // ✅ Add a new salary
  const handleAddPayslip = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/generate`, null, {
        params: formData, // now uses employeeCode
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

  // ✅ Mark as paid
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

  // ✅ Edit salary
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

  // ✅ Apply hike (update)
  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/salary/hike`, null, {
        params: {
          employeeCode: editingSalary.employee.employeeId, // ⚡ use employeeCode
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

  // ✅ UI States
  if (loading) return <p>Loading salary records...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">💼 HR Salary Management</h2>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowAddPayslip(!showAddPayslip)}
      >
        {showAddPayslip ? "Cancel" : "Add Payslip"}
      </button>

      {/* Add Salary Form */}
      {showAddPayslip && (
        <form className="flex flex-wrap gap-3 mb-6" onSubmit={handleAddPayslip}>
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
              className="border p-2 rounded"
            />
          ))}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Payslip
          </button>
        </form>
      )}

      {/* Salary Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Employee</th>
            <th className="border px-3 py-2">Basic</th>
            <th className="border px-3 py-2">HRA</th>
            <th className="border px-3 py-2">Allowances</th>
            <th className="border px-3 py-2">Deductions</th>
            <th className="border px-3 py-2">Net Pay</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id}>
              <td className="border px-3 py-2">{s.employee?.name}</td>
              <td className="border px-3 py-2">{s.basicPay}</td>
              <td className="border px-3 py-2">{s.hra}</td>
              <td className="border px-3 py-2">{s.allowances}</td>
              <td className="border px-3 py-2">{s.deductions}</td>
              <td className="border px-3 py-2 font-semibold">{s.netPay}</td>
              <td
                className={`border px-3 py-2 ${
                  s.status === "PAID"
                    ? "text-green-600"
                    : s.status === "PENDING"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {s.status}
              </td>
              <td className="border px-3 py-2 flex gap-2">
                {s.status !== "PAID" && (
                  <>
                    <button
                      onClick={() => markPaid(s.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => startEdit(s)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Salary Form */}
      {editingSalary && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-3">
            Editing Salary for {editingSalary.employee?.name}
          </h3>
          <form className="flex flex-wrap gap-3" onSubmit={handleUpdateSalary}>
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
                className="border p-2 rounded"
              />
            ))}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSalaryManagement;

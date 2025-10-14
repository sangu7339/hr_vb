import React, { useState, useEffect } from "react";
import axios from "axios";

const EmpManagement = ({ user, axiosConfig }) => {
  const [employees, setEmployees] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    department: "",
    deptRole: "",
    status: "ACTIVE",
    user: { email: "", password: "" },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:8080/api/hr/employees";

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (editEmployee) {
      setFormData({
        employeeId: editEmployee.employeeId || "",
        name: editEmployee.name || "",
        department: editEmployee.department || "",
        deptRole: editEmployee.deptRole || "",
        status: editEmployee.status || "ACTIVE",
        user: {
          email: editEmployee.user?.email || "",
          password: "",
        },
      });
    } else {
      setFormData({
        employeeId: "",
        name: "",
        department: "",
        deptRole: "",
        status: "ACTIVE",
        user: { email: "", password: "" },
      });
    }
  }, [editEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL, axiosConfig);
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error.response || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "password") {
      setFormData({ ...formData, user: { ...formData.user, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let response;
      if (editEmployee) {
        response = await axios.put(`${API_URL}/${editEmployee.id}`, formData, axiosConfig);
        setEmployees(employees.map(emp => (emp.id === response.data.id ? response.data : emp)));
        setEditEmployee(null);
      } else {
        response = await axios.post(API_URL, formData, axiosConfig);
        setEmployees([...employees, response.data]);
      }

      setMessage("✅ Operation successful!");
      setFormData({
        employeeId: "",
        name: "",
        department: "",
        deptRole: "",
        status: "ACTIVE",
        user: { email: "", password: "" },
      });
    } catch (error) {
      console.error("Error:", error.response || error.message);
      setMessage(error.response?.data?.message || "⚠️ Operation failed.");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, axiosConfig);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (error) {
      console.error("Failed to delete employee:", error.response || error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Employee Management</h2>
        <p>Welcome, {user?.email}</p>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="User Email"
            value={formData.user.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (optional)"
            value={formData.user.password || ""}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="deptRole"
            placeholder="Role"
            value={formData.deptRole}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Saving..." : editEmployee ? "Update Employee" : "Add Employee"}
          </button>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}

        {/* Employee List */}
        <h3 style={{ marginTop: "30px" }}>All Employees</h3>
        {employees.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.employeeId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.user?.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.deptRole}</td>
                  <td>{emp.status}</td>
                  <td>
                    <button style={styles.editBtn} onClick={() => setEditEmployee(emp)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No employees found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: "#e3f2fd", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box" },
  card: { backgroundColor: "#fff", padding: "40px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "900px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#1976d2", color: "#fff", fontSize: "16px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  editBtn: { marginRight: "10px", backgroundColor: "#ffc107", color: "#000", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" },
  deleteBtn: { backgroundColor: "#dc3545", color: "#fff", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" },
};

export default EmpManagement;

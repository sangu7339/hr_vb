import React, { useState, useEffect } from "react";
import axios from "axios";

// Main HR Dashboard
function HRDashboard({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null); // For editing

  const API_URL = "http://localhost:8080/api/hr/employees";
  const token = localStorage.getItem("token"); // JWT token

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, axiosConfig);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error.response || error.message);
      setMessage("Failed to fetch employees.");
    }
    setLoading(false);
  };

  // Add or update employee
  const handleEmployeeAddedOrUpdated = (employee) => {
    if (editEmployee) {
      // Update existing in list
      setEmployees(
        employees.map((emp) => (emp.id === employee.id ? employee : emp))
      );
      setEditEmployee(null);
    } else {
      // Add new
      setEmployees([...employees, employee]);
    }
    setMessage("Operation successful!");
    setShowForm(false);
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, axiosConfig);
      setEmployees(employees.filter((emp) => emp.id !== id));
      setMessage("Employee deleted successfully!");
    } catch (error) {
      console.error(error.response || error.message);
      setMessage("Failed to delete employee.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>HR Dashboard</h2>
        <p>Welcome, {user?.email}</p>
        <p>View, edit, and manage employee records</p>

        <hr style={{ margin: "20px 0" }} />

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditEmployee(null);
            setMessage("");
          }}
          style={styles.toggleButton}
        >
          {showForm ? "Cancel" : editEmployee ? "Cancel Edit" : "Add Employee"}
        </button>

        {showForm && (
          <AddEmployeeForm
            axiosConfig={axiosConfig}
            onEmployeeAdded={handleEmployeeAddedOrUpdated}
            editEmployee={editEmployee}
          />
        )}

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}

        {/* Employee List */}
        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length > 0 ? (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h4>All Employees</h4>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>User ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.deptRole}</td>
                    <td>{emp.status}</td>
                    <td>{emp.user?.id}</td>
                    <td>
                      <button
                        style={styles.actionButton}
                        onClick={() => {
                          setEditEmployee(emp);
                          setShowForm(true);
                          setMessage("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...styles.actionButton, backgroundColor: "#d32f2f" }}
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No employees found.</p>
        )}
      </div>
    </div>
  );
}

// Add Employee Form Component (supports edit)
function AddEmployeeForm({ axiosConfig, onEmployeeAdded, editEmployee }) {
  const [formData, setFormData] = useState({
    name: editEmployee?.name || "",
    email: editEmployee?.email || "",
    department: editEmployee?.department || "",
    deptRole: editEmployee?.deptRole || "",
    status: editEmployee?.status || "ACTIVE",
    user: { id: editEmployee?.user?.id || "" },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "user_id") {
      setFormData({ ...formData, user: { id: Number(value) } });
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
        // Update
        response = await axios.put(
          `http://localhost:8080/api/hr/employees/${editEmployee.id}`,
          formData,
          axiosConfig
        );
      } else {
        // Add
        response = await axios.post(
          "http://localhost:8080/api/hr/employees",
          formData,
          axiosConfig
        );
      }
      onEmployeeAdded(response.data);
    } catch (error) {
      console.error("Error:", error.response || error.message);
      setMessage(error.response?.data?.message || "Operation failed.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
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
        type="number"
        name="user_id"
        placeholder="User ID"
        value={formData.user.id}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
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
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </form>
  );
}

// Styles
const styles = {
  container: {
    backgroundColor: "#e3f2fd",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "900px",
    textAlign: "center",
  },
  toggleButton: {
    padding: "10px 20px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  actionButton: {
    padding: "5px 10px",
    marginRight: "5px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
  },
};

export default HRDashboard;

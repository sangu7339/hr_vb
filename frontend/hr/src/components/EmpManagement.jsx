// src/components/EmpManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmpManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    employeeId: '',
    name: '',
    department: '',
    deptRole: '',
    dateOfJoining: '',
    status: 'ACTIVE',
    email: '',
    password: '',
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const departments = ['IT', 'Marketing', 'Finance', 'Operations', 'HR'];
  const roles = ['Developer', 'Manager', 'Designer', 'HR Executive', 'Team Lead'];

  // Authentication handling (placeholder - replace with actual login)
  const handleLogin = () => {
    const token = prompt('Please enter your JWT token:');
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      fetchEmployees();
    } else {
      setError('Authentication required. Please provide a valid token.');
    }
  };

  // Axios configuration
  const axiosConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  // Fetch employees
  const fetchEmployees = async () => {
    if (!isAuthenticated) {
      setError('Please log in to view employees.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.get('http://localhost:8080/api/hr/employees', axiosConfig);
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have HR role permissions.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        setError(err.response?.data || '❌ Failed to fetch employees');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to perform this action.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        employeeId: formData.employeeId,
        name: formData.name,
        department: formData.department || null,
        deptRole: formData.deptRole || null,
        dateOfJoining: formData.dateOfJoining || null,
        status: formData.status,
        user: {
          email: formData.email,
          password: formData.password || null,
        },
      };

      if (editing) {
        await axios.put(
          `http://localhost:8080/api/hr/employees/${formData.id}`,
          payload,
          axiosConfig
        );
        setMessage('✅ Employee updated successfully!');
      } else {
        if (!formData.password) {
          setError('Password is required for new employees.');
          setLoading(false);
          return;
        }
        await axios.post('http://localhost:8080/api/hr/employees', payload, axiosConfig);
        setMessage('✅ Employee added successfully!');
      }

      setFormData({
        id: '',
        employeeId: '',
        name: '',
        department: '',
        deptRole: '',
        dateOfJoining: '',
        status: 'ACTIVE',
        email: '',
        password: '',
      });
      setEditing(false);
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have HR role permissions.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        setError(err.response?.data || '❌ Failed to save employee.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit Employee
  const handleEdit = (emp) => {
    setEditing(true);
    setFormData({
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department || '',
      deptRole: emp.deptRole || '',
      dateOfJoining: emp.dateOfJoining || '',
      status: emp.status || 'ACTIVE',
      email: emp.user?.email || '',
      password: '',
    });
  };

  // Delete Employee
  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setError('Please log in to perform this action.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.delete(`http://localhost:8080/api/hr/employees/${id}`, axiosConfig);
      setMessage('✅ Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have HR role permissions.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        setError(err.response?.data || '❌ Failed to delete employee.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (id, email) => {
    if (!isAuthenticated) {
      setError('Please log in to perform this action.');
      return;
    }

    const newPassword = prompt(`Enter a new password for ${email}:`);
    if (!newPassword) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const employee = employees.find((emp) => emp.id === id);
      await axios.put(
        `http://localhost:8080/api/hr/employees/${id}`,
        {
          employeeId: employee.employeeId,
          name: employee.name,
          department: employee.department || null,
          deptRole: employee.deptRole || null,
          dateOfJoining: employee.dateOfJoining || null,
          status: employee.status,
          user: { email, password: newPassword },
        },
        axiosConfig
      );
      setMessage('✅ Password updated successfully!');
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have HR role permissions.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        setError(err.response?.data || '❌ Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">Employee Management</h2>

      {!isAuthenticated ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto text-center">
          <p className="text-red-600 mb-4">{error || 'Please log in to access employee management.'}</p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Log In
          </button>
        </div>
      ) : (
        <>
          {loading && <p className="text-center text-blue-600">Loading...</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}

          {/* Employee Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md mb-6 max-w-3xl mx-auto space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                className="border rounded p-2"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="border rounded p-2"
                required
                disabled={loading}
              />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="border rounded p-2"
                required
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                name="deptRole"
                value={formData.deptRole}
                onChange={handleChange}
                className="border rounded p-2"
                required
                disabled={loading}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="border rounded p-2"
                disabled={loading}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border rounded p-2"
                required
                disabled={loading}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="User Email"
                className="border rounded p-2"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={editing ? 'Enter new password (optional)' : 'Password'}
                className="border rounded p-2"
                disabled={loading}
                required={!editing}
              />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
                disabled={loading}
              >
                {editing ? 'Update Employee' : 'Add Employee'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      id: '',
                      employeeId: '',
                      name: '',
                      department: '',
                      deptRole: '',
                      dateOfJoining: '',
                      status: 'ACTIVE',
                      email: '',
                      password: '',
                    });
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg disabled:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Employee List */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Employee List</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Emp ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Date of Joining</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-500 p-4">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="border p-2">{emp.employeeId}</td>
                      <td className="border p-2">{emp.name}</td>
                      <td className="border p-2">{emp.department || '-'}</td>
                      <td className="border p-2">{emp.deptRole || '-'}</td>
                      <td className="border p-2">{emp.dateOfJoining || '-'}</td>
                      <td className="border p-2">{emp.status}</td>
                      <td className="border p-2">{emp.user?.email}</td>
                      <td className="border p-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded disabled:bg-gray-300"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
                          disabled={loading}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleResetPassword(emp.id, emp.user?.email)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
                          disabled={loading}
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default EmpManagement;
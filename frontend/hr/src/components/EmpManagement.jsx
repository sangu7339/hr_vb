// src/components/EmpManagement.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const EmpManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    employeeId: '',
    name: '',
    department: 'IT',          // default to valid value
    deptRole: 'DEVELOPER',     // default to valid value
    dateOfJoining: '',
    status: 'ACTIVE',
    email: '',
  });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset password modal
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Ensure these match backend accepted values
  const departments = ['IT', 'MARKETING', 'FINANCE', 'OPERATIONS', 'HR'];
  // const roles = ['DEVELOPER', 'MANAGER', 'DESIGNER', 'HR_EXECUTIVE', 'TEAM_LEAD'];
const roles = ['DEVELOPER', 'MANAGER', 'DESIGNER', 'HR_EXECUTIVE', 'TEAM_LEAD', 'QA'];

  const handleLogin = () => {
    const token = prompt('Please enter your JWT token:');
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      fetchEmployees();
    } else {
      setError('Authentication required.');
    }
  };

  const axiosConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  const fetchEmployees = async () => {
    if (!isAuthenticated) return setError('Please log in to view employees.');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.get('http://localhost:8080/api/hr/employees', axiosConfig);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to fetch employees.');
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEmployees();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditing(false);
    setFormData({
      id: '',
      employeeId: '',
      name: '',
      department: 'IT',
      deptRole: 'DEVELOPER',
      dateOfJoining: '',
      status: 'ACTIVE',
      email: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return setError('Please log in to perform this action.');

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        employeeId: formData.employeeId,
        name: formData.name,
        department: formData.department || null,
        deptRole: formData.deptRole || null,
        status: formData.status,
        dateOfJoining: formData.dateOfJoining || null,
        user: { email: formData.email }
      };

      if (editing) {
        await axios.put(`http://localhost:8080/api/hr/employees/${formData.id}`, payload, axiosConfig);
        setMessage('Employee updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/hr/employees', payload, axiosConfig);
        setMessage('Employee added successfully!');
      }

      resetForm();
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (emp) => {
    setEditing(true);
    setShowForm(true);
    setFormData({
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department || 'IT',
      deptRole: emp.deptRole || 'DEVELOPER',
      dateOfJoining: emp.dateOfJoining || '',
      status: emp.status || 'ACTIVE',
      email: emp.user?.email || '',
    });
  };

  const openResetPassword = (id, email) => {
    setResetId(id);
    setResetEmail(email || '');
    setNewPassword('');
    setShowReset(true);
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return setError('Please log in to perform this action.');
    if (!newPassword.trim()) return setError('New password is required.');

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const employee = employees.find(emp => emp.id === resetId);
      if (!employee) throw new Error('Employee not found');
      await axios.put(
        `http://localhost:8080/api/hr/employees/${resetId}`,
        {
          employeeId: employee.employeeId,
          name: employee.name,
          department: employee.department || null,
          deptRole: employee.deptRole || null,
          dateOfJoining: employee.dateOfJoining || null,
          status: employee.status,
          user: { email: resetEmail, password: newPassword },
        },
        axiosConfig
      );
      setMessage('Password updated successfully!');
      setShowReset(false);
      setNewPassword('');
      setResetId(null);
      setResetEmail('');
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) return setError('Please log in to perform this action.');
    const yes = confirm('Are you sure you want to delete this employee? This cannot be undone.');
    if (!yes) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.delete(`http://localhost:8080/api/hr/employees/${id}`, axiosConfig);
      setMessage('Employee deleted successfully');
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to delete employee.');
    } finally {
      setLoading(false);
    }
  };

  // Department member counts
  const deptCounts = useMemo(() => {
    const map = new Map();
    employees.forEach(e => {
      const key = e.department || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
    });
    ['Unassigned', ...departments].forEach(d => { if (!map.has(d)) map.set(d, 0); });
    return Array.from(map.entries());
  }, [employees]);

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      (emp.user?.email?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="emp-container">
      {!isAuthenticated ? (
        <div className="emp-card">
          <p className="emp-login-note">{error || 'Please log in to access employee management.'}</p>
          <button className="emp-btn primary" onClick={handleLogin}>Log In</button>
        </div>
      ) : (
        <>
          {loading && <p style={{ color: '#1e90ff', textAlign: 'center' }}>Loading...</p>}
          {error && <div className="emp-alert error">{error}</div>}
          {message && <div className="emp-alert success">{message}</div>}

          {/* Top summary and Add button */}
          <div className="emp-card">
            <div className="dept-strip">
              {deptCounts.map(([dept, count]) => (
                <div key={dept} className="dept-chip">
                  <span className="dept-name">{dept}</span>
                  <span className="dept-count">{count}</span>
                </div>
              ))}
            </div>
            <div className="top-actions">
              <button
                className="emp-btn primary"
                onClick={() => {
                  if (editing) resetForm();
                  setShowForm(v => !v);
                }}
              >
                {showForm ? 'Close Form' : 'Add Employee'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="emp-form mt-16">
                <div className="emp-form-grid">
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="Employee ID" className="emp-input" required disabled={loading} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="emp-input" required disabled={loading} />
                  <select name="department" value={formData.department} onChange={handleChange} className="emp-select" required disabled={loading}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select name="deptRole" value={formData.deptRole} onChange={handleChange} className="emp-select" required disabled={loading}>
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="emp-input" disabled={loading} />
                  <select name="status" value={formData.status} onChange={handleChange} className="emp-select" required disabled={loading}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="emp-input" required disabled={loading} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="emp-btn primary" disabled={loading}>{editing ? 'Update Employee' : 'Add Employee'}</button>
                  {editing && (
                    <button type="button" className="emp-btn secondary" onClick={() => { resetForm(); setShowForm(false); }} disabled={loading}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Employee Table + Search in header */}
          <div className="emp-card">
            <div className="card-header">
              <h3 className="emp-title">Employee List</h3>
              <form
                className="search-group"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchTerm(searchInput.trim());
                }}
              >
                <input
                  type="text"
                  placeholder="Search by Name, Email or Employee ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="emp-search"
                />
                <button type="submit" className="emp-btn secondary">Search</button>
              </form>
            </div>

            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Date of Joining</th>
                    <th>Status</th>
                    <th>Email</th>
                    <th className="center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '1rem', color: '#777' }}>No employees found.</td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr key={emp.id} className="emp-row">
                        <td>{emp.employeeId}</td>
                        <td>{emp.name}</td>
                        <td>{emp.department || '-'}</td>
                        <td>{emp.deptRole || '-'}</td>
                        <td>{emp.dateOfJoining || '-'}</td>
                        <td>
                          <span className={`badge ${emp.status==='ACTIVE' ? 'active' : 'inactive'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>{emp.user?.email}</td>
                        <td className="emp-actions">
                          <button className="emp-btn secondary" onClick={() => handleUpdate(emp)}>Update</button>
                          <button className="emp-btn primary" onClick={() => openResetPassword(emp.id, emp.user?.email)} style={{ background: '#0ea5e9' }}>
                            Reset Password
                          </button>
                          <button className="emp-btn danger" onClick={() => handleDelete(emp.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset Password Modal */}
          {showReset && (
            <div className="modal-backdrop" onClick={() => setShowReset(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h4 className="modal-title">Reset Password</h4>
                <form onSubmit={submitResetPassword}>
                  <div className="modal-grid">
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="emp-input" placeholder="Email" required />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="emp-input" placeholder="New Password" required />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="emp-btn secondary" onClick={() => setShowReset(false)}>Cancel</button>
                    <button type="submit" className="emp-btn primary">Update Password</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        body { margin: 0; font-family: Arial, sans-serif; background-color: #f4f4f7; }

        .emp-container { min-height: 100vh; padding: 24px; background: #f6f7fb; }

        .emp-card { background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(18, 38, 63, 0.06); padding: 20px; margin-bottom: 24px; border: 1px solid rgba(16, 24, 40, 0.06); }

        .emp-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #101828; }

        .emp-alert { border-radius: 10px; padding: 10px 14px; text-align: center; margin-bottom: 16px; font-weight: 600; }
        .emp-alert.success { background: #ecfdf3; color: #027a48; border: 1px solid #a6f4c5; }
        .emp-alert.error { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }

        .emp-btn { appearance: none; border: 0; border-radius: 10px; font-weight: 700; padding: 10px 16px; cursor: pointer; transition: transform .04s ease, box-shadow .2s ease, background .2s ease; }
        .emp-btn:disabled { opacity: .6; cursor: not-allowed; }
        .emp-btn.primary { background: #2563eb; color: #fff; box-shadow: 0 6px 18px rgba(37, 99, 235, .25); }
        .emp-btn.primary:hover { background: #1e4fd7; }
        .emp-btn.secondary { background: #6b7280; color: #fff; }
        .emp-btn.secondary:hover { background: #5b6170; }
        .emp-btn.danger { background: #ef4444; color: #fff; }
        .emp-btn.danger:hover { background: #dc2626; }

        .emp-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
        .emp-input, .emp-select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; font-size: 0.95rem; color: #111827; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
        .emp-input:focus, .emp-select:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, .15); }

        .emp-table-wrap { overflow-x: auto; }
        .emp-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 880px; background: #fff; }
        .emp-table thead th { text-align: left; font-weight: 700; color: #475467; font-size: 0.86rem; background: #f8fafc; padding: 12px; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 1; }
        .emp-table tbody td { padding: 12px; border-bottom: 1px solid #eef2f7; color: #111827; font-size: 0.95rem; background: #fff; }
        .emp-row { transition: background .15s ease; }
        .emp-row:hover { background: #f9fafb; }

        .badge { display: inline-block; padding: 4px 10px; font-size: 0.8rem; border-radius: 999px; color: #fff; font-weight: 700; }
        .badge.active { background: #16a34a; }
        .badge.inactive { background: #6b7280; }

        .emp-actions { display: flex; justify-content: center; gap: 8px; }
        .emp-login-note { color: #dc2626; margin-bottom: 12px; text-align: center; }

        /* Dept summary */
        .dept-strip { display: flex; flex-wrap: wrap; gap: 10px; }
        .dept-chip { display: inline-flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 999px; }
        .dept-name { color: #0f172a; font-weight: 700; }
        .dept-count { background: #e0e7ff; color: #1e3a8a; font-weight: 700; padding: 2px 8px; border-radius: 999px; font-size: 0.85rem; }

        .top-actions { margin-top: 12px; display: flex; justify-content: flex-end; }
        .form-actions { margin-top: 16px; text-align: center; display: flex; gap: 12px; justify-content: center; }
        .mt-16 { margin-top: 16px; }

        /* Card header with right-aligned search */
        .card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .search-group { display: flex; align-items: center; gap: 8px; margin: 0; }
        .emp-search { padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb; width: 280px; background: #fff; }
        .emp-search::placeholder { color: #9ca3af; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(2,6,23,.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal { width: min(520px, 92vw); background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 16px 48px rgba(2,6,23,.2); }
        .modal-title { margin: 0 0 12px 0; font-size: 1.2rem; color: #0f172a; font-weight: 700; }
        .modal-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .modal-actions { margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px; }

        @media (max-width: 640px) {
          .card-header { flex-direction: column; align-items: stretch; }
          .search-group { width: 100%; }
          .emp-search { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default EmpManagement;

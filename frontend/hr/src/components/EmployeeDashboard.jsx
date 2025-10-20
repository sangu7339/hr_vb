import React, { useState, useEffect } from "react";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeeLeave from "./EmployeeLeave";
import EmployeeAnnouncement from "./EmployeeAnnouncement";
import EmployeeSalary from "./EmployeeSalary";
import Profile from "./Profile";

// Example holiday data
const holidays2025 = [
  { date: "15-Aug-2025", day: "Friday", name: "Independence Day" },
  { date: "27-Aug-2025", day: "Wednesday", name: "Ganesh Chaturthi" },
  { date: "01-Oct-2025", day: "Wednesday", name: "Ayudha Puja / Vijayadashami" },
  { date: "02-Oct-2025", day: "Thursday", name: "Gandhi Jayanti & Vijayadashami" },
  { date: "07-Oct-2025", day: "Tuesday", name: "Maharshi Valmiki Jayanti" },
  { date: "22-Oct-2025", day: "Wednesday", name: "Balipadyami / Deepavali" },
  { date: "01-Nov-2025", day: "Saturday", name: "Kannada Rajyotsava" },
  { date: "25-Dec-2025", day: "Thursday", name: "Christmas Day" },
];

// Holiday Calendar Component
const HolidayCalendar = () => (
  <div className="holiday-calendar">
    <h2>2025 Holiday Calendar</h2>
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>SL NO</th>
            <th>Date</th>
            <th>Day</th>
            <th>Holiday Name</th>
          </tr>
        </thead>
        <tbody>
          {holidays2025.map((holiday, idx) => (
            <tr key={holiday.date} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
              <td>{String(idx + 1).padStart(2, "0")}</td>
              <td>{holiday.date}</td>
              <td>{holiday.day}</td>
              <td>{holiday.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function EmployeeDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userEmail, setUserEmail] = useState("employee@company.com");

  const TABS = [
     { key: "profile", label: "Profile", icon: "👤" },
    { key: "attendance", label: "Attendance Tracking", icon: "⏰" },
    { key: "leave", label: "Leave Management", icon: "📅" },
      { key: "salary", label: "Salary Management", icon: "💰" },
    { key: "announcement", label: "Announcements & Notices", icon: "🔔" },
  
   
    { key: "calendar", label: "Calendar & Events", icon: "📆" },
  ];

  useEffect(() => {
    if (user && user.email) setUserEmail(user.email);
    else {
      const stored = localStorage.getItem("userEmail");
      if (stored) setUserEmail(stored);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "attendance":
        return <EmployeeAttendance user={user} />;
      case "leave":
        return <EmployeeLeave user={user} />;
      case "announcement":
        return <EmployeeAnnouncement user={user} />;
      case "salary":
        return <EmployeeSalary user={user} />;
      case "profile":
        return <Profile user={user} />;
      case "calendar":
        return <HolidayCalendar />;
      default:
        return (
          <div className="overview-tab">
            <h2>Welcome, {userEmail}</h2>
            <p>Use the tabs above to navigate your dashboard efficiently.</p>
          </div>
        );
    }
  };

  if (!user || !user.email || !user.employeeCode) {
    return (
      <div className="login-warning">
        <p>Please login to access the Employee Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="header-buttons">
          <button onClick={() => setActiveTab("calendar")}>📆 Calendar & Events</button>
          <button>{userEmail || "Employee"}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? "active-tab" : ""}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main>{renderTabContent()}</main>

      {/* Styles */}
      <style>
        {`
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
          }

          .dashboard-container {
            display: flex;
            flex-direction: column;
            height: 100vh; /* Full viewport height */
            font-family: 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
          }

          .dashboard-header {
            flex-shrink: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: #111827;
            color: white;
            position: sticky;
            top: 0;
            z-index: 20;
          }

          .dashboard-header h1 {
            font-size: 1.75rem;
            font-weight: bold;
          }

          .header-buttons button {
            margin-left: 12px;
            padding: 8px 16px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .header-buttons button:nth-child(1) { background: #2a4969; color: white; }
          .header-buttons button:nth-child(1):hover { background: #375c83; }
          .header-buttons button:nth-child(2) { background: #374151; color: white; }
          .header-buttons button:nth-child(2):hover { background: #4b5563; }
          .header-buttons button:nth-child(3) { background: #dc2626; color: white; }
          .header-buttons button:nth-child(3):hover { background: #b91c1c; }

          /* Sticky tabs below header */
          .dashboard-tabs {
            flex-shrink: 0;
            display: flex;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            overflow-x: auto;
            position: sticky;
            top: 64px; /* header height */
            z-index: 10;
          }

          .dashboard-tabs button {
            padding: 10px 20px;
            cursor: pointer;
            border: none;
            background: transparent;
            transition: all 0.2s;
            font-weight: 500;
            white-space: nowrap;
          }

          .dashboard-tabs button.active-tab {
            border-bottom: 3px solid #2a4969;
            color: #2a4969;
            font-weight: 600;
          }

          main {
            flex: 1; /* Fill remaining space */
            overflow-y: scroll;
            padding: 24px;
            scrollbar-width: thin;
            scrollbar-color: #2a4969 #f0f0f0;
          }

          main::-webkit-scrollbar {
            width: 8px;
          }

          main::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 8px;
          }

          main::-webkit-scrollbar-thumb {
            background-color: #2a4969;
            border-radius: 8px;
          }

          .overview-tab {
            text-align: center;
            padding: 24px;
          }

          .overview-tab h2 {
            font-size: 2rem;
            margin-bottom: 12px;
            color: #111827;
          }

          .login-warning {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #b91c1c;
            font-weight: 600;
          }

          /* Holiday calendar */
          .holiday-calendar {
            background: #ffffff;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            max-width: 900px;
            margin: 0 auto;
          }

          .holiday-calendar h2 {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1f2937;
            text-align: center;
          }

          .table-wrapper { overflow-x: auto; border-radius: 12px; }

          table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }

          thead tr { background: linear-gradient(90deg, #2a4969, #3b6ca7); color: #ffffff; font-size: 0.875rem; }
          th { padding: 12px 16px; text-align: left; }

          tbody tr { transition: transform 0.2s, box-shadow 0.2s; border-radius: 12px; }
          tbody tr:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

          .even-row { background: #f9fafb; }
          .odd-row { background: #ffffff; }
          td { padding: 12px 16px; font-size: 0.875rem; color: #374151; }

          @media (max-width: 640px) {
            table { display: block; }
            thead { display: none; }
            tbody tr { display: block; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 16px; }
            td { display: flex; justify-content: space-between; padding: 8px 12px; }
            td::before { font-weight: 600; text-transform: uppercase; content: attr(data-label); }
          }
        `}
      </style>
    </div>
  );
}

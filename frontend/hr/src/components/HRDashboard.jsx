import React, { useState } from "react";
import EmpManagement from "./EmpManagement";
import Attendance from "./Attendance";
import LeaveManagement from "./HRLeaveManagement";
import HRSalaryManagement from "./HRSalaryManagement";
import AnnouncementManagement from "./AnnouncementManagement";

// Holiday Calendar Component
const holidays = [
  { sl: "01", date: "15-Aug-2025", day: "Friday", name: "Independence Day" },
  { sl: "02", date: "27-Aug-2025", day: "Wednesday", name: "Ganesh Chaturthi" },
  { sl: "03", date: "01-Oct-2025", day: "Wednesday", name: "Ayudha Puja / Vijayadashami" },
  { sl: "04", date: "02-Oct-2025", day: "Thursday", name: "Gandhi Jayanti & Vijayadashami" },
  { sl: "05", date: "07-Oct-2025", day: "Tuesday", name: "Maharshi Valmiki Jayanti" },
  { sl: "06", date: "22-Oct-2025", day: "Wednesday", name: "Balipadyami / Deepavali" },
  { sl: "07", date: "01-Nov-2025", day: "Saturday", name: "Kannada Rajyotsava" },
  { sl: "08", date: "25-Dec-2025", day: "Thursday", name: "Christmas Day" },
];

function HolidayCalendar() {
  return (
    <>
      <style>{`
        .holiday-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .holiday-table th, .holiday-table td {
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          text-align: left;
        }
        .holiday-table th {
          background-color: #111827;
          color: #fff;
        }
        .holiday-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .holiday-table tr:hover {
          background-color: #e0e7ff;
        }
      `}</style>

      <h2 style={{ marginBottom: "16px", color: "#111827" }}>2025 Holiday Calendar</h2>
      <table className="holiday-table">
        <thead>
          <tr>
            <th>SL NO</th>
            <th>Date</th>
            <th>Day</th>
            <th>Holiday Name</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.sl}>
              <td>{holiday.sl}</td>
              <td>{holiday.date}</td>
              <td>{holiday.day}</td>
              <td>{holiday.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// Main HR Dashboard
function HRDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const userEmail = localStorage.getItem("email");

  const tabs = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "employees", label: "Employee Management", icon: "👥" },
    { key: "attendance", label: "Attendance Tracking", icon: "⏰" },
    { key: "leaves", label: "Leave Management", icon: "📅" },
    { key: "announcements", label: "Announcements & Notices", icon: "🔔" },
    { key: "calendar", label: "Calendar & Events", icon: "📆" }, // new calendar tab
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "employees":
        return <EmpManagement />;
      case "attendance":
        return <Attendance />;
      case "leaves":
        return <LeaveManagement />;
      case "salary":
        return <HRSalaryManagement />;
      case "announcements":
        return <AnnouncementManagement />;
      case "calendar":
        return <HolidayCalendar />;
      default:
        return (
          <div className="overview-content">
            <h2>Welcome, {userEmail || "HR Admin"} 👋</h2>
            <p>Select a module from the menu above to get started.</p>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Segoe UI", Roboto, sans-serif;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: #f9fafb;
        }

        .dashboard {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background-color: #fff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }

        .header-left h1 {
          font-size: 22px;
          margin: 0;
          font-weight: 600;
          color: #111827;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .action-btn:hover {
          background: #f9fafb;
        }

        .logout-btn {
          background-color: #ef4444;
          color: white;
          border: none;
        }

        .logout-btn:hover {
          background-color: #dc2626;
        }

        /* Tabs */
        .tab-bar {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          padding: 0 32px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
          flex-shrink: 0;
        }

        .tab-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 0;
          font-size: 15px;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .tab-item:hover {
          color: #111827;
        }

        .tab-item.active {
          color: #111827;
          font-weight: 600;
          border-bottom: 2px solid #111827;
        }

        /* Content area */
        .content {
          flex: 1;
          background-color: #f9fafb;
          padding: 24px 32px;
          overflow-y: auto;
          min-height: 0;
        }

        .overview-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
          color: #374151;
        }

        .overview-content h2 {
          font-size: 26px;
          margin-bottom: 10px;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 8px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Core HR Dashboard</h1>
          </div>
          <div className="header-actions">
            <button
              className="action-btn"
              onClick={() => setActiveTab("calendar")}
            >
              📆 Calendar & Events
            </button>
            <button className="action-btn">👤 {userEmail || "HR Admin"}</button>
            <button
              className="action-btn logout-btn"
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  localStorage.clear();
                  window.location.href = "/login";
                }
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="tab-bar">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
        </nav>

        {/* Main Content */}
        <main className="content">{renderTab()}</main>
      </div>
    </>
  );
}

export default HRDashboard;

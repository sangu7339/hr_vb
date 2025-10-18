import React, { useState } from "react";
import EmpManagement from "./EmpManagement";
import Attendance from "./Attendance";
import LeaveManagement from "./HRLeaveManagement";
import HRSalaryManagement from "./HRSalaryManagement";
import AnnouncementManagement from "./AnnouncementManagement";

function HRDashboard() {
  const [activeTab, setActiveTab] = useState("employees");
  const userEmail = localStorage.getItem("email"); // Logged-in HR email
  const token = localStorage.getItem("token");     // JWT token

  const tabs = [
    { key: "employees", label: "Employee Management" },
    { key: "attendance", label: "Attendance Tracking" },
    { key: "leaves", label: "Leave Management" },
    { key: "salary", label: "Salary Management" },
    { key: "announcements", label: "Announcements & Notices" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "employees":
        return <EmpManagement user={{ email: userEmail }} token={token} />;
      case "attendance":
        return <Attendance />;
      case "leaves":
        return <LeaveManagement />;
      case "salary":
        return <HRSalaryManagement />;
      case "announcements":
        return <AnnouncementManagement />;
      default:
        return <div className="p-6">Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Core HR Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Employee Management System</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-5 py-3 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3 ${
                activeTab === tab.key
                  ? "bg-blue-100 border-r-4 border-blue-600 text-blue-700 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              <p className="text-xs text-gray-500">HR Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            {tabs.find((t) => t.key === activeTab)?.label || "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  localStorage.clear();
                  window.location.href = "/login";
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">{renderTab()}</div>
      </main>
    </div>
  );
}

export default HRDashboard;

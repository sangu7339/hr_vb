import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/hr/employee/me", axiosConfig);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("❌ Unable to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-lg font-medium text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error || "❌ Profile not found"}</p>
          <p className="text-gray-600">Please contact HR for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white/90 shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.user?.email}</p>
          <p><strong>Employee ID:</strong> {profile.employeeId}</p>
          <p><strong>Department:</strong> {profile.department || "—"}</p>
          <p><strong>Role:</strong> {profile.deptRole || "—"}</p>
          <p><strong>Status:</strong> {profile.status || "—"}</p>
          <p><strong>Date of Joining:</strong> {profile.dateOfJoining || "—"}</p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

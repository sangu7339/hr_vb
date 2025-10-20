// Profile.jsx
import React from "react";

const Profile = ({ user }) => {
  return (
    <div className="bg-white/90 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2">Profile</h2>
      <p>Email: {user.email}</p>
      <p>Employee Code: {user.employeeCode}</p>
      {/* Add more profile info here */}
    </div>
  );
};

export default Profile; // <-- default export added

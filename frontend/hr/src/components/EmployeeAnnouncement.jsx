// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const EmployeeAnnocement  = ({ user }) => {
//   const [announcements, setAnnouncements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("token");
//   const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

//   // Fetch announcements for employees
//   const fetchAnnouncements = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await axios.get("http://localhost:8080/api/announcements/all", axiosConfig);
//       setAnnouncements(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("❌ Failed to load announcements.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnnouncements();
//   }, []);

//   if (loading) return <p style={{ textAlign: "center" }}>Loading announcements...</p>;
//   if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

//   return (
//     <div style={{ maxWidth: 900, margin: "20px auto", padding: 20, background: "#fff", borderRadius: 12 }}>
//       <h2>📢 Announcements</h2>
//       {announcements.length === 0 ? (
//         <p>No announcements available.</p>
//       ) : (
//         announcements.map((a) => (
//           <div key={a.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
//             <h3 style={{ margin: 0 }}>{a.title}</h3>
//             <p style={{ margin: "5px 0", color: "#555" }}>{a.message}</p>
//             <p style={{ fontSize: "0.8rem", color: "#888" }}>
//               By: {a.createdBy?.email || "HR"} | {new Date(a.createdAt).toLocaleString()}
//             </p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EmployeeAnnocement;


import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAnnouncement = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:8080/api/announcements/all", axiosConfig);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading announcements...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20, background: "#fff", borderRadius: 12 }}>
      <h2>📢 Announcements</h2>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((a) => (
          <div key={a.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
            <h3 style={{ margin: 0 }}>{a.title}</h3>
            <p style={{ margin: "5px 0", color: "#555" }}>{a.message}</p>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>
              By: {a.createdBy?.email || "HR"} | {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeAnnouncement;
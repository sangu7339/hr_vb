import React, { useState, useEffect } from "react";
import axios from "axios";

const AnnouncementManagement = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/announcements/all",
        axiosConfig
      );
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ✅ Handle create announcement
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/announcements/create?hrEmail=${user.email}`,
        newAnnouncement,
        axiosConfig
      );
      alert("✅ Announcement created successfully!");
      setNewAnnouncement({ title: "", message: "" });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create announcement.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${id}`, axiosConfig);
      alert("🗑️ Announcement deleted.");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete announcement.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📢 Announcement Management</h2>

      {/* ✅ Add New Announcement Form */}
      <form style={styles.form} onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Announcement Title"
          value={newAnnouncement.title}
          onChange={(e) =>
            setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
          }
          style={styles.input}
        />
        <textarea
          placeholder="Write announcement message..."
          value={newAnnouncement.message}
          onChange={(e) =>
            setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
          }
          style={styles.textarea}
        ></textarea>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Posting..." : "➕ Add Announcement"}
        </button>
      </form>

      {/* ✅ List All Announcements */}
      <div style={styles.listContainer}>
        <h3>All Announcements</h3>
        {announcements.length > 0 ? (
          <ul style={styles.list}>
            {announcements.map((a) => (
              <li key={a.id} style={styles.item}>
                <div>
                  <h4 style={styles.title}>{a.title}</h4>
                  <p style={styles.message}>{a.message}</p>
                  <small style={styles.date}>
                    Posted on {new Date(a.createdAt).toLocaleString()}
                  </small>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No announcements yet.
          </p>
        )}
      </div>
    </div>
  );
};

// ✅ Styles
const styles = {
  container: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: 900,
    margin: "40px auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 30,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  textarea: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    minHeight: 80,
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: 8,
    background: "#16a34a",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  listContainer: {
    marginTop: 20,
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f9fafb",
    padding: "10px 15px",
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    color: "#2c3e50",
  },
  message: {
    margin: "5px 0",
    color: "#555",
  },
  date: {
    fontSize: "12px",
    color: "#777",
  },
  deleteBtn: {
    border: "none",
    background: "#dc2626",
    color: "white",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default AnnouncementManagement;
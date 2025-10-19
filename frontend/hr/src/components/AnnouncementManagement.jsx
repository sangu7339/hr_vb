import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AnnouncementManagement = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/announcements/all`, axiosConfig);
      setAnnouncements(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      toast.error("Error fetching announcements!");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    const hrEmail = user?.email || user?.hrEmail || user?.emailAddress;
    if (!hrEmail) {
      toast.warning("⚠️ HR email not found. Cannot create announcement.");
      return;
    }

    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.warning("⚠️ Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/announcements/create?hrEmail=${encodeURIComponent(hrEmail)}`,
        { title: newAnnouncement.title, message: newAnnouncement.message },
        axiosConfig
      );
      toast.success("✅ Announcement created successfully!");
      setNewAnnouncement({ title: "", message: "" });
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(`❌ Failed to create announcement: ${err.response?.data?.message || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await axios.delete(`${API_URL}/api/announcements/${id}`, axiosConfig);
      toast.success("✅ Announcement deleted successfully!");
      fetchAnnouncements();
    } catch (err) {
      toast.error("❌ Failed to delete announcement.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* <h2 style={styles.heading}>Announcements</h2> */}

      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          ➕ Add Announcement
        </button>
      </div>

      <div style={styles.chatList}>
        {announcements.length > 0 ? (
          announcements.map((a) => (
            <div key={a.id} style={styles.chatBubble}>
              <div>
                <strong>{a.title}</strong>
                <p style={styles.message}>{a.message}</p>
                <small style={styles.date}>{new Date(a.createdAt).toLocaleString()}</small>
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(a.id)}>
                ❌ Delete
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>No announcements yet.</p>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 15 }}>New Announcement</h3>
            <form style={{ display: "flex", flexDirection: "column", gap: 15 }} onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                style={styles.input}
              />
              <textarea
                placeholder="Message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                style={styles.textarea}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles (delete button with hover)
const styles = {
  container: { width: "100vw", minHeight: "100vh", padding: "20px", fontFamily: "'Poppins', sans-serif", background: "#f9f9f9", boxSizing: "border-box" },
  heading: { fontSize: 28, textAlign: "center", marginBottom: 20 },
  addBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", fontWeight: 600, cursor: "pointer" },
  chatList: { display: "flex", flexDirection: "column", gap: 15, maxWidth: 700, margin: "0 auto" },
  chatBubble: { background: "#e1f5fe", padding: 15, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  message: { margin: "5px 0", color: "#333" },
  date: { fontSize: 12, color: "#666" },
  deleteBtn: {
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalContent: { background: "#fff", borderRadius: 12, padding: 25, width: "90%", maxWidth: 500 },
  input: { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 },
  textarea: { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, minHeight: 100, resize: "vertical" },
  button: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", cursor: "pointer", fontWeight: 600 },
  cancelBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#ccc", cursor: "pointer" },
};

export default AnnouncementManagement;

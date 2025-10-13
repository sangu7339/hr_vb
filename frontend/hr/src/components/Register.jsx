
// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // function Register() {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [role, setRole] = useState("EMPLOYEE"); // must match backend enum
// //   const navigate = useNavigate();

// //   const handleRegister = async (e) => {
// //     e.preventDefault();

// //     if (!username || !password) {
// //       alert("Please fill in all fields");
// //       return;
// //     }

// //     try {
// //       const response = await fetch("http://localhost:8080/api/auth/register", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ username, password, role }),
// //       });

// //       if (!response.ok) {
// //         const errorText = await response.text();
// //         throw new Error(errorText);
// //       }

// //       alert("User registered successfully!");
// //       navigate("/login");
// //     } catch (err) {
// //       alert("Registration failed: " + err.message);
// //     }
// //   };

// //   return (
// //     <div style={styles.container}>
// //       <div style={styles.card}>
// //         <h2 style={styles.title}>Register</h2>
// //         <form onSubmit={handleRegister} style={styles.form}>
// //           <input
// //             type="text"
// //             placeholder="Username"
// //             style={styles.input}
// //             value={username}
// //             onChange={(e) => setUsername(e.target.value)}
// //           />
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             style={styles.input}
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //           />
// //           <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
// //             <option value="EMPLOYEE">Employee</option>
// //             <option value="HR">HR</option>
// //           </select>
// //           <button type="submit" style={styles.button}>Register</button>
// //         </form>
// //         <p onClick={() => navigate("/login")} style={styles.link}>
// //           Already have an account? Login
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // const styles = {
// //   container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" },
// //   card: { backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
// //   title: { marginBottom: "20px" },
// //   form: { display: "flex", flexDirection: "column", gap: "15px" },
// //   input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
// //   button: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
// //   link: { marginTop: "15px", color: "#28a745", cursor: "pointer", fontSize: "14px" },
// // };

// // export default Register;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Register() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("EMPLOYEE");
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       alert("Please fill in all fields");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:8080/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password, role }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText);
//       }

//       alert("User registered successfully!");
//       navigate("/login");
//     } catch (err) {
//       alert("Registration failed: " + err.message);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>Register</h2>
//         <form onSubmit={handleRegister} style={styles.form}>
//           <input
//             type="text"
//             placeholder="Username"
//             style={styles.input}
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             style={styles.input}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="EMPLOYEE">Employee</option>
//             <option value="HR">HR</option>
//           </select>
//           <button type="submit" style={styles.button}>
//             Register
//           </button>
//         </form>
//         <p onClick={() => navigate("/login")} style={styles.link}>
//           Already have an account? Login
//         </p>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" },
//   card: { backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
//   title: { marginBottom: "20px" },
//   form: { display: "flex", flexDirection: "column", gap: "15px" },
//   input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
//   button: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
//   link: { marginTop: "15px", color: "#28a745", cursor: "pointer", fontSize: "14px" },
// };

// export default Register;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE"); // Employee by default
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert("User registered successfully!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
          </select>
          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p onClick={() => navigate("/login")} style={styles.link}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
  title: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
  link: { marginTop: "15px", color: "#28a745", cursor: "pointer", fontSize: "14px" },
};

export default Register;

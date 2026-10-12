import { useState, useEffect, useContext, createContext } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, verify token with backend
      // For now, just consider user logged in
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ============================================
// API HELPER
// ============================================
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ============================================
// COMPONENTS
// ============================================

// Login Page
function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      login(data.token);
      navigate("/students");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Student Management System</h2>
        <h3>Login</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

// Register Page
function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Student Management System</h2>
        <h3>Register</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <button type="submit">Register</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
}

// Student List Page
function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", age: "", course: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const fetchStudents = async () => {
    try {
      const data = await api("/api/students");
      setStudents(data.data || data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api(`/api/students/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
      } else {
        await api("/api/students", {
          method: "POST",
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setFormData({ name: "", email: "", age: "", course: "" });
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      age: student.age,
      course: student.course
    });
    setEditingId(student._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await api(`/api/students/${id}`, { method: "DELETE" });
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Student Management System</h1>
        <div className="header-actions">
          <button onClick={logout} className="btn-secondary">Logout</button>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", email: "", age: "", course: "" }); }} className="btn-primary">
            + Add Student
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", email: "", age: "", course: "" }); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Student" : "Add Student"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min={18}
                max={60}
              />
              <input
                type="text"
                name="course"
                placeholder="Course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", email: "", age: "", course: "" }); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Course</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student._id.slice(-6)}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.age}</td>
              <td>{student.course}</td>
              <td>
                <button onClick={() => handleEdit(student)} className="btn-icon">Edit</button>
                <button onClick={() => handleDelete(student._id)} className="btn-icon btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && !showForm && (
        <p className="empty-state">No students found. Click "Add Student" to create one.</p>
      )}
    </div>
  );
}

// Main App with Routes
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="*" element={<Navigate to="/students" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
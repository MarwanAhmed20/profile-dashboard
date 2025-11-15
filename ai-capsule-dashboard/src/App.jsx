import React, { useState, useEffect } from "react";
import "./index.css";

import AuthShell from "./components/auth/AuthShell";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";

import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";

import AdminDashboard from "./components/admin/AdminDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentEditorPage from "./components/admin/StudentEditorPage";

import { authAPI, studentsAPI, domainsAPI } from "./services/api";

export default function App() {
  const [authScreen, setAuthScreen] = useState("login");
  const [role, setRole] = useState(null);
  const [studentTab, setStudentTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminPage, setAdminPage] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await authAPI.getProfile();
      setRole(profile.role);
      setAuthScreen("app");
      
      const domainsData = await domainsAPI.getAll();
      setDomains(domainsData);
      
      if (profile.role === 'admin') {
        const studentsData = await studentsAPI.getAll();
        setStudents(studentsData.results || studentsData); // Handle paginated response
      } else if (profile.role === 'student') {
        const studentData = await studentsAPI.getMe();
        setCurrentStudent(studentData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password, loginRole) => {
    try {
      const data = await authAPI.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setRole(loginRole);
      setAuthScreen("app");
      await loadUserData();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthScreen("login");
    setRole(null);
    setAdminPage("list");
    setSelectedStudent(null);
    setCurrentStudent(null);
    setStudents([]);
  };

  const handleStudentUpdate = async (id, data) => {
    try {
      await studentsAPI.update(id, data);
      const studentsData = await studentsAPI.getAll();
      setStudents(studentsData.results || studentsData);
      setAdminPage("list");
    } catch (error) {
      alert('Failed to update student: ' + error.message);
    }
  };

  const handleStudentCreate = async (data) => {
    try {
      await studentsAPI.create(data);
      const studentsData = await studentsAPI.getAll();
      setStudents(studentsData.results || studentsData);
      setAdminPage("list");
      alert('Student created successfully!');
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create student: ' + error.message);
    }
  };

  const handleStudentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      await studentsAPI.delete(id);
      const studentsData = await studentsAPI.getAll();
      setStudents(studentsData.results || studentsData);
      alert('Student deleted successfully');
    } catch (error) {
      alert('Failed to delete student: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-slate-50 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // AUTH SCREENS
  if (authScreen === "login") {
    return (
      <AuthShell>
        <LoginPage
          onLoginAsAdmin={(username, password) => handleLogin(username, password, 'admin')}
          onLoginAsStudent={(username, password) => handleLogin(username, password, 'student')}
          onGoToSignup={() => setAuthScreen("signup")}
        />
      </AuthShell>
    );
  }

  if (authScreen === "signup") {
    return (
      <AuthShell>
        <SignupPage onGoToLogin={() => setAuthScreen("login")} />
      </AuthShell>
    );
  }

  // MAIN APP (ADMIN / STUDENT)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <TopBar
        role={role}
        onRoleChange={setRole}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        showRoleToggle={false}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        {role === "student" && (
          <Sidebar
            role={role}
            studentTab={studentTab}
            onStudentTabChange={setStudentTab}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          {role === "admin" ? (
            adminPage === "list" ? (
              <AdminDashboard
                students={students}
                onView={(student) => {
                  setSelectedStudent(student);
                  setAdminPage("view");
                  setStudentTab("home");
                }}
                onEdit={(student) => {
                  setSelectedStudent(student);
                  setAdminPage("edit");
                }}
                onAdd={() => {
                  setSelectedStudent(null);
                  setAdminPage("add");
                }}
                onDelete={handleStudentDelete}
              />
            ) : adminPage === "view" && selectedStudent ? (
              <StudentDashboard
                student={selectedStudent}
                tab={studentTab}
                domainScores={(selectedStudent.domain_scores || []).map(d => ({
                  domain: d.domain_name || 'Unknown',
                  score: parseFloat(d.score) || 0,
                }))}
                onBack={() => setAdminPage("list")}
                showBackForAdmin
              />
            ) : (
              <StudentEditorPage
                mode={adminPage === "edit" ? "edit" : "add"}
                student={selectedStudent}
                defaultDomains={domains}
                onBack={() => setAdminPage("list")}
                onSave={adminPage === "edit" ? handleStudentUpdate : handleStudentCreate}
              />
            )
          ) : role === "student" ? (
            currentStudent ? (
              <StudentDashboard
                student={currentStudent}
                tab={studentTab}
                domainScores={(currentStudent.domain_scores || []).map(d => ({
                  domain: d.domain_name || d.name || 'Unknown',
                  score: parseFloat(d.score) || 0,
                }))}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading student data...</p>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Please log in to continue</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

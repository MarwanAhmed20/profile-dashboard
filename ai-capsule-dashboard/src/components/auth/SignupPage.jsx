import React, { useState, useEffect } from "react";
import { authAPI, coursesAPI } from "../../services/api";

export default function SignupPage({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    role: "student",
    course_id: "",
    admin_code: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    // Fetch active courses for registration
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/students/courses/active/');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Contains uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Contains lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Contains a number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Contains special character (!@#$%^&*)");
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password") {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError("Password does not meet requirements");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.course_id) {
      setError("Please select a course");
      return;
    }

    if (!formData.admin_code) {
      setError("Please enter admin code");
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        ...formData,
        course_id: parseInt(formData.course_id),
        admin_code: formData.admin_code.toUpperCase()
      };
      await authAPI.register(registrationData);
      setSuccess(true);
      setTimeout(() => onGoToLogin(), 2000);
    } catch (err) {
      // Handle Django validation errors
      if (err.message && typeof err.message === 'string') {
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.email) {
            setError(`Email: ${errorData.email[0]}`);
          } else if (errorData.password) {
            setError(`Password: ${errorData.password[0]}`);
          } else {
            setError(Object.values(errorData).flat().join(', '));
          }
        } catch {
          setError(err.message || "Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <div className="text-green-400 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold">Registration Successful!</h2>
        <p className="text-slate-400">Admin has been notified.</p>
        <p className="text-slate-400">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-slate-400">Sign up to get started</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="you@example.com"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Admin Code *</label>
          <input
            type="text"
            name="admin_code"
            value={formData.admin_code}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (value.length <= 20) {
                setFormData({ ...formData, admin_code: value });
              }
            }}
            required
            minLength={6}
            maxLength={20}
            disabled={loading}
            placeholder="Enter admin code"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono text-lg text-center tracking-wider"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              Get this code from your program administrator (min. 6 chars)
            </p>
            <span className={`text-xs font-semibold ${
              formData.admin_code.length >= 6 ? 'text-green-400' : 'text-slate-500'
            }`}>
              {formData.admin_code.length}/20
            </span>
          </div>
          {formData.admin_code.length > 0 && formData.admin_code.length < 6 && (
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ Admin code must be at least 6 characters
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Course *</label>
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
            disabled={loading || loadingCourses}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.duration_weeks} weeks, {course.domains?.length || 0} domains)
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            {loadingCourses ? 'Loading courses...' : courses.length === 0 ? 'No courses available' : `${courses.length} courses available`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.password && (
            <div className="mt-2 text-xs space-y-1">
              <div className="text-slate-400 font-medium mb-1">Password must have:</div>
              {["At least 8 characters long", "Contains uppercase letter", "Contains lowercase letter", "Contains a number", "Contains special character (!@#$%^&*)"].map((req, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${passwordErrors.includes(req) ? 'text-red-400' : 'text-green-400'}`}>
                  <span>{passwordErrors.includes(req) ? '✗' : '✓'}</span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password *</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || passwordErrors.length > 0 || courses.length === 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-400">Already have an account? </span>
        <button
          onClick={onGoToLogin}
          className="text-blue-400 hover:text-blue-300 font-medium"
          disabled={loading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

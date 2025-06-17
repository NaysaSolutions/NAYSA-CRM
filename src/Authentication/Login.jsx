import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from "../Authentication/AuthContext";
import { PostAPI } from "../api";

function Login() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await PostAPI("loginDB", formData);

      if (response.data.status === "success") {
        const userData = response.data.user;
        const token = response.data.token;
        localStorage.setItem('token', token);
        setUser(userData);

        await Swal.fire({
          title: `Welcome, ${userData.username}!`,
          icon: "success",
          timer: 2000,
          confirmButtonText: "OK",
        });

        navigate("/dashboard");
      } else {
        await Swal.fire({
          title: "Login failed!",
          text: response.data.message || "Invalid credentials. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      await Swal.fire({
        title: "Error!",
        text: "An error occurred while trying to log in. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#7392b7] to-[#d8e1e9] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/20 backdrop-blur-lg shadow-xl rounded-3xl px-6 py-10 w-full max-w-md relative">
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#5882C1] opacity-70 rounded-3xl z-0" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-6">
            <img src="/naysa_logo.png" alt="Logo" className="h-16 w-auto mb-2" />
            <h1 className="text-white text-xl font-bold font-sans tracking-wide">Customer Relations Management (CRM)</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="userId" className="block text-white text-sm mb-1">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                placeholder="Input User ID"
                className="p-2 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-white text-sm mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 8 characters"
                className="p-2 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="text-right mb-4">
              <Link to="/forgot-password" className="text-sm text-white hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#162e3a] text-white font-medium py-2.5 rounded-lg hover:bg-[#1c3c4b] transition"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-200">
                Don’t have an account?{' '}
                <span
                  onClick={() => navigate('/register')}
                  className="text-white underline cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </div>

            <p className="text-xs text-white text-center mt-4">© 2025 ALL RIGHTS RESERVED</p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

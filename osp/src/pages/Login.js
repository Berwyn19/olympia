import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bolt } from 'lucide-react';
import { auth } from '../services/firebase'; // adjust path as needed
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // to redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // or wherever you want to go after login
    } catch (error) {
      setError("Email or password is incorrect")
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
              <Bolt />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Olympia</h1>
          <p className="text-gray-600 mt-1">Welcome back! Sign in to continue your learning journey.</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Sign In</h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your credentials to access your account
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end text-sm mb-2">
            <a href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

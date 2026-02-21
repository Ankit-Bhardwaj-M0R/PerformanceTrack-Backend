import React, { useState } from 'react';
import { User, UserRole } from '../../App';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

function LoginContent({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const demoAccounts = [
    { email: 'employee@test.com', password: 'employee123', role: 'EMPLOYEE' as UserRole, name: 'John Employee', department: 'Engineering' },
    { email: 'manager@test.com', password: 'manager123', role: 'MANAGER' as UserRole, name: 'Jane Manager', department: 'Engineering' },
    { email: 'admin@test.com', password: 'admin123', role: 'ADMIN' as UserRole, name: 'Sam Admin', department: 'Administration' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const account = demoAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
      onLogin({
        id: demoAccounts.indexOf(account) + 1,
        name: account.name,
        email: account.email,
        role: account.role,
        department: account.department,
      });
    } else {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    onLogin({
      id: demoAccounts.indexOf(account) + 1,
      name: account.name,
      email: account.email,
      role: account.role,
      department: account.department,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">PT</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PerformanceTrack</h1>
          <p className="text-gray-600 mt-2">Employee Performance Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Login to your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Demo Credentials</h3>
          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <div key={account.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.role}</p>
                  <p className="text-xs text-gray-600">{account.email}</p>
                  <p className="text-xs text-gray-500">Password: {account.password}</p>
                </div>
                <button
                  onClick={() => handleDemoLogin(account)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-700">Contact Admin</a>
        </p>
      </div>
    </div>
  );
}

export function Login({ onLogin }: LoginProps) {
  return (
    <ThemeProvider>
      <LoginContent onLogin={onLogin} />
    </ThemeProvider>
  );
}
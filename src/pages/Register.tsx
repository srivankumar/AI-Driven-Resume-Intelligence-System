import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  checkEmailExists,
} from '../utils/validation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailCheckingError, setEmailCheckingError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time name validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setError('');

    if (value) {
      const validation = validateName(value);
      setNameError(validation.error || '');
    } else {
      setNameError('');
    }
  };

  // Real-time email validation with duplicate check
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');

    if (value) {
      const validation = validateEmail(value);
      setEmailError(validation.error || '');

      // Check if email exists only if email is valid
      if (validation.isValid && value.length > 5) {
        setCheckingEmail(true);
        const existsCheck = await checkEmailExists(value);
        setCheckingEmail(false);

        if (!existsCheck.isValid) {
          setEmailCheckingError(existsCheck.error || '');
        } else {
          setEmailCheckingError('');
        }
      }
    } else {
      setEmailError('');
      setEmailCheckingError('');
    }
  };

  // Real-time password validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError('');

    if (value) {
      const validation = validatePassword(value);
      setPasswordError(validation.error || '');
      setPasswordWarning(validation.warning || '');
    } else {
      setPasswordError('');
      setPasswordWarning('');
    }

    // Check if passwords match
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  // Real-time confirm password validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setError('');

    if (value) {
      if (password !== value) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final validation before submission
    if (nameError || emailError || emailCheckingError || passwordError || confirmPasswordError) {
      setError('Please fix all errors before submitting');
      return;
    }

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const response = await register(name, email, password);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="bg-slate-900 p-3 rounded-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-2">Create Account</h2>
        <p className="text-center text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">Join our job portal today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700">Full Name</label>
              {name && !nameError && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition text-sm sm:text-base ${
                nameError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : name && !nameError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="John Doe"
            />
            {nameError && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {nameError}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700">Email Address</label>
              {email && !emailError && !emailCheckingError && !checkingEmail && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {checkingEmail && <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />}
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                emailError || emailCheckingError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : email && !emailError && !emailCheckingError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="you@example.com"
              disabled={checkingEmail}
            />
            {emailError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
            {emailCheckingError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailCheckingError}
              </p>
            )}
            {checkingEmail && (
              <p className="mt-2 text-sm text-blue-600">Checking email...</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              {password && !passwordError && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                passwordError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : password && !passwordError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </p>
            )}
            {passwordWarning && !passwordError && (
              <p className="mt-2 text-sm text-amber-600">💡 {passwordWarning}</p>
            )}
            {password && (
              <div className="mt-2 text-xs text-slate-600">
                <p>Password requirements:</p>
                <div className="flex gap-2 mt-1 text-slate-500">
                  <span>✓ At least 6 characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              {confirmPassword && !confirmPasswordError && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                confirmPasswordError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : confirmPassword && !confirmPasswordError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="••••••••"
            />
            {confirmPasswordError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              nameError !== '' ||
              emailError !== '' ||
              emailCheckingError !== '' ||
              passwordError !== '' ||
              confirmPasswordError !== '' ||
              checkingEmail
            }
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

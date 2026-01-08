import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { validateEmail, validateLoginForm } from '../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Real-time email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value) {
      const validation = validateEmail(value);
      setEmailError(validation.error || '');
    } else {
      setEmailError('');
    }
    setError(''); // Clear form error when user starts editing
  };

  // Real-time password validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!value) {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form before submission
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError || 'Please check your input');
      return;
    }

    setLoading(true);

    const response = await login(email, password);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return;
    }

    if (response.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="bg-slate-900 p-3 rounded-lg">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-center text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700">
                Email Address
              </label>
              {email && !emailError && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition text-sm sm:text-base ${
                emailError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : email && !emailError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="you@example.com"
            />
            {emailError && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700">
                Password
              </label>
              {password && !passwordError && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:border-transparent transition text-sm sm:text-base ${
                passwordError
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : password && !passwordError
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || emailError !== '' || passwordError !== ''}
            className="w-full bg-slate-900 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-600 mt-4 sm:mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

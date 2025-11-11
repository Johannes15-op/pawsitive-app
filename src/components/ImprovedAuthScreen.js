import React, { useState } from 'react';
import { Heart, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const ImprovedAuthScreen = ({ setIsLoggedIn, setCurrentScreen }) => {
  const [authMode, setAuthMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setCurrentScreen('home');
    }, 2000);
  };

  const isFormValid = () => {
    if (authMode === 'login') {
      return formData.username && formData.password;
    } else {
      return formData.username && formData.email && formData.password && 
             formData.confirmPassword && formData.password === formData.confirmPassword;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Heart className="text-pink-500 fill-current" size={32} />
          </div>
          <p className="text-gray-600">
            {authMode === 'login' ? 'Signing you in...' : 'Creating your account...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        {}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-pink-500 fill-current" size={32} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">TAARA</h2>
          <p className="text-xs text-gray-500 mb-4">Tabaco Animal Rescue and Adoption</p>
          
          {}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'register' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {}
        <form onSubmit={handleSubmit} className="space-y-4">
          {}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-colors"
              required
            />
          </div>

          {}
          {authMode === 'register' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-colors"
                required
              />
            </div>
          )}

          {}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          {}
          {authMode === 'register' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          )}

          {}
          {authMode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-pink-500 hover:text-pink-600 transition-colors"
              >
                Forgot your Password?
              </button>
            </div>
          )}

          {}
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isFormValid()
                ? 'bg-pink-400 text-white hover:bg-pink-500'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {}
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedAuthScreen;
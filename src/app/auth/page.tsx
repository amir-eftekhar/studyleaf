'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image'
import logoSrc from '../img/logo.png'

const LoginSignup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = searchParams?.get('auth');
    setIsLogin(auth !== 'signup');
  }, [searchParams]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    router.push(`/auth?auth=${isLogin ? 'signup' : 'login'}`, { scroll: false });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setIsLoading(false);
        return;
      }
    }
    
    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          const callbackUrl = searchParams?.get('callbackUrl') || '/home';
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        const res = await axios.post('/api/auth/signup', {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          phone: formData.get('phone'),
        });

        if (res.data.success) {
          // After signup, automatically sign in
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (!result?.error) {
            router.push('/home');
            router.refresh();
          }
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error.response?.data || error);
      setError(error.response?.data?.error || error.response?.data?.details || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center mb-12">
        <Image 
          src={logoSrc} 
          alt="StudyLeaf Logo" 
          width={64} 
          height={64} 
          className="mr-3"
        />
        <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          StudyLeaf
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>

          <div className="mb-8 text-center">
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to continue your journey' 
                : 'Start your learning journey today'
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-gray-100 hover:bg-gray-100/80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-gray-100 hover:bg-gray-100/80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-gray-100 hover:bg-gray-100/80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:bg-gray-100 hover:bg-gray-100/80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm flex items-center justify-center">
                  <p>{error}</p>
                </div>
              )}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleForm}
                  className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 text-center text-sm text-gray-500">
            By continuing, you agree to StudyLeaf's
            <a href="#" className="text-indigo-600 hover:text-indigo-500 ml-1">Terms of Service</a>
            <span className="mx-1">and</span>
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignup;
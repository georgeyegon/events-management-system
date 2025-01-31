import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin');
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(adminStatus === 'true');
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const loadingToast = toast.loading('Logging in...');
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Invalid username or password');
        } else if (response.status === 429) {
          toast.error('Too many login attempts. Please try again later');
        } else {
          toast.error(data.message || 'Login failed. Please try again');
        }
        return;
      }

      if (data.token && data.role) {
        setIsLoggedIn(true);
        const userRole = data.role;
        setIsAdmin(userRole === 'admin');
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', JSON.stringify(userRole === 'admin'));
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        toast.error('Login failed. Missing token or role');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please check your connection and try again');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div>
      <nav className="rounded-lg shadow bg-green-800 m-4">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/G.png" className="h-16" alt="G Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-yellow-600">Events</span>
          </Link>
          <div className="hidden w-full md:block md:w-auto">
            <ul className="font-medium flex flex-col p-4 md:px-4 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
              <li>
                <Link to="/" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                  Home
                </Link>
              </li>
              {isAdmin && (
                <>
                <li>
                  <Link to="/admin/addevent" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                    Add Event
                  </Link>
                </li>
                <li>
                  <Link to="/admin/events" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                    My Events
                  </Link>
                </li>
                </>
              )}
              {isLoggedIn && !isAdmin && (
                <li>
                  <Link to="/my-account" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                    My Account
                  </Link>
                </li>
              )}
              {!isLoggedIn && (
                <>
                  <li>
                    <Link to="/register" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                      Login
                    </Link>
                  </li>
                </>
              )}
              {isLoggedIn && (
                <li>
                  <button onClick={handleLogout} className="block py-2 px-3 text-lg rounded md:hover:bg-transparent md:border-0 md:p-0 text-yellow-600 hover:text-white">
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className='text-lg container mx-auto min-h-[90vh]'>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Outlet context={{ handleLogin }} />
      </div>

      <footer className="rounded-lg shadow bg-green-800 m-4">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className='flex items-center gap-4'>
              <div>
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img src="/G.png" className="h-16" alt="G Logo" />
                </Link>
              </div>
              <div>
                <span className="self-center text-2xl font-semibold text-yellow-600">Events</span>
                <p className='text-sm text-yellow-600 hover:text-lg hover:underline'> 0704839736 </p>
                <p className='text-sm text-yellow-600 hover:text-lg hover:underline'> georgeyegon01@gmail.com </p>
              </div>
            </div>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 text-yellow-600">
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">About</a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
              </li>
              <li>
                <a href="#" className="hover:underline">Contact</a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center text-yellow-600">
            © 2024 <a href="#" className="hover:underline">G Events™</a>. All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

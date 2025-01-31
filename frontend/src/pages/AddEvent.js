import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AddEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    description: '',
    date: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check for both user and token
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (!user.role) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login again');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/admin/add_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event added successfully');
        navigate('/admin/events'); // Redirect to events list
      } else {
        toast.error(data.msg || 'Error adding event');
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className='grid w-auto h-[80vh] mt-8'>
      <div className='bg-green-800 text-white flex justify-center items-center'>
        <Link to="/" className="grid justify-center items-center gap-4">
          <img src="/G.png" className="h-20" alt="G Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-yellow-500">
            Events
          </span>
        </Link>
      </div>

      <div className='flex flex-col justify-center items-center p-6'>
        <h1 className='text-center text-green-800 font-semibold text-2xl mb-6'>Add Event</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Title</label>
            <input 
              name="title"
              value={formData.title} 
              onChange={handleChange} 
              type="text" 
              className="bg-gray-00 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"  
              required 
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Image URL</label>
            <input 
              name="image_url"
              value={formData.image_url} 
              onChange={handleChange} 
              type="text" 
              className="bg-gray-00 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Description</label>
            <textarea 
              name="description"
              value={formData.description} 
              onChange={handleChange} 
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"  
              rows='5'
              placeholder='Event description...'
              required 
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Date and Time</label>
            <input 
              name="date"
              value={formData.date}
              onChange={handleChange}
              type="datetime-local" 
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"
              required 
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Location</label>
            <input 
              name="location"
              value={formData.location}
              onChange={handleChange}
              type="text" 
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"
              required 
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Event Organizer</label>
            <input 
              value={currentUser?.username || ''} 
              disabled
              type="text" 
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"  
            />
          </div>

          <div className='flex justify-center'>
            <button 
              type="submit" 
              disabled={loading}
              className={`text-white bg-green-800 rounded p-2 px-4 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              {loading ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
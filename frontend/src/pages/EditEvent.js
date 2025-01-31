import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetch(`https://events-manager-5wr8.onrender.com/events/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setImageUrl(data.image_url);
        setContent(data.content);
        setAuthor(data.author);
      })
      .catch(error => {
        console.error('Error fetching event:', error);
        toast.error('Failed to fetch event details');
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`https://events-manager-5wr8.onrender.com/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, image_url: imageUrl, content, author })
    })
      .then(res => res.json())
      .then(() => {
        toast.success('Event updated successfully!');
        navigate('/');
      })
      .catch(error => {
        console.error('Error updating event:', error);
        toast.error('Failed to update event');
      });
  };

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
      <h1 className='text-center text-green-800 font-semibold text-2xl mb-6'>Update Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
        <label className="block mb-2 text-md font-medium text-green-800">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-md font-medium text-green-800">Image URL</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-md font-medium text-green-800">Details</label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="5"
          />
        </div>
        <div className="mb-5">
            <label className="block mb-2 text-md font-medium text-green-800">Event Organizer</label>
            <input 
              value={author} 
              disabled
              type="text" 
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5"  
            />
          </div>
          <div className='flex justify-center'>
            <button type="submit" className="text-white bg-green-800 rounded p-2">
              Save Changes
            </button>
          </div>
      </form>
    </div>
  </div>
  );
};

export default EditEvent;

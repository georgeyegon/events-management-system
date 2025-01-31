import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function MyEvents() {
  const [user, setUser] = useState(null);
  const [postedEvents, setPostedEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser && currentUser.isAdmin) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setUser(currentUser);
      fetchPostedEvents(currentUser.id); // Pass admin_id to fetch function
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  const fetchPostedEvents = async (adminId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/events?admin_id=${adminId}`);
      const events = await response.json();

      if (!response.ok) {
        throw new Error(events.msg || "Failed to fetch events");
      }

      setPostedEvents(events);
    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching events:", error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!user) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove deleted event from state
      setPostedEvents(postedEvents.filter((event) => event.id !== eventId));
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error(error.message);
      console.error("Error deleting event:", error);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/edit-event/${id}`);
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="grid w-auto mt-8">
      {/* Header */}
      <div className="bg-green-800 text-white flex justify-center items-center">
        <Link to="/" className="grid justify-center items-center gap-4">
          <img src="/G.png" className="h-20" alt="G Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-yellow-500">
            Events
          </span>
        </Link>
      </div>

      {/* Event List */}
      <div className="flex flex-col justify-center items-center p-6">
        <h1 className="text-center text-green-800 font-semibold text-2xl mb-6">My Posted Events</h1>
        <div>
          {postedEvents.length === 0 ? (
            <p>No events posted yet.</p>
          ) : (
            <ul>
              {postedEvents.map((event) => (
                <li key={event.id} className="mb-4 border-b border-gray-300 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <img
                        src={event.image_url || "/default-image.jpg"}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <h4 className="text-lg font-semibold text-green-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleUpdate(event.id)}
                            className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

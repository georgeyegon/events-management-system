import React, { useEffect, useState } from 'react'
import Event from '../components/Event'

export default function Home() 
{
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(()=>{
    fetch("https://events-manager-5wr8.onrender.com/events" )
    .then((res)=>res.json())
    .then((data)=>{
       setEvents(data)
    })

  },[])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value) 
  }

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div className="">
      <div className="flex justify-end p-4">
        <form onSubmit={handleSearchSubmit} className=" ">   
            <label className="mb-2 text-sm font-medium text-green-800 sr-only dark:text-green-800">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div> 
                <input 
                  type="search" 
                  id="default-search" 
                  value={searchTerm}  
                  onChange={handleSearchChange} 
                  className="block w-full p-4 pl-10 text-sm text-green-800 border border-gray-300 rounded-lg bg-gray-50 dark:border-green-800 dark:placeholder-gray-500 dark:text-gray-800" 
                  placeholder="Search Event..." 
                  required 
                />
                <button type="submit" className="text-yellow-600 absolute end-2.5 bottom-2.5 bg-green-800 hover:bg-green-800 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-800 dark:hover:bg-green-700 ">Search</button>
            </div>
        </form>
      </div>

      <div className='grid lg:grid-cols-3 p-4 gap-8'>
        {
          filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Event key={event.id} event={event} />
            ))
          ) : (
            <p className="text-center col-span-2 text-green-800">No events found.</p>
          )
        }
      </div>
    </div>

  )
}

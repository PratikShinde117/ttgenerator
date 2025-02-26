

import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { TimetableForm } from "./components/timetableForm";
import { TimetableDisplay } from "./components/timeTabledisplay";
import ThemeToggle from "./components/toogleButton";

export const App = () => {
  const [timetable, setTimetable] = useState([
  ]);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get("http://localhost:5000/timetable");
      setTimetable(response.data.data);
    } catch (error) {
      console.error("Error fetching timetable data", error);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  
  const onEntryAdded = (newEntry) => {
    setTimetable((prevTimetable) => [...prevTimetable, newEntry]); 
  };
  

  return (
    <div className="imp">
       {/* <ThemeToggle/> */}
      <TimetableForm onEntryAdded={onEntryAdded} />
      <TimetableDisplay/>
    </div>
  );
};



import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";
import ThemeToggle from "./toogleButton";

export const TimetableForm = ({ onEntryAdded }) => {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState({
    start: "",
    till: "",
  });

  const [formData, setFormData] = useState({
    division: "A",
    subject_name: "DSA",
    professor_name: "",
    classroom_number: "",
    start_time: "",
    end_time: "",
    day: "Monday",
    batchDetails: {
      batch1_professor: "",
      batch1_classroom: "",
      batch1_practical_subject: "",
      batch2_professor: "",
      batch2_classroom: "",
      batch2_practical_subject: "",
      batch3_professor: "",
      batch3_classroom: "",
      batch3_practical_subject: "",
    },
  });

 

  useEffect(() => {
    const savedFormData = localStorage.getItem("timetableFormData");
    const savedDate = localStorage.getItem("timetableDate");
    const savedDay = localStorage.getItem("selectedDay");

    setFormData((prevData) => {
        const updatedFormData = savedFormData ? JSON.parse(savedFormData) : prevData;
        return {
            ...updatedFormData,
            day: savedDay || updatedFormData.day || "Monday", 
            division: updatedFormData.division || "A", // Ensure division is restored
            subject_name: updatedFormData.subject_name || "DSA", // Restore subject
            start_time: updatedFormData.start_time || "", // Restore timings
            end_time: updatedFormData.end_time || "",
        };
    });

    setDate(savedDate ? JSON.parse(savedDate) : { start: "", till: "" });

}, []);


useEffect(() => {
  localStorage.setItem("timetableFormData", JSON.stringify(formData));
  localStorage.setItem("timetableDate", JSON.stringify(date));
  localStorage.setItem("selectedDay", formData.day);
}, [formData, date]); // Ensures updates happen on every form change


 
  

  // const practicalSubjects = ["MPL(Practical)", "DSA(Practical)", "M3(Tutorial)"];

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    setFormData({
      ...formData,
      subject_name: selectedSubject,
    });
  };

  const handleBatchDetailChange = (batch, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      batchDetails: {
        ...prevData.batchDetails,
        [`${batch}_${field}`]: value,
      },
    }));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start: date.start || formData.start || "",
        till: date.till || formData.till || "",
        batchDetails: formData.batchDetails || {},
      };

      const response = await axios.post("http://localhost:5000/timetable", payload);
      console.log(response.data);

      onEntryAdded(response.data.data);

      setFormData({
        division: "A",
        subject_name: "DSA",
        professor_name: "",
        classroom_number: "",
        start_time: "",
        end_time: "",
        day: "Monday",
        batchDetails: {
          batch1_professor: "",
          batch1_classroom: "",
          batch1_practical_subject: "",
          batch2_professor: "",
          batch2_classroom: "",
          batch2_practical_subject: "",
          batch3_professor: "",
          batch3_classroom: "",
          batch3_practical_subject: "",
        },
      });

      setDate({
        start: "",
        till: "",
      });

      setMessage("Timetable entry added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="date">
        <label><strong>FROM:&nbsp;&nbsp;</strong></label>
        <input type="date" value={date.start} onChange={(e) => setDate({ ...date, start: e.target.value })} />
        <label><strong>TO:&nbsp;&nbsp;</strong></label>
        <input type="date" value={date.till} onChange={(e) => setDate({ ...date, till: e.target.value })} />
      </div>

      <form onSubmit={handleSubmit} className="data" >
        {message && <p>{message}</p>}

        <label>Day:</label>
        <select value={formData.day} onChange={(e) => {
           const selectedDay = e.target.value;
        setFormData({ ...formData, day: selectedDay })
        localStorage.setItem("selectedDay", selectedDay);
        }}
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
        </select>

        <label >Division:</label>
        <select value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value })}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        <label>Subject Name:</label>
        <select value={formData.subject_name} onChange={handleSubjectChange}>
          <option value="DSA">DSA</option>
          <option value="PPL">PPL</option>
          <option value="MPL">MPL</option>
          <option value="M3">M3</option>
          <option value="SE">SE</option>
          <option value="Long Break">Long Break</option>
          <option value="Short Break">Short Break</option>
          <option value="PBL">PBL</option>
          <option value="practical">practical</option>
        </select>

        {formData.subject_name != "practical" ? (
          <>
            <label>Professor Name:</label>
            <input type="text" placeholder="Professor Name" value={formData.professor_name} onChange={(e) => setFormData({ ...formData, professor_name: e.target.value })} />

            <label>Classroom:</label>
            <input type="text" placeholder="Classroom" value={formData.classroom_number} onChange={(e) => setFormData({ ...formData, classroom_number: e.target.value })} />
          </>
        ) : (
          <>
            <h4>Batch-wise Details for {formData.subject_name}</h4>
            {console.log(formData.batchDetails.batch1_professor)}
            <div>
              <strong>Batch 1:</strong>
              <input type="text" placeholder="Professor" value={formData.batchDetails.batch1_professor} onChange={(e) => handleBatchDetailChange("batch1", "professor", e.target.value)} />
              <input type="text" placeholder="Classroom" value={formData.batchDetails.batch1_classroom} onChange={(e) => handleBatchDetailChange("batch1", "classroom", e.target.value)} />
              <input type="text" placeholder="Practical Subject" value={formData.batchDetails.batch1_practical_subject} onChange={(e) => handleBatchDetailChange("batch1", "practical_subject", e.target.value)} />
            </div>
            <div>
              <strong>Batch 2:</strong>
              <input type="text" placeholder="Professor" value={formData.batchDetails.batch2_professor} onChange={(e) => handleBatchDetailChange("batch2", "professor", e.target.value)} />
              <input type="text" placeholder="Classroom" value={formData.batchDetails.batch2_classroom} onChange={(e) => handleBatchDetailChange("batch2", "classroom", e.target.value)} />
              <input type="text" placeholder="Practical Subject" value={formData.batchDetails.batch2_practical_subject} onChange={(e) => handleBatchDetailChange("batch2", "practical_subject", e.target.value)} />
            </div>
            <div>
              <strong>Batch 3:</strong>
              <input type="text" placeholder="Professor" value={formData.batchDetails.batch3_professor} onChange={(e) => handleBatchDetailChange("batch3", "professor", e.target.value)} />
              <input type="text" placeholder="Classroom" value={formData.batchDetails.batch3_classroom} onChange={(e) => handleBatchDetailChange("batch3", "classroom", e.target.value)} />
              <input type="text" placeholder="Practical Subject" value={formData.batchDetails.batch3_practical_subject} onChange={(e) => handleBatchDetailChange("batch3", "practical_subject", e.target.value)} />
            </div>
          </>
        )}

        <label>Start time:</label>
        <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />

        <label>End time:</label>
        <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />

        <button type="submit" onClick={handleRefresh}>Add Timetable Entry</button>
      </form>
    </div>
  );
};



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import "jspdf-autotable";
import '../index.css';



export const TimetableDisplay = () => {
  const [timetable, setTimetable] = useState([]);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [message, setMessage] = useState('');



  const fetchTimetable = async () => {
      try {
          const response = await axios.get("http://localhost:5000/timetable");
          console.log(response.data.data);
          setTimetable(response.data.data);
      } catch (error) {
          setMessage("Error fetching timetable data.");
      }
  };

  useEffect(() => {
    fetchTimetable();
}, []);

const onEntryAdded = (newEntry) => {
  setTimetable((prevTimetable) => [...prevTimetable, newEntry]); 
};

  const handleEdit = (index) => {
      setEditingTimetable({ ...timetable[index], index });
     
  };

  const handleDelete = async (index, id) => {
      try {
          const response = await axios.delete(`http://localhost:5000/timetable/${id}`);
          if (response.status === 200) {
              const updated = timetable.filter((item, i) => i !== index);
              setTimetable(updated);
          }
      } catch (error) {
          console.error("Error deleting item:", error);
      }
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setEditingTimetable((prevState) => ({
          ...prevState,
          [name]: value,
      }));
  };


const handleSave = async () => {
  try {
  
      const updatedTimetableEntry = {
          ...editingTimetable,
          day: editingTimetable.day ?? timetable[editingTimetable.index]?.day ?? "",
          division: editingTimetable.division ?? timetable[editingTimetable.index]?.division ?? "",
          timings: editingTimetable.timings ?? timetable[editingTimetable.index]?.timings ?? "",
          subject_name: editingTimetable.subject_name ?? timetable[editingTimetable.index]?.subject_name ?? "",
          professor_name: editingTimetable.professor_name ?? timetable[editingTimetable.index]?.professor_name ?? "",
          classroom_number: editingTimetable.classroom_number ?? timetable[editingTimetable.index]?.classroom_number ?? "",
          batch1_practical_subject: editingTimetable.batch1_practical_subject ?? timetable[editingTimetable.index]?.batch1_practical_subject ?? "",
          batch2_practical_subject: editingTimetable.batch2_practical_subject ?? timetable[editingTimetable.index]?.batch2_practical_subject ?? "",
          batch3_practical_subject: editingTimetable.batch3_practical_subject ?? timetable[editingTimetable.index]?.batch3_practical_subject ?? "",
          batch1_professor: editingTimetable.batch1_professor ?? timetable[editingTimetable.index]?.batch1_professor ?? "",
          batch2_professor: editingTimetable.batch2_professor ?? timetable[editingTimetable.index]?.batch2_professor ?? "",
          batch3_professor: editingTimetable.batch3_professor ?? timetable[editingTimetable.index]?.batch3_professor ?? "",
          batch1_classroom: editingTimetable.batch1_classroom ?? timetable[editingTimetable.index]?.batch1_classroom ?? "",
          batch2_classroom: editingTimetable.batch2_classroom ?? timetable[editingTimetable.index]?.batch2_classroom ?? "",
          batch3_classroom: editingTimetable.batch3_classroom ?? timetable[editingTimetable.index]?.batch3_classroom ?? "",
      };

     
      await axios.put(`http://localhost:5000/timetable/${editingTimetable.id}`, updatedTimetableEntry);

      await fetchTimetable();
   
      setMessage("Timetable updated successfully!");
      setEditingTimetable(null);
  } catch (error) {
      console.error("Error updating timetable:", error);
      setMessage("Error saving timetable.");
  }
};






  const handlePreviewPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
  
    const firstStart = timetable[0]?.start ? new Date(timetable[0].start).toLocaleDateString() : "N/A";
    const lastTill = timetable[0]?.till ? new Date(timetable[0].till).toLocaleDateString() : "N/A"; 
  
    doc.text("Dr.D.Y.Patil Institute of Technology, Pimpri, Pune", 40, 7);
    doc.text(`Master Time Table from ${firstStart} to ${lastTill}`, 50, 17);
  
    const columns = ["Day", "Division", "Subject", "Professor", "Classroom", "Start Time", "End Time"];
  
    let lastPrintedDay = "";
    let lastPrintedDivision = "";
    let emptyRowIndexes = [];
    const rows = timetable.reduce((acc, entry) => {
      let subjectName = entry.subject_name;
      let professorName = entry.professor_name;
      let classroomNumber = entry.classroom_number;
  
      // If it's a practical subject, concatenate the batch info
      if (entry.subject_name == ("practical")) {
        subjectName = `Batch 1: ${entry.batch1_practical_subject || "N/A"}\nBatch 2: ${entry.batch2_practical_subject || "N/A"}\nBatch 3: ${entry.batch3_practical_subject || "N/A"}`;
        professorName = `${entry.batch1_professor || "N/A"}\n${entry.batch2_professor || "N/A"}\n${entry.batch3_professor || "N/A"}`;
        classroomNumber = `Batch 1: ${entry.batch1_classroom || "N/A"}\nBatch 2: ${entry.batch2_classroom || "N/A"}\nBatch 3: ${entry.batch3_classroom || "N/A"}`;
      }
  
      const showDay = entry.day !== lastPrintedDay;
      const showDivision = entry.division !== lastPrintedDivision;

      if (entry.division !== lastPrintedDivision) {
        acc.push([" ", " ", " ", " ", " ", " ", " "]);
        emptyRowIndexes.push(acc.length - 1); // Insert a blank row before new division
        lastPrintedDivision = entry.division;
    }

  
      if (showDay) {
        lastPrintedDay = entry.day;
      }
  
      if (showDivision) {
        lastPrintedDivision = entry.division;
      }
  
      acc.push([
        showDay ? entry.day : "",
        showDivision ? entry.division : "",
        subjectName, 
        professorName, 
        classroomNumber, 
        entry.start_time,
        entry.end_time,
      ]);
  
      return acc;
    }, []);
  
    // Generate the table in the PDF with merged rows for batches
    // doc.autoTable({
    //   head: [columns],
    //   body: rows,
    //   startY: 20,
    //   theme: "grid",
     
    //   styles: {
    //     fontSize: 10,
    //     cellPadding: 0.5,
    //     minCellHeight: 2,
    //   },
    // });

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 20,
      theme: "grid",
      styles: {
          fontSize: 10,
          cellPadding: 0.5,
          minCellHeight: 2,
      },
      didDrawCell: function (data) {
          if (emptyRowIndexes.includes((data.row.index) + 1)) {
              // If it's an empty row, draw a thick horizontal line
              doc.setDrawColor(0); // Black color
              doc.setLineWidth(0.5); // Thicker horizontal line
              doc.line(
                  data.cell.x, 
                  data.cell.y + data.cell.height, // Line appears at the bottom of the empty row
                  data.cell.x + data.cell.width, 
                  data.cell.y + data.cell.height
              );
          }
      },
  });
  
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");
  };
  

  return (
    <div className="display">
      {message && <p>{message}</p>}
      <h1>Timetable</h1>
  
      {timetable.length > 0 ? (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Division</th>
                <th>Subject Name</th>
                <th>Professor Name</th>
                <th>Classroom Number</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((entry, index) => {
                const showDay = index === 0 || entry.day !== timetable[index - 1].day;
                const showDivision = index === 0 || entry.division !== timetable[index - 1].division;
                // console.log(timetable);
               
                return (
                  


                  <tr key={index}>
                     
  {editingTimetable && editingTimetable.index === index ? (
    // ✅ EDIT MODE: Show input fields
    <>
      <td>{showDay ? <input type="text" name="day" value={editingTimetable.day} onChange={handleChange} className='input' /> : ''}</td>
      <td>{showDivision ? <input type="text" name="division" value={editingTimetable.division} onChange={handleChange} className='input' /> : ''}</td>

      {/* Subject Name */}
      <td>
     
        {editingTimetable.subject_name.includes("practical") ? (
         
          <>
            Batch 1: <input type="text" name="batch1_practical_subject" value={editingTimetable.batch1_practical_subject || ""} onChange={handleChange} className='input' /><br />
            Batch 2: <input type="text" name="batch2_practical_subject" value={editingTimetable.batch2_practical_subject || ""} onChange={handleChange} className='input' /><br />
            Batch 3: <input type="text" name="batch3_practical_subject" value={editingTimetable.batch3_practical_subject || ""} onChange={handleChange} className='input' />
          </>
        ) : <input type="text" name="subject_name" value={editingTimetable.subject_name} onChange={handleChange} className='input' />}
      </td>

      {/* Professor Name */}
      <td>
        {editingTimetable.subject_name.includes("practical") ? (
          <>
            Batch 1: <input type="text" name="batch1_professor" value={editingTimetable.batch1_professor || ""} onChange={handleChange} className='input' /><br />
            Batch 2: <input type="text" name="batch2_professor" value={editingTimetable.batch2_professor || ""} onChange={handleChange} className='input' /><br />
            Batch 3: <input type="text" name="batch3_professor" value={editingTimetable.batch3_professor || ""} onChange={handleChange} className='input' />
          </>
        ) : <input type="text" name="professor_name" value={editingTimetable.professor_name} onChange={handleChange} className='input' />}
      </td>

      {/* Classroom */}
      <td>
        {editingTimetable.subject_name.includes("practical") ? (
          <>
            Batch 1: <input type="text" name="batch1_classroom" value={editingTimetable.batch1_classroom || ""} onChange={handleChange} className='input' /><br />
            Batch 2: <input type="text" name="batch2_classroom" value={editingTimetable.batch2_classroom || ""} onChange={handleChange} className='input' /><br />
            Batch 3: <input type="text" name="batch3_classroom" value={editingTimetable.batch3_classroom || ""} onChange={handleChange} className='input' />
          </>
        ) : <input type="text" name="classroom_number" value={editingTimetable.classroom_number} onChange={handleChange} className='input' />}
      </td>

      <td><input type="text" name="start_time" value={editingTimetable.start_time} onChange={handleChange} className='input' /></td>
      <td><input type="text" name="end_time" value={editingTimetable.end_time} onChange={handleChange} className='input' /></td>

      <td><button onClick={handleSave}>Save</button></td>
    </>
  ) : (
    // ✅ VIEW MODE: Show normal text (only one line for practical subjects)
    <>
      <td>{showDay ? entry.day : ''}</td>
      <td>{showDivision ? entry.division : ''}</td>

      {/* Subject Name */}
      <td>
        {entry.subject_name.includes("practical") ? (
          `Batch 1: ${entry.batch1_practical_subject || "N/A"}\nBatch 2: ${entry.batch2_practical_subject || "N/A"}\nBatch 3: ${entry.batch3_practical_subject || "N/A"}`
        ) : entry.subject_name}
      </td>

      {/* Professor Name */}
      <td>
        {entry.subject_name.includes("practical") ? (
           `Batch 1: ${entry.batch1_professor || "N/A"}\n\n\nBatch 2: ${entry.batch2_professor || "N/A"}\n\n\nBatch 3: ${entry.batch3_professor || "N/A"}`
        ) : entry.professor_name}
      </td>

      {/* Classroom */}
      <td>
        {entry.subject_name.includes("practical") ? (
          `Batch 1: ${entry.batch1_classroom || "N/A"}\nBatch 2: ${entry.batch2_classroom || "N/A"}\nBatch 3: ${entry.batch3_classroom || "N/A"}`
        ) : entry.classroom_number}
      </td>

      <td>{entry.start_time}</td>
      <td>{entry.end_time}</td>

      <td className="td">
        <button className="click" onClick={() => handleEdit(index)}>Edit</button>
        <button className="click" onClick={() => handleDelete(index, entry.id)}>Delete</button>
      </td>
    </>
  )}
</tr>


     );
              })}
            </tbody>
          </table>
          <button onClick={handlePreviewPDF} className="d">Preview Timetable as PDF</button>
        </div>
      ) : (
        <p>Loading timetable...</p>
      )}
    </div>
  );
 }; 



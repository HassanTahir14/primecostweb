'use client';

import { useState } from 'react';
import Button from '@/components/common/button';

interface EmployeeDutyScheduleFormProps {
  onNext: (data: { dutySchedulesDTO: any[] }) => void;
  onPrevious: () => void;
  initialData: any; // Data from previous steps
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['Opening', 'Break', 'Closing'];

// Helper to format time string "HH:MM" to time object (duplicate from api.ts, consider moving to a util file)
// Keep this if needed internally, but we mostly need string -> string now
const formatStringToTimeObject = (timeString: string | null | undefined) => { /* ... no change needed here ... */ };
const formatTime = (timeString: string | null | undefined) => {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) {
    return { hour: 0, minute: 0, second: 0, nano: 0 }; 
  }
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute, second: 0, nano: 0 };
};

export default function EmployeeDutyScheduleForm({ onNext, onPrevious, initialData }: EmployeeDutyScheduleFormProps) {
  // Initialize schedule state from initialData if present
  const [schedule, setSchedule] = useState(() => {
    // Check if initialData has the dutySchedulesDTO structure (which comes from API's dutyScheduleResponseList)
    const initialDutySchedules = initialData.dutySchedulesDTO || [];
    const newSchedule: { [key: string]: { [key: string]: string } } = {};
    
    timeSlots.forEach(slot => {
      newSchedule[slot] = {};
      daysOfWeek.forEach(day => {
        const daySchedule = initialDutySchedules.find((d: any) => d.day === day);
        let timeValue = ''; // Default to empty string
        if (daySchedule) {
            // Determine which field to use based on the slot
            const apiTimeField = slot === 'Opening' ? daySchedule.openingShift :
                                 slot === 'Break' ? daySchedule.breakTime :
                                 daySchedule.closingShift;
            
            // Extract HH:MM from HH:MM:SS if the string exists and is valid
            if (apiTimeField && typeof apiTimeField === 'string') {
                const match = apiTimeField.match(/^(\d{2}:\d{2})/);
                if (match) {
                    timeValue = match[1]; // Get the HH:MM part
                }
            }
        }
        newSchedule[slot][day] = timeValue;
      });
    });
    console.log("Initialized Schedule State:", newSchedule); // Log the state being set
    return newSchedule;
  });

  const handleScheduleChange = (slot: string, day: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [day]: value, // Store as HH:MM string
      },
    }));
  };

  const handleAddSchedule = () => {
    console.log("Add Schedule button clicked - Placeholder");
  };

  const handleNextClick = () => {
    // Transform the state into the API-expected format
    const dutySchedulesDTO = daysOfWeek.map(day => ({
      day: day,
      openingShift: formatTime(schedule.Opening?.[day]),
      breakTime: formatTime(schedule.Break?.[day]),
      closingShift: formatTime(schedule.Closing?.[day])
    }));
    
    console.log("Duty Schedule DTO:", dutySchedulesDTO);
    onNext({ dutySchedulesDTO }); // Pass the formatted data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Employee Duty Schedule</h2>
        {/* <Button onClick={handleAddSchedule}>Add Schedule</Button> */}
        {/* Commenting out Add Schedule button as functionality is unclear */}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 font-medium text-sm text-gray-600 w-24">Time</th>
              {daysOfWeek.map(day => (
                <th key={day} className="border border-gray-300 p-2 font-medium text-sm text-gray-600">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot}>
                <td className="border border-gray-300 p-2 font-medium text-sm text-gray-700 bg-gray-50">{slot}</td>
                {daysOfWeek.map(day => (
                  <td key={`${slot}-${day}`} className="border border-gray-300 p-0">
                    <input
                      type="time" // Use type="time" for better UX
                      value={schedule[slot]?.[day] || ''}
                      onChange={(e) => handleScheduleChange(slot, day, e.target.value)}
                      className="w-full h-full p-2 border-none focus:ring-1 focus:ring-inset focus:ring-[#00997B] outline-none text-center text-sm"
                      // placeholder="HH:MM"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button size="lg" onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 
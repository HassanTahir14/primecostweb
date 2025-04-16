'use client';

import { useState } from 'react';
import Button from '@/components/common/button';

interface EmployeeDutyScheduleFormProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  initialData: any; // Data from previous steps
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['Opening', 'Break', 'Closing'];

export default function EmployeeDutyScheduleForm({ onNext, onPrevious, initialData }: EmployeeDutyScheduleFormProps) {
  // Initialize schedule state - could be more complex based on actual requirements
  const [schedule, setSchedule] = useState(() => {
    const initialSchedule = initialData.schedule || {};
    const newSchedule: { [key: string]: { [key: string]: string } } = {};
    timeSlots.forEach(slot => {
      newSchedule[slot] = {};
      daysOfWeek.forEach(day => {
        newSchedule[slot][day] = initialSchedule[slot]?.[day] || '';
      });
    });
    return newSchedule;
  });

  const handleScheduleChange = (slot: string, day: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [day]: value,
      },
    }));
  };

  const handleAddSchedule = () => {
    // TODO: Implement logic for adding schedule (e.g., opening a modal, adding rows)
    console.log("Add Schedule button clicked");
  };

  const handleNextClick = () => {
    console.log("Duty Schedule Data:", schedule);
    onNext({ schedule }); // Pass schedule data to the next step
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Employee Duty Schedule</h2>
        <Button onClick={handleAddSchedule}>Add Schedule</Button>
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
                      type="text" // Consider using time input if appropriate
                      value={schedule[slot]?.[day] || ''}
                      onChange={(e) => handleScheduleChange(slot, day, e.target.value)}
                      className="w-full h-full p-2 border-none focus:ring-1 focus:ring-inset focus:ring-[#00997B] outline-none text-center text-sm"
                      placeholder="--:--"
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
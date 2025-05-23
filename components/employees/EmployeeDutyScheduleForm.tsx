'use client';

import { useState } from 'react';
import Button from '@/components/common/button';
import Modal from '@/components/common/Modal';
import { useTranslation } from '@/context/TranslationContext';

interface EmployeeDutyScheduleFormProps {
  onNext: (data: { dutySchedulesDTO: any[] }) => void;
  onPrevious: () => void;
  initialData: any; // Data from previous steps
  onSave?: (data: any) => void;
}

export default function EmployeeDutyScheduleForm({ onNext, onPrevious, initialData, onSave }: EmployeeDutyScheduleFormProps) {
  const { t } = useTranslation();

  const daysOfWeek = [
    t('employees.dutySchedule.days.monday'),
    t('employees.dutySchedule.days.tuesday'),
    t('employees.dutySchedule.days.wednesday'),
    t('employees.dutySchedule.days.thursday'),
    t('employees.dutySchedule.days.friday'),
    t('employees.dutySchedule.days.saturday'),
    t('employees.dutySchedule.days.sunday')
  ];
  const timeSlots = [
    t('employees.dutySchedule.slots.Opening'),
    t('employees.dutySchedule.slots.Break'),
    t('employees.dutySchedule.slots.Closing')
  ];

  // Helper to format time string "HH:MM" to time object (duplicate from api.ts, consider moving to a util file)
  // Keep this if needed internally, but we mostly need string -> string now
  const formatStringToTimeObject = (timeString: string | null | undefined) => { /* ... no change needed here ... */ };
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || timeString === '00:00:00' || !/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      return ''; // Return empty string for invalid or 00:00:00 times
    }
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  type SlotKey = 'Opening' | 'Break' | 'Closing';

  function timeStringToObject(time: string | undefined): { hour: number, minute: number, second: number, nano: number } | null {
    if (!time) return null;
    const [hour, minute] = time.split(':').map(Number);
    return {
      hour: hour || 0,
      minute: minute || 0,
      second: 0,
      nano: 0
    };
  }

  // Initialize schedule state from initialData if present
  const [schedule, setSchedule] = useState(() => {
    // Try to get data from localStorage first
    const storedData = localStorage.getItem('employeeDutySchedule');
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If no stored data, use initialData
    const initialDutySchedules = initialData.dutySchedulesDTO || [];
    const newSchedule: { [key: string]: { [key: string]: string } } = {};
    
    timeSlots.forEach(slot => {
      newSchedule[slot] = {};
      daysOfWeek.forEach(day => {
        const daySchedule = initialDutySchedules.find((d: any) => d.day === day);
        let timeValue = ''; // Default to empty string
        if (daySchedule) {
          // Map the time values based on slot
          const timeField = slot === 'Opening' ? daySchedule.openingShift :
                          slot === 'Break' ? daySchedule.breakTime :
                          daySchedule.closingShift;
          timeValue = formatTime(timeField);
        }
        newSchedule[slot][day] = timeValue;
      });
    });
    return newSchedule;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applyAll, setApplyAll] = useState<Record<SlotKey, boolean>>({
    Opening: false,
    Break: false,
    Closing: false,
  });
  const [modalSelectedDays, setModalSelectedDays] = useState<string[]>([]);
  const [modalTimes, setModalTimes] = useState<Record<SlotKey, string>>({
    Opening: '',
    Break: '',
    Closing: '',
  });

  const handleScheduleChange = (slot: string, day: string, value: string) => {
    setSchedule((prev: { [key: string]: { [key: string]: string } }) => {
      const updated = {
        ...prev,
        [slot]: {
          ...prev[slot],
          [day]: value,
        },
      };
      // Save to localStorage
      localStorage.setItem('employeeDutySchedule', JSON.stringify(updated));
      // Save to parent component
      if (onSave) {
        const dutySchedules = daysOfWeek.map(day => ({
          day: day,
          openingShift: timeStringToObject(updated.Opening?.[day]),
          breakTime: timeStringToObject(updated.Break?.[day]),
          closingShift: timeStringToObject(updated.Closing?.[day])
        }));
        onSave({ dutySchedulesDTO: dutySchedules });
      }
      return updated;
    });
  };

  const handleAddSchedule = () => {
    console.log("Add Schedule button clicked - Placeholder");
  };

  const handleModalDayToggle = (day: string) => {
    setModalSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleModalTimeChange = (slot: SlotKey, value: string) => {
    setModalTimes(prev => ({ ...prev, [slot]: value }));
  };

  const handleModalSave = () => {
    setSchedule((prev: { [key: string]: { [key: string]: string } }) => {
      let updated = { ...prev };
      (['Opening', 'Break', 'Closing'] as SlotKey[]).forEach(slot => {
        if (applyAll[slot] && modalTimes[slot]) {
          modalSelectedDays.forEach(day => {
            updated[slot][day] = modalTimes[slot];
          });
        }
      });
      // Save to localStorage
      localStorage.setItem('employeeDutySchedule', JSON.stringify(updated));
      // Save to parent component
      if (onSave) {
        const dutySchedules = daysOfWeek.map(day => ({
          day: day,
          openingShift: timeStringToObject(updated.Opening?.[day]),
          breakTime: timeStringToObject(updated.Break?.[day]),
          closingShift: timeStringToObject(updated.Closing?.[day])
        }));
        onSave({ dutySchedulesDTO: dutySchedules });
      }
      return updated;
    });
    setIsModalOpen(false);
  };

  const handleNextClick = () => {
    // Transform the state into the API-expected format
    const dutySchedules = daysOfWeek.map(day => ({
      day: day,
      openingShift: timeStringToObject(schedule.Opening?.[day]),
      breakTime: timeStringToObject(schedule.Break?.[day]),
      closingShift: timeStringToObject(schedule.Closing?.[day])
    }));

    console.log("Duty Schedules (API format):", dutySchedules);
    onNext({ dutySchedulesDTO: dutySchedules }); // Pass the formatted data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('employees.dutySchedule.title')}</h2>
        <Button onClick={() => setIsModalOpen(true)}>{t('employees.dutySchedule.addButton')}</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 font-medium text-sm text-gray-600 w-24">{t('employees.dutySchedule.time')}</th>
              {daysOfWeek.map(day => (
                <th key={day} className="border border-gray-300 p-2 font-medium text-sm text-gray-600">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot}>
                <td className="border border-gray-300 p-2 font-medium text-sm text-gray-700 bg-gray-50">{t(`${slot}`)}</td>
                {daysOfWeek.map(day => (
                  <td key={`${slot}-${day}`} className="border border-gray-300 p-0">
                    <input
                      type="time"
                      value={schedule[slot]?.[day] || ''}
                      onChange={(e) => handleScheduleChange(slot, day, e.target.value)}
                      className="w-full h-full p-2 border-none focus:ring-1 focus:ring-inset focus:ring-[#00997B] outline-none text-center text-sm"
                      placeholder="-"
                    />
                    {!schedule[slot]?.[day] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-gray-400">-</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('employees.dutySchedule.modal.title')} size="md">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {daysOfWeek.map(day => (
              <button
                key={day}
                type="button"
                className={`rounded px-3 py-1 font-medium border transition-colors ${modalSelectedDays.includes(day) ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-100 text-blue-900 border-blue-200'}`}
                onClick={() => handleModalDayToggle(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            {(timeSlots as SlotKey[]).map(slot => (
              <div key={slot} className="flex items-center gap-4">
                <span className="w-32 font-medium">{t(`${slot}`)} {t('employees.dutySchedule.modal.shift')}</span>
                <input
                  type="time"
                  value={modalTimes[slot]}
                  onChange={e => handleModalTimeChange(slot, e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="checkbox"
                  checked={applyAll[slot]}
                  onChange={e => setApplyAll(prev => ({ ...prev, [slot]: e.target.checked }))}
                  className="h-4 w-4 text-[#00997B] focus:ring-[#00997B] border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">{t('employees.dutySchedule.modal.applyToAll')}</label>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleModalSave} className="bg-[#05A49D] text-white hover:bg-[#048c86] px-6">{t('employees.dutySchedule.modal.saveButton')}</Button>
          </div>
        </div>
      </Modal>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onPrevious}>{t('employees.dutySchedule.previousButton')}</Button>
        <Button size="lg" onClick={handleNextClick}>{t('employees.dutySchedule.nextButton')}</Button>
      </div>
    </div>
  );
}
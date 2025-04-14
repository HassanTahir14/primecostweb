'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface RecipeProcedureFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

interface ProcedureStep {
  id: number;
  description: string;
  type: string; // Assuming 'CP' is a type, maybe critical point?
}

export default function RecipeProcedureForm({ onNext, onBack, initialData }: RecipeProcedureFormProps) {
  const [steps, setSteps] = useState<ProcedureStep[]>(initialData.procedureSteps || [{ id: 1, description: '', type: 'CP' }]);

  const handleAddStep = () => {
    const newId = steps.length > 0 ? steps[steps.length - 1].id + 1 : 1;
    setSteps([...steps, { id: newId, description: '', type: 'CP' }]);
  };

  const handleStepChange = (id: number, field: keyof ProcedureStep, value: string) => {
    setSteps(steps.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  const handleDeleteStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleFinalSubmit = () => {
    onNext({ procedureSteps: steps });
  };

  // Mock data for step type select
  const stepTypes = ['CP', 'Standard', 'Prep']; // Example types

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe Procedure's</h2>
        <Button variant="secondary" onClick={handleAddStep}>
          <Plus className="w-4 h-4 mr-2" />
          Add step
        </Button>
      </div>

      <label className="block text-gray-700 font-medium mb-2">Procedure Steps</label>

      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          <span className="font-medium text-gray-700 whitespace-nowrap">Step {index + 1}:</span>
          <input
            type="text"
            placeholder="Enter procedure description"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
            value={step.description}
            onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white"
            value={step.type}
            onChange={(e) => handleStepChange(step.id, 'type', e.target.value)}
          >
            {stepTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteStep(step.id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={handleFinalSubmit}>ADD RECIPE</Button>
      </div>
    </div>
  );
} 
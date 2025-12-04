import React, { useState, useEffect } from 'react';
import { Button, Input, Icons } from './UI';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  initialValue: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [filename, setFilename] = useState(initialValue);

  // Update filename when initialValue changes (e.g. if name is updated)
  useEffect(() => {
    setFilename(initialValue);
  }, [initialValue]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm(filename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Save as PDF</h3>
        <p className="text-sm text-slate-500 mb-6">
          Enter a filename for your resume. When the print dialog opens, select <strong>"Save as PDF"</strong> as the destination.
        </p>
        
        <div className="space-y-4">
          <Input 
            label="Filename" 
            value={filename} 
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. John_Doe_Resume"
            autoFocus
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={() => onConfirm(filename)} 
              icon={<Icons.Download size={16} />}
            >
              Save PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
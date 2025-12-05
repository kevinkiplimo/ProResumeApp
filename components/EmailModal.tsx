import React, { useState } from 'react';
import { Button, Input, Icons, RichTextArea } from './UI';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (to: string, subject: string, body: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('My Resume');
  const [body, setBody] = useState('Please find my resume attached.');

  if (!isOpen) return null;

  const handleSend = () => {
    onConfirm(to, subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">Email Resume</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800">
           <strong>Note:</strong> This will generate your PDF and open your default email client. You will need to attach the downloaded PDF file manually.
        </div>

        <div className="space-y-4">
          <Input 
            label="Recipient Email" 
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            placeholder="recruiter@example.com"
            type="email"
            autoFocus
          />
          <Input 
            label="Subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Job Application - John Doe"
          />
          <RichTextArea 
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Dear Hiring Manager..."
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSend} 
              icon={<Icons.Mail size={16} />}
              disabled={!to}
            >
              Prepare Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
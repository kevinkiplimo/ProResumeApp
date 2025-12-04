import React, { useState, useRef } from 'react';
import { Button, Icons } from './UI';
import { parseResumeFromText } from '../services/geminiService';
import { ResumeData } from '../types';

interface WelcomeModalProps {
  onStartFresh: () => void;
  onDataParsed: (data: Partial<ResumeData>) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartFresh, onDataParsed }) => {
  const [mode, setMode] = useState<'initial' | 'paste'>('initial');
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const parsed = await parseResumeFromText(pasteText);
      onDataParsed(parsed);
    } catch (err) {
      setError('Failed to process resume. Please try again or start fresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation to check if it looks like a resume
        if (json.personalInfo || json.experience) {
            onDataParsed(json);
        } else {
            setError("Invalid project file format.");
            // Reset error after 3 seconds
            setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError("Failed to read project file.");
        setTimeout(() => setError(''), 3000);
      }
    };
    reader.readAsText(file);
    // Reset value so same file can be selected again if needed
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">ProResume AI</h1>
          <p className="text-blue-100">Build your professional resume in minutes</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-200">
                {error}
            </div>
          )}

          {mode === 'initial' ? (
            <div className="grid md:grid-cols-3 gap-6">
              <button 
                onClick={onStartFresh}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-blue-600">
                  <Icons.FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Create New</h3>
                <p className="text-sm text-slate-500">Start from scratch with our guided wizard.</p>
              </button>

              <button 
                onClick={() => setMode('paste')}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-600">
                  <Icons.Wand2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Import Resume</h3>
                <p className="text-sm text-slate-500">Paste your existing resume text to start.</p>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-center"
              >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleFileUpload}
                />
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-green-600">
                  <Icons.Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Open Project</h3>
                <p className="text-sm text-slate-500">Upload a saved .json project file.</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-lg font-bold text-slate-800">Paste Your Resume</h3>
                 <button onClick={() => setMode('initial')} className="text-sm text-slate-500 hover:text-slate-800">Back</button>
              </div>
              
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste the full text of your resume here..."
                className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              />
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <div className="flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setMode('initial')}>Cancel</Button>
                 <Button 
                   variant="primary" 
                   onClick={handleParse} 
                   loading={loading}
                   className="bg-purple-600 hover:bg-purple-700"
                   disabled={!pasteText.trim()}
                 >
                   Analyze & Build
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
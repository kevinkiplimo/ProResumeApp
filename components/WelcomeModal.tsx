import React, { useState } from 'react';
import { Button, Icons, Input, RichTextArea } from './UI';
import { parseResumeFromText, generateTailoredResume } from '../services/geminiService';
import { ResumeData } from '../types';

interface WelcomeModalProps {
  onStartFresh: () => void;
  onDataParsed: (data: Partial<ResumeData>) => void;
}

type Mode = 'initial' | 'paste' | 'tailor';

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartFresh, onDataParsed }) => {
  const [mode, setMode] = useState<Mode>('initial');
  
  // Basic Paste State
  const [pasteText, setPasteText] = useState('');
  
  // Tailor State
  const [tailorData, setTailorData] = useState({
    resume: '',
    linkedin: '',
    jobDesc: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // For wizard if needed, or simple scrolling form

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

  const handleTailor = async () => {
    if (!tailorData.resume.trim() || !tailorData.jobDesc.trim()) {
      setError("Resume and Job Description are required.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const parsed = await generateTailoredResume(
        tailorData.resume,
        tailorData.linkedin,
        tailorData.jobDesc,
        tailorData.location
      );
      onDataParsed(parsed);
    } catch (err) {
      setError('Failed to generate tailored resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden animate-fade-in-up my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center shrink-0">
          <h1 className="text-3xl font-bold text-white mb-2">ProResume AI</h1>
          <p className="text-blue-100">Build your professional resume in minutes</p>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-200">
                {error}
            </div>
          )}

          {mode === 'initial' && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Option 1: Create New */}
              <button 
                onClick={onStartFresh}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-center h-full"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-blue-600">
                  <Icons.FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Create from Scratch</h3>
                <p className="text-sm text-slate-500">Use our guided builder to create a resume step-by-step.</p>
              </button>

              {/* Option 2: Import */}
              <button 
                onClick={() => setMode('paste')}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-center h-full"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-600">
                  <Icons.Wand2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Import & Enhance</h3>
                <p className="text-sm text-slate-500">Paste your existing resume and let AI structure it for you.</p>
              </button>

              {/* Option 3: Tailored */}
              <button 
                onClick={() => setMode('tailor')}
                className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group text-center h-full"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-teal-600">
                  <Icons.Briefcase size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Tailor</h3>
                <p className="text-sm text-slate-500">Target a specific job by combining your Resume & LinkedIn.</p>
              </button>
            </div>
          )}

          {mode === 'paste' && (
            <div className="space-y-4 max-w-3xl mx-auto">
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

          {mode === 'tailor' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
               <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div>
                   <h3 className="text-xl font-bold text-slate-800">Tailored Resume Generator</h3>
                   <p className="text-sm text-slate-500">Our AI will merge your profiles and target the specific job.</p>
                 </div>
                 <button onClick={() => setMode('initial')} className="text-sm text-slate-500 hover:text-slate-800">Back</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1. Current Resume Text</label>
                    <textarea 
                       className="w-full h-40 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                       placeholder="Paste your current resume content here..."
                       value={tailorData.resume}
                       onChange={(e) => setTailorData({...tailorData, resume: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Icons.Linkedin size={14} className="text-blue-600"/> 2. LinkedIn Profile (About/Experience)
                    </label>
                    <textarea 
                       className="w-full h-40 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                       placeholder="Paste text from your LinkedIn profile..."
                       value={tailorData.linkedin}
                       onChange={(e) => setTailorData({...tailorData, linkedin: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">3. Target Job Description</label>
                    <textarea 
                       className="w-full h-40 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                       placeholder="Paste the job description you are applying for..."
                       value={tailorData.jobDesc}
                       onChange={(e) => setTailorData({...tailorData, jobDesc: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">4. New Role Location</label>
                    <Input 
                       placeholder="e.g. London, UK (Remote)"
                       value={tailorData.location}
                       onChange={(e) => setTailorData({...tailorData, location: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="primary" 
                      onClick={handleTailor} 
                      loading={loading}
                      className="w-full bg-teal-600 hover:bg-teal-700 py-3"
                      disabled={!tailorData.resume || !tailorData.jobDesc}
                      icon={<Icons.Sparkles size={18} />}
                    >
                      Generate Tailored Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
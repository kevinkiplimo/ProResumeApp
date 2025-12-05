import React, { useState } from 'react';
import { ResumeData, SectionType, ExperienceItem, EducationItem, ReferenceItem } from './types';
import { ResumePreview, TemplateType } from './components/ResumePreview';
import { WelcomeModal } from './components/WelcomeModal';
import { ExportModal } from './components/ExportModal';
import { EmailModal } from './components/EmailModal';
import { Button, Input, RichTextArea, Icons } from './components/UI';
import { enhanceText, generateSummary } from './services/geminiService';

declare global {
  interface Window {
    html2pdf: any;
  }
}

// Initial Empty State
const initialResumeState: ResumeData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  references: []
};

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeState);
  const [activeSection, setActiveSection] = useState<SectionType | 'design'>('personal');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateType>('modern');
  
  // Navigation Items
  const navItems: { id: SectionType | 'design'; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Contact', icon: <Icons.User size={18} /> },
    { id: 'summary', label: 'Summary', icon: <Icons.FileText size={18} /> },
    { id: 'experience', label: 'Experience', icon: <Icons.Briefcase size={18} /> },
    { id: 'education', label: 'Education', icon: <Icons.GraduationCap size={18} /> },
    { id: 'skills', label: 'Skills', icon: <Icons.Wand2 size={18} /> },
    { id: 'references', label: 'References', icon: <Icons.Users size={18} /> },
    { id: 'design', label: 'Design', icon: <Icons.Palette size={18} /> },
  ];

  // Update Handlers
  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '- ' // Automatically start with bullet point
    };
    setResumeData(prev => ({ ...prev, experience: [newItem, ...prev.experience] }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(i => i.id !== id) }));
  };

  const addEducation = () => {
    const newItem: EducationItem = {
      id: generateId(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '- ' // Automatically start with bullet point
    };
    setResumeData(prev => ({ ...prev, education: [newItem, ...prev.education] }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(i => i.id !== id) }));
  };

  const addReference = () => {
    const newItem: ReferenceItem = {
      id: generateId(),
      name: '',
      role: '',
      company: '',
      email: '',
      phone: ''
    };
    setResumeData(prev => ({ ...prev, references: [...prev.references, newItem] }));
  };

  const updateReference = (id: string, field: keyof ReferenceItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      references: prev.references.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeReference = (id: string) => {
    setResumeData(prev => ({ ...prev, references: prev.references.filter(i => i.id !== id) }));
  };

  const updateSkills = (value: string) => {
    // Split by comma and clean up
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
    setResumeData(prev => ({ ...prev, skills: skillsArray }));
  };

  // AI Actions
  const handleEnhanceDescription = async (id: string, text: string, role: string) => {
    if (!text) return;
    setEnhancingId(id);
    const improved = await enhanceText(text, role);
    updateExperience(id, 'description', improved);
    setEnhancingId(null);
  };

  const handleGenerateSummary = async () => {
    setEnhancingId('summary');
    const summary = await generateSummary(resumeData);
    if (summary) setResumeData(prev => ({ ...prev, summary }));
    setEnhancingId(null);
  };

  const handleDataParsed = (data: Partial<ResumeData>) => {
    // Merge parsed data with ids
    const merged: ResumeData = {
      ...initialResumeState,
      ...data,
      experience: (data.experience || []).map(e => ({ ...e, id: generateId() })),
      education: (data.education || []).map(e => ({ ...e, id: generateId() })),
      references: (data.references || []).map(r => ({ ...r, id: generateId() })),
    };
    setResumeData(merged);
    setShowWelcome(false);
  };

  // Save as JSON Project file
  const handleSaveProject = () => {
    const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_Project.json`;
    const json = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Core PDF Generation Logic (Reusable)
  const generatePDF = async (filename: string, callback?: () => void) => {
    if (typeof window.html2pdf === 'undefined') {
        alert("PDF generator is initializing. Please try again in a moment.");
        return;
    }

    const originalElement = document.getElementById('resume-preview');
    if (!originalElement) return;

    // Wait for fonts to ensure no layout shift or missing text
    try {
        await document.fonts.ready;
    } catch (e) {
        console.warn("Font loading check failed, proceeding anyway.");
    }

    // Clone logic: Create a clean environment for the PDF capture
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // Force exact A4 width context
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Reset styles for the clone to ensure flat A4 rendering without internal padding
    // We remove the internal padding because html2pdf will add the 1-inch margins
    clone.style.transform = 'none';
    clone.style.margin = '0'; 
    clone.style.setProperty('padding', '0', 'important'); // Critical: Override Tailwind p-[20mm]
    clone.style.boxShadow = 'none';
    clone.classList.remove('shadow-2xl', 'mx-auto', 'my-8', 'p-[20mm]', 'p-[15mm]', 'p-[10mm]'); 
    
    clone.style.height = 'auto'; // Allow full expansion
    clone.style.minHeight = '297mm';
    clone.style.width = '100%';
    clone.style.whiteSpace = 'normal';
    clone.style.overflow = 'visible'; 

    container.appendChild(clone);

    const cleanFilename = filename.trim().endsWith('.pdf') 
      ? filename.trim() 
      : `${filename.trim()}.pdf`;

    // Microsoft Word Standard Configuration
    const opt = {
      margin: [25.4, 25.4, 25.4, 25.4], // 1 inch = 25.4mm (Top, Left, Bottom, Right)
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 4, // High Resolution (4x)
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollY: 0, // Critical to prevent scroll offset issues
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    window.html2pdf()
      .set(opt)
      .from(clone)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Add Pagination Footer (Word Style)
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          // Position inside the bottom margin area (Page height - ~15mm)
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
        }
      })
      .save()
      .then(() => {
        document.body.removeChild(container);
        if (callback) callback();
      })
      .catch((err: any) => {
        console.error('PDF Generation Error:', err);
        document.body.removeChild(container);
        alert('Failed to generate PDF. Please check console.');
      });
  };

  // Open Modal for PDF Download
  const handleDownloadClick = () => {
    setShowExportModal(true);
  };

  // Execute PDF Download
  const handleConfirmExport = (filename: string) => {
    setShowExportModal(false);
    // Slight delay to allow modal to close completely
    setTimeout(() => {
        generatePDF(filename);
    }, 100);
  };

  // Open Modal for Email
  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  // Execute Email Logic
  const handleConfirmEmail = (to: string, subject: string, body: string) => {
    setShowEmailModal(false);
    
    // 1. Generate PDF so user has it
    const filename = getDefaultFilename();
    generatePDF(filename, () => {
        // 2. Open Mail Client after PDF generation triggers
        setTimeout(() => {
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
            // 3. Inform User
            alert("Your Resume PDF has been downloaded. Please attach it to the email window that just opened.");
        }, 1000);
    });
  };

  // Helper to generate default filename
  const getDefaultFilename = () => {
    const name = resumeData.personalInfo.fullName || 'Resume';
    return `${name}_CV`;
  };

  return (
    <>
      {showWelcome && (
        <WelcomeModal 
          onStartFresh={() => setShowWelcome(false)} 
          onDataParsed={handleDataParsed} 
        />
      )}
      
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleConfirmExport}
        initialValue={getDefaultFilename()}
      />

      <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onConfirm={handleConfirmEmail}
      />

      <div className="flex h-screen bg-slate-100 font-sans">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 print:hidden">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              ProResume AI
            </h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
             <Button 
              onClick={handleSaveProject} 
              variant="secondary"
              className="w-full justify-center" 
              icon={<Icons.Save size={16} />}
              title="Save project file to edit later"
            >
              Save Project
            </Button>
            <Button 
              onClick={handleEmailClick} 
              variant="secondary"
              className="w-full justify-center" 
              icon={<Icons.Mail size={16} />}
              title="Email Resume"
            >
              Email Resume
            </Button>
            <Button 
              onClick={handleDownloadClick} 
              className="w-full justify-center" 
              icon={<Icons.Download size={16} />}
              title="Save as PDF file"
            >
              Save as PDF
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* EDITOR COLUMN */}
          <div id="editor-column" className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 md:max-w-xl border-r border-slate-200 print:hidden">
            <div className="max-w-lg mx-auto pb-20">
              
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeSection} Details</h2>
              </div>

              {/* SECTION: PERSONAL */}
              {activeSection === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                  <Input label="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} placeholder="Jane Doe" />
                  <Input label="Email" value={resumeData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="jane@example.com" />
                  <Input label="Phone" value={resumeData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="+1 555 010 9999" />
                  <Input label="Location" value={resumeData.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="New York, NY" />
                  <Input label="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/jane" />
                  <Input label="Website / Portfolio" value={resumeData.personalInfo.website} onChange={(e) => updatePersonalInfo('website', e.target.value)} placeholder="janedoe.com" />
                </div>
              )}

              {/* SECTION: SUMMARY */}
              {activeSection === 'summary' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start gap-2 mb-4">
                    <Icons.Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">AI Tip:</p>
                      <p>Click "Auto-Generate" to write a summary based on your experience.</p>
                    </div>
                  </div>
                  <RichTextArea 
                    label="Professional Summary" 
                    value={resumeData.summary} 
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Briefly describe your professional background..."
                    className="min-h-[200px]"
                    onEnhance={resumeData.experience.length > 0 ? handleGenerateSummary : undefined}
                    isEnhancing={enhancingId === 'summary'}
                  />
                  
                  {/* Character Limit Indicator */}
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-slate-400">Supports Markdown</span>
                    <span className={`font-medium ${resumeData.summary.length > 700 ? "text-red-500" : "text-slate-400"}`}>
                      {resumeData.summary.length} / 700 chars
                    </span>
                  </div>

                  {resumeData.experience.length > 0 && (
                     <Button 
                       variant="secondary" 
                       size="sm" 
                       onClick={handleGenerateSummary} 
                       loading={enhancingId === 'summary'}
                       icon={<Icons.Wand2 size={14}/>}
                     >
                       Auto-Generate
                     </Button>
                  )}
                </div>
              )}

              {/* SECTION: EXPERIENCE */}
              {activeSection === 'experience' && (
                <div className="space-y-6 animate-fade-in">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
                       <button 
                         onClick={() => removeExperience(exp.id)}
                         className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <Icons.Trash2 size={18} />
                       </button>
                       
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="col-span-2 md:col-span-1">
                            <Input label="Job Title" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Product Manager" />
                         </div>
                         <div className="col-span-2 md:col-span-1">
                            <Input label="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Acme Corp" />
                         </div>
                         
                         {/* Date Logic */}
                         <div className="col-span-2">
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-slate-700">Dates</label>
                                <label className="text-xs text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                                    <input 
                                        type="checkbox" 
                                        checked={!!exp.displayDate} 
                                        onChange={(e) => updateExperience(exp.id, 'displayDate', e.target.checked ? (exp.startDate ? `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}` : '') : undefined)}
                                        className="mr-1"
                                    />
                                    Use custom date format
                                </label>
                             </div>
                             
                             {exp.displayDate !== undefined ? (
                                <Input 
                                    value={exp.displayDate} 
                                    onChange={(e) => updateExperience(exp.id, 'displayDate', e.target.value)} 
                                    placeholder="e.g. 2018 - 2019" 
                                />
                             ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Start Date" />
                                    <div className="flex items-center gap-2">
                                        {!exp.current && (
                                            <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="End Date" />
                                        )}
                                        <div className={exp.current ? "w-full" : ""}>
                                            <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer h-10 px-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-blue-600" />
                                                <span>Current</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                             )}
                         </div>
                       </div>
                       
                       <RichTextArea 
                         label="Description / Achievements" 
                         value={exp.description} 
                         onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                         placeholder="- Led a team of 5 engineers..."
                         onEnhance={() => handleEnhanceDescription(exp.id, exp.description, exp.role)}
                         isEnhancing={enhancingId === exp.id}
                       />
                    </div>
                  ))}
                  
                  <Button onClick={addExperience} variant="secondary" className="w-full border-dashed" icon={<Icons.Plus size={16} />}>
                    Add Position
                  </Button>
                </div>
              )}

              {/* SECTION: EDUCATION */}
              {activeSection === 'education' && (
                <div className="space-y-6 animate-fade-in">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                       <button 
                         onClick={() => removeEducation(edu.id)}
                         className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <Icons.Trash2 size={18} />
                       </button>
                       
                       <div className="grid grid-cols-1 gap-4 mb-4">
                         <Input label="Institution / University" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="University of Tech" />
                         <Input label="Degree / Certificate" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="BSc Computer Science" />
                         
                         {/* Date Logic */}
                         <div className="col-span-2">
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-slate-700">Dates</label>
                                <label className="text-xs text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                                    <input 
                                        type="checkbox" 
                                        checked={!!edu.displayDate} 
                                        onChange={(e) => updateEducation(edu.id, 'displayDate', e.target.checked ? (edu.startDate ? `${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}` : '') : undefined)}
                                        className="mr-1"
                                    />
                                    Use custom date format
                                </label>
                             </div>
                             
                             {edu.displayDate !== undefined ? (
                                <Input 
                                    value={edu.displayDate} 
                                    onChange={(e) => updateEducation(edu.id, 'displayDate', e.target.value)} 
                                    placeholder="e.g. 2016-2020" 
                                />
                             ) : (
                                <div className="grid grid-cols-2 gap-4">
                                   <Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="Start Date" />
                                   <div className="flex items-center gap-2">
                                       {!edu.current && (
                                           <Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="End Date" />
                                       )}
                                       <div className={edu.current ? "w-full" : ""}>
                                            <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer h-10 px-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)} className="rounded text-blue-600" />
                                                <span>Current</span>
                                            </label>
                                        </div>
                                   </div>
                                </div>
                             )}
                         </div>

                         <div className="col-span-2">
                             <RichTextArea
                                 label="Additional Details (Optional)"
                                 value={edu.description || ''}
                                 onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                 placeholder="- Graduated with Honors..."
                             />
                         </div>
                       </div>
                    </div>
                  ))}
                   <Button onClick={addEducation} variant="secondary" className="w-full border-dashed" icon={<Icons.Plus size={16} />}>
                    Add Education
                  </Button>
                </div>
              )}

              {/* SECTION: SKILLS */}
              {activeSection === 'skills' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Skills (Comma separated)</label>
                    <textarea 
                      value={resumeData.skills.join(', ')} 
                      onChange={(e) => updateSkills(e.target.value)}
                      className="w-full h-32 rounded-md border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Project Management, React, TypeScript, Leadership..."
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                       {resumeData.skills.map((skill, i) => (
                         <span key={i} className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                           {skill}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: REFERENCES */}
              {activeSection === 'references' && (
                <div className="space-y-6 animate-fade-in">
                   {resumeData.references.map((ref) => (
                    <div key={ref.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                       <button 
                         onClick={() => removeReference(ref.id)}
                         className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <Icons.Trash2 size={18} />
                       </button>
                       <div className="grid grid-cols-2 gap-4">
                           <Input label="Name" value={ref.name} onChange={(e) => updateReference(ref.id, 'name', e.target.value)} placeholder="Dr. John Smith" />
                           <Input label="Company" value={ref.company} onChange={(e) => updateReference(ref.id, 'company', e.target.value)} placeholder="Tech University" />
                           <Input label="Role / Title" value={ref.role} onChange={(e) => updateReference(ref.id, 'role', e.target.value)} placeholder="Senior Professor" />
                           <Input label="Email" value={ref.email} onChange={(e) => updateReference(ref.id, 'email', e.target.value)} placeholder="john@example.com" />
                           <Input label="Phone" value={ref.phone} onChange={(e) => updateReference(ref.id, 'phone', e.target.value)} placeholder="+1 555 123 4567" />
                       </div>
                    </div>
                  ))}
                  <Button onClick={addReference} variant="secondary" className="w-full border-dashed" icon={<Icons.Plus size={16} />}>
                    Add Reference
                  </Button>
                </div>
              )}

              {/* SECTION: DESIGN (TEMPLATE SELECTION) */}
              {activeSection === 'design' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-medium text-slate-700">Choose a Template</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Modern Template Option */}
                    <button 
                      onClick={() => setTemplate('modern')}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                        template === 'modern' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-20 bg-white border border-slate-200 shadow-sm rounded flex flex-col p-1">
                            <div className="h-2 w-full bg-slate-800 rounded-sm mb-1"></div>
                            <div className="h-1 w-2/3 bg-blue-500 rounded-sm mb-2"></div>
                            <div className="space-y-1">
                                <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                            </div>
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Modern Professional</h4>
                            <p className="text-sm text-slate-500 mt-1">Clean sans-serif fonts with subtle blue accents. Best for tech and corporate roles.</p>
                         </div>
                      </div>
                      {template === 'modern' && <div className="absolute top-4 right-4 text-blue-600"><Icons.Check size={20} /></div>}
                    </button>

                    {/* Classic Template Option */}
                    <button 
                      onClick={() => setTemplate('classic')}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                        template === 'classic' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-20 bg-white border border-slate-200 shadow-sm rounded flex flex-col p-1 items-center">
                            <div className="h-2 w-3/4 bg-slate-900 rounded-sm mb-2 mt-1"></div>
                            <div className="h-px w-full bg-slate-300 mb-1"></div>
                            <div className="space-y-1 w-full">
                                <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                            </div>
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Classic Elegant</h4>
                            <p className="text-sm text-slate-500 mt-1">Traditional serif fonts with centered headers. Timeless and authoritative.</p>
                         </div>
                      </div>
                      {template === 'classic' && <div className="absolute top-4 right-4 text-blue-600"><Icons.Check size={20} /></div>}
                    </button>

                    {/* Minimal Template Option */}
                    <button 
                      onClick={() => setTemplate('minimal')}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                        template === 'minimal' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-20 bg-white border border-slate-200 shadow-sm rounded flex flex-col p-1">
                            <div className="h-3 w-1/2 bg-slate-800 rounded-sm mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-px w-full bg-slate-200"></div>
                                <div className="h-1 w-3/4 bg-slate-100 rounded-sm"></div>
                            </div>
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Minimalist</h4>
                            <p className="text-sm text-slate-500 mt-1">High whitespace, gray typography, left-aligned. Focus purely on content.</p>
                         </div>
                      </div>
                      {template === 'minimal' && <div className="absolute top-4 right-4 text-blue-600"><Icons.Check size={20} /></div>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          <div id="preview-column" className="flex-1 bg-slate-200 overflow-y-auto p-8 flex justify-center items-start print:p-0 print:bg-white print:block">
            <div className="scale-[0.8] md:scale-[0.85] lg:scale-[0.9] xl:scale-100 origin-top transition-transform duration-200 print:scale-100 print:origin-top-left print:m-0 print:p-0 print:w-full">
              <ResumePreview data={resumeData} template={template} />
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

export default App;
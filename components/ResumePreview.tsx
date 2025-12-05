import React from 'react';
import { ResumeData } from '../types';

export type TemplateType = 'modern' | 'classic' | 'minimal';

interface ResumePreviewProps {
  data: ResumeData;
  template?: TemplateType;
}

// Helper to render markdown-like text
const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc ml-5 space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      const processed = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      listItems.push(<li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: processed }} />);
    } else {
      flushList();
      if (!trimmed) return;
      const processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      elements.push(
        <div key={`p-${index}`} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    }
  });
  flushList();
  return <div className={`text-sm leading-relaxed ${className}`}>{elements}</div>;
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template = 'modern' }) => {
  
  // --- TEMPLATE: CLASSIC (Serif, Centered, Traditional) ---
  if (template === 'classic') {
    return (
      <div 
        id="resume-preview" 
        className="resume-page bg-white w-[210mm] mx-auto p-[20mm] shadow-2xl text-slate-900 print:shadow-none print:w-full print:m-0 font-serif"
        style={{ minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-4">
            {data.personalInfo.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-700 justify-center">
             {data.personalInfo.location && <span>📍 {data.personalInfo.location}</span>}
             {data.personalInfo.phone && <span>📞 {data.personalInfo.phone}</span>}
             {data.personalInfo.email && <span>✉️ {data.personalInfo.email}</span>}
             {data.personalInfo.linkedin && <span>🔗 {data.personalInfo.linkedin}</span>}
          </div>
          {data.personalInfo.website && <div className="text-sm mt-1 text-slate-700">🌐 {data.personalInfo.website}</div>}
        </div>

        {/* Content Sections */}
        {data.summary && (
          <section className="mb-8 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-3 border-b border-slate-300 pb-1 text-center">
              Professional Summary
            </h2>
            <div className="text-justify text-slate-800">
              <MarkdownText text={data.summary} />
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1 text-center">
              Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-lg">{exp.company}</h3>
                    <span className="text-sm italic text-slate-600">
                       {exp.displayDate ? exp.displayDate : `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`}
                    </span>
                  </div>
                  <div className="text-md font-semibold italic mb-2">{exp.role}</div>
                  <div className="text-slate-800"><MarkdownText text={exp.description} /></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1 text-center">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid">
                   <div className="flex justify-between items-baseline">
                     <h3 className="font-bold text-lg">{edu.institution}</h3>
                     <span className="text-sm italic text-slate-600">
                        {edu.displayDate ? edu.displayDate : `${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}`}
                     </span>
                   </div>
                   <div className="italic">{edu.degree}</div>
                   {edu.description && <div className="mt-1"><MarkdownText text={edu.description} /></div>}
                </div>
              ))}
            </div>
          </section>
        )}

         {data.skills.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1 text-center">
              Skills
            </h2>
            <div className="text-center text-slate-800">
               {data.skills.join(' • ')}
            </div>
          </section>
        )}

        {data.references.length > 0 && (
          <section className="break-inside-avoid">
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-300 pb-1 text-center">
              References
            </h2>
             <div className="grid grid-cols-2 gap-6">
               {data.references.map((ref) => (
                 <div key={ref.id}>
                   <div className="font-bold">{ref.name}</div>
                   <div>{ref.role}, {ref.company}</div>
                   <div className="text-sm text-slate-600">{ref.email}</div>
                 </div>
               ))}
             </div>
          </section>
        )}
      </div>
    );
  }

  // --- TEMPLATE: MINIMAL (Clean, Sans-Serif, Left Aligned, Gray Accents) ---
  if (template === 'minimal') {
    return (
      <div 
        id="resume-preview" 
        className="resume-page bg-white w-[210mm] mx-auto p-[20mm] shadow-2xl text-slate-800 print:shadow-none print:w-full print:m-0 font-sans"
        style={{ minHeight: '297mm' }}
      >
        <header className="mb-10 break-inside-avoid">
          <h1 className="text-4xl font-light tracking-wide text-slate-900 mb-2 uppercase">
            {data.personalInfo.fullName || "Your Name"}
          </h1>
          <div className="text-sm text-slate-500 font-light flex flex-col gap-1">
             <div className="flex gap-4">
                {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
             </div>
             <div className="flex gap-4">
                {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
                {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
             </div>
          </div>
        </header>

        {data.summary && (
          <section className="mb-10 break-inside-avoid">
            <div className="text-sm text-slate-700 leading-relaxed max-w-2xl">
              <MarkdownText text={data.summary} />
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Experience</h2>
            <div className="space-y-8">
              {data.experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid relative pl-4 border-l-2 border-slate-100">
                  <div className="mb-2">
                    <h3 className="font-semibold text-slate-900">{exp.role}</h3>
                    <div className="flex justify-between items-center text-sm mt-0.5">
                       <span className="text-slate-600">{exp.company}</span>
                       <span className="text-slate-400 font-mono text-xs">
                          {exp.displayDate ? exp.displayDate : `${exp.startDate} — ${exp.current ? 'Present' : exp.endDate}`}
                       </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <MarkdownText text={exp.description} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.education.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Education</h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                    <h3 className="font-medium text-slate-900">{edu.institution}</h3>
                    <div className="text-sm text-slate-600">{edu.degree}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                       {edu.displayDate ? edu.displayDate : `${edu.startDate} — ${edu.current ? 'Present' : edu.endDate}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="mb-8 break-inside-avoid">
               <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Skills</h2>
               <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-700">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-50 px-2 py-1 rounded">{skill}</span>
                  ))}
               </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MODERN (Default, Sans-Serif, Blue Accents) ---
  return (
    <div 
      id="resume-preview" 
      className="resume-page bg-white w-[210mm] mx-auto p-[15mm] shadow-2xl text-slate-800 print:shadow-none print:w-full print:m-0 font-sans"
      style={{ minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase mb-3">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-600 mt-2 justify-center sm:justify-start font-medium">
          {data.personalInfo.location && <span>📍 {data.personalInfo.location}</span>}
          {data.personalInfo.phone && <span>📞 {data.personalInfo.phone}</span>}
          {data.personalInfo.email && <span>✉️ {data.personalInfo.email}</span>}
          {data.personalInfo.linkedin && <span>🔗 {data.personalInfo.linkedin}</span>}
          {data.personalInfo.website && <span>🌐 {data.personalInfo.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-3 border-b border-slate-200 pb-2">
            Professional Summary
          </h2>
          <div className="text-sm leading-7 text-slate-700">
            <MarkdownText text={data.summary} />
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-4 border-b border-slate-200 pb-2">
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="break-inside-avoid mb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                  <h3 className="font-bold text-lg text-slate-900">{exp.role}</h3>
                  <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                    {exp.displayDate ? exp.displayDate : `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`}
                  </span>
                </div>
                <div className="text-md font-semibold text-slate-700 mb-2">{exp.company}</div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  <MarkdownText text={exp.description} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-4 border-b border-slate-200 pb-2">
            Education
          </h2>
          <div className="space-y-5">
            {data.education.map((edu) => (
              <div key={edu.id} className="break-inside-avoid">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                  <h3 className="font-bold text-lg text-slate-900">{edu.institution}</h3>
                  <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                     {edu.displayDate ? edu.displayDate : `${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}`}
                  </span>
                </div>
                <div className="text-md text-slate-700 mb-1">{edu.degree}</div>
                {edu.description && (
                  <div className="text-sm text-slate-600 leading-relaxed mt-1">
                     <MarkdownText text={edu.description} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-3 border-b border-slate-200 pb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* References */}
      {data.references.length > 0 && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-4 border-b border-slate-200 pb-2">
            References
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {data.references.map((ref) => (
              <div key={ref.id} className="text-sm">
                <div className="font-bold text-lg text-slate-900">{ref.name}</div>
                <div className="text-slate-700 font-medium">{ref.role}</div>
                <div className="text-slate-600 italic mb-1">{ref.company}</div>
                <div className="text-slate-500 space-y-0.5">
                  {ref.email && <div className="flex items-center gap-2">✉️ {ref.email}</div>}
                  {ref.phone && <div className="flex items-center gap-2">📞 {ref.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
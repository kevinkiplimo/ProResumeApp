import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

// Helper to render markdown-like text with proper list handling
const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text into lines to process lists structure
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
    
    // Handle List Items (start with - or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      // Process bold/italic inside list item
      const processed = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
      listItems.push(
        <li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: processed }} />
      );
    } else {
      // Flush any pending list if we hit a non-list line
      flushList();
      
      if (!trimmed) {
        // Option: add a spacer for empty lines or ignore
        // elements.push(<div key={`br-${index}`} className="h-2"></div>); 
        return; 
      }

      // Regular paragraph
      const processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
      elements.push(
        <div key={`p-${index}`} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    }
  });
  
  // Flush any remaining list at the end of the text
  flushList();

  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      {elements}
    </div>
  );
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  return (
    <div 
      id="resume-preview" 
      className="resume-page bg-white w-[210mm] mx-auto p-[15mm] shadow-2xl text-slate-800 print:shadow-none print:w-full print:m-0 font-serif"
      style={{ minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-3">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-600 mt-2 justify-center sm:justify-start">
          {data.personalInfo.location && (
            <span className="flex items-center">📍 {data.personalInfo.location}</span>
          )}
          {data.personalInfo.phone && (
            <span className="flex items-center">📞 {data.personalInfo.phone}</span>
          )}
          {data.personalInfo.email && (
            <span className="flex items-center">✉️ {data.personalInfo.email}</span>
          )}
          {data.personalInfo.linkedin && (
            <span className="flex items-center">🔗 {data.personalInfo.linkedin}</span>
          )}
          {data.personalInfo.website && (
            <span className="flex items-center">🌐 {data.personalInfo.website}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-2">
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2">
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="break-inside-avoid mb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                  <h3 className="font-bold text-lg text-slate-900">{exp.role}</h3>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                    {exp.displayDate ? exp.displayDate : `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`}
                  </span>
                </div>
                <div className="text-md font-semibold text-slate-700 mb-2 italic">{exp.company}</div>
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2">
            Education
          </h2>
          <div className="space-y-5">
            {data.education.map((edu) => (
              <div key={edu.id} className="break-inside-avoid">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                  <h3 className="font-bold text-lg text-slate-900">{edu.institution}</h3>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                     {edu.displayDate ? edu.displayDate : `${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}`}
                  </span>
                </div>
                <div className="text-md text-slate-700 italic mb-1">{edu.degree}</div>
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-2">
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2">
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
import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

// Helper to render markdown-like text
const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;
  
  // Basic conversion for bullets and bold
  const htmlContent = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n\s*-\s+(.*)/g, '<li class="ml-4 list-disc pl-1">$1</li>') // Bullets
    .replace(/\n/g, '<br />'); // Newlines

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  return (
    <div 
      id="resume-preview" 
      className="resume-page bg-white w-[210mm] mx-auto p-[15mm] shadow-2xl text-slate-800 print:shadow-none print:w-full print:m-0"
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
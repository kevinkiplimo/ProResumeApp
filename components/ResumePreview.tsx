import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

// Helper to render markdown-like text (very basic)
const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;
  
  // Basic conversion for bullets and bold
  const htmlContent = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n\s*-\s+(.*)/g, '<li class="ml-4 list-disc">$1</li>') // Bullets
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
      className="resume-page bg-white w-[210mm] mx-auto p-[15mm] shadow-2xl text-slate-800"
      style={{ minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-2">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600 mt-3">
          {data.personalInfo.location && (
            <span>📍 {data.personalInfo.location}</span>
          )}
          {data.personalInfo.phone && (
            <span className="border-l border-slate-300 pl-3">📞 {data.personalInfo.phone}</span>
          )}
          {data.personalInfo.email && (
            <span className="border-l border-slate-300 pl-3">✉️ {data.personalInfo.email}</span>
          )}
          {data.personalInfo.linkedin && (
            <span className="border-l border-slate-300 pl-3">🔗 {data.personalInfo.linkedin}</span>
          )}
          {data.personalInfo.website && (
            <span className="border-l border-slate-300 pl-3">🌐 {data.personalInfo.website}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
            Professional Summary
          </h2>
          <div className="text-sm leading-relaxed text-slate-700">
            <MarkdownText text={data.summary} />
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">
            Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-xs font-medium text-slate-500">
                    {exp.displayDate ? exp.displayDate : `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</div>
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
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                  <span className="text-xs font-medium text-slate-500">
                     {edu.displayDate ? edu.displayDate : `${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}`}
                  </span>
                </div>
                <div className="text-sm text-slate-700">{edu.degree}</div>
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* References */}
      {data.references.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">
            References
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {data.references.map((ref) => (
              <div key={ref.id} className="text-sm">
                <div className="font-bold text-slate-900">{ref.name}</div>
                <div className="text-slate-700">{ref.role}, {ref.company}</div>
                <div className="text-slate-500 mt-1">
                  {ref.email && <div>{ref.email}</div>}
                  {ref.phone && <div>{ref.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
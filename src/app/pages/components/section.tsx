// components/Section.tsx
import React from 'react';

type SectionProps = {
  title: string;
  content: string;
  code?: boolean;
};

const Section: React.FC<SectionProps> = ({ title, content, code = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      <pre
        className={`${
          code
            ? 'bg-gray-900 text-green-100 p-4 rounded-lg overflow-x-auto text-sm'
            : 'whitespace-pre-wrap text-gray-700'
        }`}
      >
        {content}
      </pre>
    </div>
  );
};

export default Section;

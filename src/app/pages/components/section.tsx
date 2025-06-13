import React from 'react';

type SectionProps = {
  title: string;
  content: string | string[] | Record<string, string> | null;
};

export default function Section({ title, content }: SectionProps) {
  const renderContent = () => {
    if (!content) {
      return <p className="text-gray-500 italic">No content available.</p>;
    }

    if (typeof content === 'string') {
      return <p className="text-gray-700 whitespace-pre-wrap">{content}</p>;
    }

    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    if (typeof content === 'object') {
      return (
        <div className="space-y-2 text-gray-700">
          {Object.entries(content).map(([key, value]) => (
            <div key={key}>
              <h4 className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</h4>
              <p className="ml-4 whitespace-pre-wrap">{String(value)}</p>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-500 italic">Unsupported content type.</p>;
  };

  return (
    <section className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {renderContent()}
    </section>
  );
}

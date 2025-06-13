'use client';
import { useState } from 'react';
import Section from './pages/components/section';

type ResultContent = string | Record<string, string> | string[];

export default function Home() {
  const [requirements, setRequirements] = useState('');
  const [results, setResults] = useState<{
    understanding: ResultContent;
    validation: ResultContent;
    suggestions: ResultContent;
    brief?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResults({
      understanding: '',
      validation: '',
      suggestions: '',
      brief: '',
    });

    const res = await fetch('/api/requirementAgent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: requirements }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Preserve any partial line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.step && parsed.content) {
              // Remove any ```json or ``` markers
              let cleanedContent = parsed.content;
              if (typeof cleanedContent === 'string') {
                cleanedContent = cleanedContent.replace(/```[\w]*\n?|```/g, '').trim();
              }

              setResults((prev) => ({
                ...prev!,
                [parsed.step]: cleanedContent,
              }));
            } else {
              console.warn('Unexpected format:', line);
            }
          } catch (err) {
            console.warn('Non-JSON or malformed line skipped:', line);
          }
        }
      }
    }

    setLoading(false);
  };

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📋 Product Requirement Review Agent
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <textarea
            className="w-full h-44 p-4 border border-gray-300 text-black rounded-lg font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your product requirements here..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button
              onClick={(e) => {
                createRipple(e);
                handleRun();
              }}
              disabled={loading}
              className={`relative overflow-hidden px-6 py-2 text-white rounded-lg transition ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Analyzing Requirements...' : 'Run Analysis'}
            </button>
            <span className="text-sm text-gray-500 italic self-center">
              Powered by Gemma 3 12B via LM Studio
            </span>
          </div>
        </div>

        {results && (
          <>
            {results.brief && (
              <Section title="📄 Project Brief" content={results.brief} />
            )}
            <Section
              title="🧐 Step 1: Understanding"
              content={results.understanding || 'Analyzing requirement intent...'}
            />
            <Section
              title="✅ Step 2: Completeness & Consistency"
              content={results.validation || 'Checking requirement quality...'}
            />
            <Section
              title="💡 Step 3: Suggestions"
              content={results.suggestions || 'Generating improvements...'}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 600ms linear;
          background-color: rgba(255, 255, 255, 0.7);
          pointer-events: none;
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

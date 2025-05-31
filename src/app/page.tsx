'use client';
import { useState } from 'react';
import Section from './pages/components/section';

export default function Home() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState<{
    review: string;
    refactored: string;
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResults({ review: '', refactored: '', explanation: '' });

    const res = await fetch('/api/codeAgent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep any partial line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const { step, content } = JSON.parse(line);
          setResults((prev) => ({
            ...prev!,
            [step]: content,
          }));
        } catch (err) {
          console.error('Failed to parse stream line:', line);
        }
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🧠 Code Critic Agent
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <textarea
            className="w-full h-44 p-4 border border-gray-300 text-black rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button
              onClick={handleRun}
              disabled={loading}
              className={`px-6 py-2 text-white rounded-lg transition ${loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Running Agents...' : 'Run Full Review'}
            </button>
            <span className="text-sm text-gray-500 italic self-center">
              Powered by Mistral 7B via LM Studio
            </span>
          </div>
        </div>

        {results && (
          <>
            <Section
              title="🔍 Step 1: Review"
              content={results.review || 'Analyzing code for review...'}
            />
            <Section
              title="🛠 Step 2: Refactored Code"
              content={results.refactored || 'Refactoring in progress...'}
              code
            />
            <Section
              title="💬 Step 3: Explanation"
              content={results.explanation || 'Explaining refactored code...'}
            />
          </>
        )}
      </div>
    </main>
  );
}

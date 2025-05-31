import React, { useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type SectionProps = {
  title: string;
  content: string;
  code?: boolean;
  language?: string;
};

const Section: React.FC<SectionProps> = ({
  title,
  content,
  code = false,
  language = 'javascript',
}) => {
  const rippleRef = useRef<HTMLDivElement>(null);

  const createRipple = (event: React.MouseEvent) => {
    const button = rippleRef.current;
    if (!button) return;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  return (
    <section
      ref={rippleRef}
      onClick={createRipple}
      className="relative overflow-hidden bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 cursor-pointer transition hover:shadow-xl"
      role="region"
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
    >
      <h2
        id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
        className="text-xl font-semibold text-gray-800 mb-4"
      >
        {title}
      </h2>

      {code ? (
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1.5rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            overflowX: 'auto',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
            backgroundColor: '#282c34',
          }}
          lineNumberStyle={{ color: '#6a737d', userSelect: 'none' }}
        >
          {content}
        </SyntaxHighlighter>
      ) : (
        <pre className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed">
          {content}
        </pre>
      )}
    </section>
  );
};

export default Section;

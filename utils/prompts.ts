export const reviewPrompt = (code: string) => `
Review this code as a senior software engineer:
\`\`\`
${code}
\`\`\`
Give a score out of 10 and briefly explain any issues (bugs, smells, anti-patterns) and improvements.
`;

export const refactorPrompt = (code: string) => `
Refactor this code for better readability, performance, and maintainability. Output only the improved code:
\`\`\`
${code}
\`\`\`
`;

export const explainPrompt = (code: string) => `
Explain this code simply for a junior developer in clear, friendly language:
\`\`\`
${code}
\`\`\`
`;

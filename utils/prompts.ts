export const reviewPrompt = (code: string) => `
You are a senior software engineer. Carefully review the following code:
\`\`\`
${code}
\`\`\`
Give it a score out of 10 and explain any potential issues (bugs, smells, anti-patterns, etc). Provide suggestions for improvement.
`;

export const refactorPrompt = (code: string) => `
You are an expert developer. Refactor the following code to improve readability, performance, and maintainability:
\`\`\`
${code}
\`\`\`
Output only the improved code.
`;

export const explainPrompt = (code: string) => `
You are a helpful mentor. Explain what the following code does in simple terms for a junior developer:
\`\`\`
${code}
\`\`\`
Use clear, friendly language.
`;

import { NextRequest } from 'next/server';
import axios from 'axios';

const lmClient = axios.create({
  baseURL: 'http://localhost:1234/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 0,
});

const MODEL = 'google/gemma-3-12b';

function generatePrompt(input: string) {
  return `You are a product requirement review assistant.

Based on the following input, return a JSON object with the following fields:
- "brief": A clear one-paragraph project brief.
- "understanding": A high-level summary of what the requirement intends to accomplish.
- "validation": An evaluation of completeness and consistency.
- "suggestions": Any suggestions to improve or clarify the requirement.

Return only a valid JSON object. Do not include any extra commentary or markdown.

Requirement:
"""
${input}
"""

JSON:
`;
}

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await lmClient.post('/completions', {
          model: MODEL,
          prompt: generatePrompt(idea),
          temperature: 0.7,
          max_tokens: 500,
        });

        const text = res.data.choices?.[0]?.text.trim() || '{}';
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 'error',
                content: 'Failed to parse model response as JSON.',
              }) + '\n'
            )
          );
          controller.close();
          return;
        }

        for (const [step, content] of Object.entries(parsed)) {
          controller.enqueue(
            encoder.encode(JSON.stringify({ step, content }) + '\n')
          );
        }

        controller.close();
      } catch (error: any) {
        const errText =
          error?.response?.data || error?.message || 'Unknown error occurred.';
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ step: 'error', content: errText }) + '\n'
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  });
}

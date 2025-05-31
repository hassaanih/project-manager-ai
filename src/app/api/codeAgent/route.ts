import { NextRequest } from 'next/server';
import { reviewPrompt, refactorPrompt, explainPrompt } from '../../../../utils/prompts';
import axios from 'axios';

const lmClient = axios.create({
  baseURL: 'http://localhost:1234/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 0, // 2 minutes
});

const MODEL = 'llama-3.2-1b-instruct';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (label: string, content: string) => {
        controller.enqueue(encoder.encode(JSON.stringify({ step: label, content }) + '\n'));
      };

      try {
        console.time('Review & Refactor');

        // Run REVIEW and REFACTOR in parallel
        const [reviewRes, refactorRes] = await Promise.all([
          lmClient.post('/completions', {
            model: MODEL,
            prompt: reviewPrompt(code),
            temperature: 0.7,
            max_tokens: 256,
          }),
          lmClient.post('/completions', {
            model: MODEL,
            prompt: refactorPrompt(code),
            temperature: 0.7,
            max_tokens: 256,
          }),
        ]);

        console.timeEnd('Review & Refactor');

        const review = reviewRes.data.choices?.[0]?.text.trim() || '';
        const refactored = refactorRes.data.choices?.[0]?.text.trim() || '';

        write('review', review);
        write('refactored', refactored);

        // Run EXPLAIN only after refactor is done
        console.time('Explain');
        const explainRes = await lmClient.post('/completions', {
          model: MODEL,
          prompt: explainPrompt(refactored),
          temperature: 0.7,
          max_tokens: 256,
        });
        console.timeEnd('Explain');

        const explanation = explainRes.data.choices?.[0]?.text.trim() || '';
        write('explanation', explanation);

        controller.close();
      } catch (error: any) {
        write('error', error?.response?.data || error.message || 'Unknown error');
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  });
}

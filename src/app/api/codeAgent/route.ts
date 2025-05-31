import { NextRequest } from 'next/server';
import { reviewPrompt, refactorPrompt, explainPrompt } from '../../../../utils/prompts';
import axios from 'axios';

const lmClient = axios.create({
  baseURL: 'http://localhost:1234/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 300000, // 5 minutes
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
        // REVIEW
        const reviewRes = await lmClient.post('/completions', {
          model: MODEL,
          prompt: reviewPrompt(code),
          temperature: 0.7,
          max_tokens: 512,
        });
        const review = reviewRes.data.choices?.[0]?.text.trim() || '';
        write('review', review);

        // REFACTOR
        const refactorRes = await lmClient.post('/completions', {
          model: MODEL,
          prompt: refactorPrompt(code),
          temperature: 0.7,
          max_tokens: 512,
        });
        const refactored = refactorRes.data.choices?.[0]?.text.trim() || '';
        write('refactored', refactored);

        // EXPLAIN
        const explainRes = await lmClient.post('/completions', {
          model: MODEL,
          prompt: explainPrompt(refactored),
          temperature: 0.7,
          max_tokens: 512,
        });
        const explanation = explainRes.data.choices?.[0]?.text.trim() || '';
        write('explanation', explanation);

        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(JSON.stringify({
          step: 'error',
          content: error?.response?.data || error.message || 'Unknown error',
        }) + '\n'));
        controller.close();
      }
    }
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

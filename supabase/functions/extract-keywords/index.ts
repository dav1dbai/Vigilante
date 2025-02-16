import "jsr:@std/dotenv/load";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";
import Groq from "npm:groq-sdk";

const PROMPT = `
Your role is to extract the most important keywords from each tweet.

Focus on nouns, verbs, and named entities.

The goal is to capture what the tweet is primarily about in a few keywords. 

## Examples

1. Tweet: "Excited to announce our new AI tool that simplifies content creation! 🚀 #AI #Productivity"
   AI,tool,content creation,productivity

2. Tweet: "Just finished an amazing workout at the new gym downtown. Feeling strong! 💪 #Fitness #Health"
   workout,gym,downtown,fitness,health

3. Tweet: "BREAKING: Launching our free course on Python programming for beginners! Sign up now. 🐍 #Python #Coding"
   programming,free course,beginners,python,coding

4. Tweet: "Apple just announced the new iPhone 15 with better battery life and an updated camera. 📱 #AppleEvent #Tech"
   Apple,iPhone 15,battery life,updated camera,Apple event,tech

5. Tweet: "Attended the Web3 summit today—exciting discussions on decentralized finance and the future of crypto. 🌐 #Web3 #Crypto"
   web3 summit,decentralized finance,future of crypto,web3,crypto


Separate keywords by commas. Only respond with one line.
`;

const groqClient = new Groq({
  apiKey: Deno.env.get("GROQ_API_KEY")!,
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

Deno.serve(async (req) => {
  const { record } = await req.json();
  const { original_tweet_id: tweetId, text: tweetText } = record;

  if (!tweetText) {
    return new Response();
  }

  const chatCompletion = await groqClient.chat.completions.create({
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: tweetText },
    ],
    model: "gemma2-9b-it",
  });

  const content = chatCompletion.choices[0].message.content?.trim();
  const rawKeywords = content?.split(",") || [];

  const keywords = rawKeywords.map((v) => v.trim());

  await supabaseClient
    .from("keywords")
    .insert([{ original_tweet_id: tweetId, keywords }]);

  return new Response(JSON.stringify(keywords), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/extract-keywords' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

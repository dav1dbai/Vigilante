import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);

// Function to handle new tweet inserts
const handleTweetInsert = (payload) => {
  console.log('New tweet inserted!', payload)
}

// Subscribe to realtime INSERT events on the "tweets" table in the public schema.
const realtimeSubscription = supabaseClient
  .channel('tweets')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, handleTweetInsert)
  .subscribe()

export default realtimeSubscription;

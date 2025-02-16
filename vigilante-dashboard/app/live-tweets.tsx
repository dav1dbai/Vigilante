import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabaseClient } from "@/lib/supabase";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface Tweet {
  id: string;
  text: string;
  timestamp: number;
  is_misleading: boolean;
}

export default function LiveTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    const subscription = supabaseClient
      .channel("tweets-cascade")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "analyses" },
        async (payload) => {
          if (payload.new.is_misleading !== "misleading") return;

          const { data } = await supabaseClient
            .from("tweets")
            .select("original_tweet_id,text")
            .eq("original_tweet_id", payload.new.original_tweet_id)
            .limit(1)
            .single();

          console.log(data);

          const newTweet = {
            id: Math.random().toString(36).substr(2, 9), // Generate random ID for animation
            text: data?.text,
            timestamp: Date.now(),
            is_misleading: payload.new.is_misleading,
          };

          setTweets((prevTweets) => [newTweet, ...prevTweets].slice(0, 50)); // Keep last 50 tweets
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, []);

  return (
    <Card className="flex-1">
      <ScrollArea className="min-h-full">
        <CardHeader className="space-y-2">
          <CardTitle className="font-inter text-2xl text-black">
            Live Tweet Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {tweets.map((tweet, index) => {
              const age = Date.now() - tweet.timestamp;
              const maxAge = 300000;
              const ageRatio = Math.min(age / maxAge, 1);

              return (
                <motion.div
                  key={tweet.id}
                  initial={{ opacity: 0, x: -100, scale: 1.2 }}
                  animate={{ opacity: 1 - ageRatio * 0.7, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <div
                    className={"py-4"}
                    style={{
                      fontSize: `${Math.max(0.8, 1.2 - ageRatio * 0.4)}rem`,
                      opacity: Math.max(0.3, 1 - ageRatio * 0.7),
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-xs opacity-75">
                        {Math.floor(age / 1000)}s ago
                      </span>
                    </div>
                    {tweet.text}
                  </div>
                  <hr />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

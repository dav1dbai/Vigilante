import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabase";

interface Tweet {
  id: string;
  text: string;
  timestamp: number;
}

const TweetCascade: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    const subscription = supabaseClient
      .channel("tweets-cascade")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tweets" },
        (payload) => {
          console.log(payload);
          const newTweet = {
            id: Math.random().toString(36).substr(2, 9), // Generate random ID for animation
            text: payload.new.text,
            timestamp: Date.now(),
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
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-gray-900 to-transparent z-10">
        <h1 className="text-2xl font-bold text-center mt-4">
          Live Tweet Stream
        </h1>
      </div>

      <div className="h-full overflow-y-auto pt-20 pb-4 px-4">
        <AnimatePresence>
          {tweets.map((tweet) => {
            // Calculate size and opacity based on position
            const age = Date.now() - tweet.timestamp;
            const maxAge = 300000; // 5 minutes
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
                  className={`
                    bg-gradient-to-r from-blue-500 to-indigo-600 
                    rounded-lg p-4 shadow-lg transform transition-all duration-500
                    hover:scale-105 cursor-pointer
                  `}
                  style={{
                    fontSize: `${Math.max(0.8, 1.2 - ageRatio * 0.4)}rem`,
                    maxWidth: `${Math.max(40, 80 - ageRatio * 40)}%`,
                    opacity: Math.max(0.3, 1 - ageRatio * 0.7),
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs opacity-75">
                      {Math.floor(age / 1000)}s ago
                    </span>
                  </div>
                  {tweet.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TweetCascade;

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabaseClient } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Tweet {
  id: string;
  text: string;
  timestamp: number;
  is_misleading: boolean;
}

export default function LiveTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLiveVisible, setIsLiveVisible] = useState(true);

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

          const newTweet = {
            id: Math.random().toString(36).substr(2, 9),
            text: data?.text,
            timestamp: Date.now(),
            is_misleading: payload.new.is_misleading,
          };

          setTweets((prevTweets) => [newTweet, ...prevTweets].slice(0, 50));
        }
      )
      .subscribe();

    const liveInterval = setInterval(() => {
      setIsLiveVisible((v) => !v);
    }, 3000);

    return () => {
      supabaseClient.removeChannel(subscription);
      clearInterval(liveInterval);
    };
  }, []);

  return (
    <div className="container mx-auto py-0">
      <div className="border border-[#E2E8F0] rounded-2xl p-6 bg-white">
        <div className="grid lg:grid-cols-[170px,1fr] gap-0">
          {/* Left panel */}
          <div className="rounded-2xl overflow-hidden">
            <div
              className="w-full h-[350px] relative p-2"
              style={{
                background: "linear-gradient(135deg, #DB4E66 0%, #A24688 40%, #4E3ABA 100%)",
              }}
            >
              <div className="absolute bottom-6 left-4">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-white">Monitor</h2>
                    <div className="flex items-center gap-1 ml-1.5">
                      <div
                        className={cn(
                          "w-1 h-1 rounded-full bg-[#74FF41] transition-opacity duration-1000",
                          isLiveVisible ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-[#74FF41] font-medium text-[10px]">LIVE</span>
                    </div>
                  </div>
                  <p className="text-base font-light text-white/90">Flagged Tweets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <Card className="flex-1 shadow-none border-none">
            <ScrollArea className="h-[350px] no-scrollbar">
              <CardContent>
                <AnimatePresence>
                  {tweets.map((tweet) => {
                    const age = Date.now() - tweet.timestamp;

                    return (
                      <motion.div
                        key={tweet.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6 last:mb-0"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                              <span className="text-xs text-[#64748B]">
                                {Math.floor(age / 1000)}s ago
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#EBB039]" />
                              <span className="text-[#EBB039] font-medium text-sm">
                                Flagged
                              </span>
                            </div>
                          </div>
                          <p className="text-[#64748B] text-sm">
                            {tweet.text}
                          </p>
                        </div>
                        <hr className="mt-4 border-[#E2E8F0]" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Keyword from "@/lib/types/Keyword";
import { useAsync } from "react-use";
import generateTopThreeKeywords from "./api/generate-top-three-keywords";

export default function MostMisinformedTopics({
  keywords,
}: {
  keywords: Keyword[];
}) {
  const { value, loading } = useAsync(
    () => generateTopThreeKeywords(keywords),
    []
  );

  return (
    <Card className="w-full max-w-3xl flex-1 max-h-[300px] overflow-hidden">
      <ScrollArea className="pb-[100px] max-h-full no-scrollbar">
        <CardHeader className="space-y-2">
          <CardTitle className="font-inter text-2xl text-black">
            Most Misinformed Topics
          </CardTitle>
          <p className="text-md text-muted-foreground">
            Summaries of the three most misinformed topics on X in the past 12
            hours.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {value &&
            value.map((v, i) => (
              <div key={i} className="border-b-0">
                <h3 className="font-inter text-lg font-bold text-left">
                  {v.keyword}
                </h3>
                <p className="text-[#64748B] pt-2 text-sm">{v.summary}</p>
              </div>
            ))}

          {loading && !value && (
            <>
              <div>
                <div className="w-full">
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
              <div>
                <div className="w-full">
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
              <div>
                <div className="w-full">
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

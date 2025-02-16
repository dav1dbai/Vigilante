import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: {
    topic: string;
    flaggedTweets: number;
  }[];
}

export default function DataTable({ data }: DataTableProps) {
  return (
    <div className="border border-gray-700 rounded-lg">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Topic</TableHead>
              <TableHead className="text-right">Flagged Tweets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.topic}</TableCell>
                <TableCell className="text-right">
                  {row.flaggedTweets}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

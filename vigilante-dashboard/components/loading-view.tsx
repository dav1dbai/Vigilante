import { LoaderCircle } from "lucide-react";

export default function LoadingView({ text }: { text?: string }) {
  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="flex items-center flex-col gap-4">
        <LoaderCircle className="size-24 animate-spin" />
        {text && <p>{text}</p>}
      </div>
    </div>
  );
}

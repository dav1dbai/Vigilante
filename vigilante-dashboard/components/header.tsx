import Image from "next/image";
import Logo from "../public/logo.svg";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="">
      <div className="mx-auto flex h-32 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="relative size-16 rounded-xl mr-4 overflow-hidden">
            <Image alt="Logo" src={Logo} fill />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-semibold tracking-tight">Vigilante</h1>
            <p className="text-lg text-muted-foreground">
              Flag Misinformation. Preserve Truth.
            </p>
          </div>
        </div>
        <Link target="_blank" href="https://github.com/dav1dbai/Vigilante">
          <Button variant="default" className="text-white">
            Chrome Extension
          </Button>
        </Link>
      </div>
    </header>
  );
}

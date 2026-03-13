import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavBar from "./clientComponents/Navbar";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Button variant="default" className="bg-gray-400">
          test
        </Button>
      </div>
    </>
  );
}

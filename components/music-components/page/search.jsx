"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Search() {
    const [query, setQuery] = useState("");
    const linkRef = useRef();
    const inpRef = useRef();
    const router = useRouter();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query) {
            router.push("/");
            return;
        };
        linkRef.current.click();
        inpRef.current.blur();
        setQuery("");
    };
    return (
        <>
        <Link href={"/music/search?q=" + query} ref={linkRef}></Link>
            <form onSubmit={handleSubmit} className="flex items-center relative z-10 ">
                <Button variant="ghost" type="submit" size="icon" className="absolute left-3 top-[10px] h-5 w-5 text-gray-400"><SearchIcon className=""/></Button>
                <Input ref={inpRef} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" type="search" className="w-[80%] h-10 bg-[#121212] py-3 border-0 pl-10 rounded-full" name="query" placeholder="Try Maharani.." />
               
            </form>
        </>
    )
}

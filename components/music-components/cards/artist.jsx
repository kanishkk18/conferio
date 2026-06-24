import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "../ui/button";

export default function ArtistCard({ image, name, id }) {
    return (

        <div className="group text-card-foreground rounded-lg hover:bg-[#1F1F1F] px-2.5 py-2 w-28 cursor-pointer border-none bg-transparent transition-shadow duration-200 hover:shadow-md sm:w-36 sm:border-solid md:w-48">
        <Link href={"/music/search?q=" + `${encodeURI(name.toLowerCase().split(" ").join("+"))}` + "&type=artist"}>
            <div className="flex relative justify-center items-center">
                <img src={image} alt={name} className=" cursor-pointer rounded-full h-[160px] animate-[shadow-drop-2-center_0.4s_cubic-bezier(0.25,0.46,0.45,0.94)_both] min-w-[160px] object-cover"/>
                <Button size="icon" className="absolute right-2 bottom-2 text-white rounded-full bg-blue-600 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </Button>
            </div>
            <div className="mt-1 text-start">
                <h1 className="text-md font-semibold text-ellipsis text-nowrap overflow-hidden">{name.split(" ")[0] || null} {name.split(" ")[1] || null}</h1>
            </div>
        </Link>
        </div>
    )
}

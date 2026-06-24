import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getImageSrc } from "@/lib/music/jiosaavn";

type Episode = {
  id: string;
  title: string;
  image: { quality: string; url: string }[];
  download_url?: { quality: string; url: string }[];
};

export default function ShowPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const [show, setShow] = useState<any>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/music/data?resource=show&token=${id}`).then((r) => r.json()),
      fetch(`/api/music/data?resource=show-episodes&id=${id}`).then((r) => r.json()),
    ])
      .then(([showData, episodeData]) => {
        setShow(showData);
        setEpisodes(Array.isArray(episodeData) ? episodeData : episodeData.episodes ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-6">Loading...</div>;
  if (!show) return <div className="container py-6">Show not found</div>;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex gap-6 items-end">
        <img
          src={getImageSrc(show.image, "high")}
          alt={show.title ?? show.name}
          className="w-48 h-48 rounded-lg object-cover shadow-lg"
        />
        <div>
          <p className="text-sm text-muted-foreground uppercase">Podcast</p>
          <h1 className="text-4xl font-bold">{show.title ?? show.name}</h1>
        </div>
      </div>

      <div className="divide-y">
        {episodes.map((ep) => (
          <div key={ep.id} className="flex items-center gap-4 py-2">
            <img
              src={getImageSrc(ep.image, "low")}
              alt={ep.title}
              className="h-10 w-10 rounded object-cover"
            />
            <p className="text-sm font-medium flex-1">{ep.title}</p>
            {ep.download_url?.length ? (
              <audio controls src={ep.download_url[ep.download_url.length - 1].url} className="h-8" />
            ) : null}
          </div>
        ))}
        {episodes.length === 0 && (
          <p className="text-muted-foreground py-4">No episodes found</p>
        )}
      </div>
    </div>
  );
}

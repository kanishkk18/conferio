import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getSongsById } from "../../../lib/fetch";
import Player from "./_components/Player"; // adjust path if needed
import Search from "../../../components/music-components/page/search"; // optional
import AdvanceSearch from "./_components/AdvanceSearch"; // if needed
import Recomandation from "./_components/Recomandation";

export default function SongPage() {
  const router = useRouter();
  const { id } = router.query;

  const [songData, setSongData] = useState(null);

  useEffect(() => {
    if (id) {
      getSongsById(id)
        .then(res => res.json())
        .then(data => setSongData(data))
        .catch(err => console.error(err));
    }
  }, [id]);

  if (!id || !songData) return <div>Loading&hellip;</div>;

  return (
    <>
      <Head>
        <title>{songData?.data?.[0]?.name || "Song"}</title>
        <meta name="description" content={`Now playing: ${songData?.data?.[0]?.name}`} />
      </Head>

      <div>
        {/* <div className="px-6 ">
          <Search />
        </div> */}
        {/* <AdvanceSearch /> */}
        <Player id={id} />
        {/* <Recomandation id={id} /> */}
      </div>
    </>
  );
}

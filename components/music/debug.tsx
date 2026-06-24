/**
 * DEBUG PAGE — visit /music/debug in your browser
 * Prints the raw shape of a song + home data so we can see
 * exactly what download_url / image look like at runtime.
 * DELETE this file once music is playing correctly.
 */
import { useEffect, useState } from "react";

export default function MusicDebugPage() {
  const [songData, setSongData] = useState<any>(null);
  const [homeData, setHomeData] = useState<any>(null);
  const [trendingData, setTrendingData] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // 1. Fetch a known song ID
    fetch("/api/music/data?resource=song&id=6r5d1x0b")
      .then((r) => r.json())
      .then(setSongData)
      .catch((e) => setErrors((p) => [...p, `song: ${e.message}`]));

    // 2. Fetch home data (to see what image shape modules return)
    fetch("/api/music/data?resource=home")
      .then((r) => r.json())
      .then(setHomeData)
      .catch((e) => setErrors((p) => [...p, `home: ${e.message}`]));

    // 3. Fetch trending
    fetch("/api/music/data?resource=trending&type=song")
      .then((r) => r.json())
      .then(setTrendingData)
      .catch((e) => setErrors((p) => [...p, `trending: ${e.message}`]));
  }, []);

  const firstSong = songData?.songs?.[0];
  const firstTrendingSong = trendingData?.song?.[0];

  return (
    <div style={{ fontFamily: "monospace", padding: 24, fontSize: 13 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>🎵 Music Debug</h1>

      {errors.length > 0 && (
        <div style={{ color: "red", marginBottom: 16 }}>
          <b>Errors:</b>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {/* ── Song shape ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Song API shape (id=6r5d1x0b)</h2>
        {!songData && <p>Loading...</p>}
        {firstSong && (
          <>
            <p><b>download_url type:</b> {typeof firstSong.download_url}</p>
            <p><b>download_url isArray:</b> {String(Array.isArray(firstSong.download_url))}</p>
            <p><b>download_url value:</b></p>
            <pre style={{ background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
              {JSON.stringify(firstSong.download_url, null, 2)}
            </pre>
            <p><b>image type:</b> {typeof firstSong.image}</p>
            <p><b>image isArray:</b> {String(Array.isArray(firstSong.image))}</p>
            <pre style={{ background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
              {JSON.stringify(firstSong.image, null, 2)}
            </pre>

            {/* Try to play it right here */}
            <p style={{ marginTop: 16 }}><b>Try playing raw URL:</b></p>
            {Array.isArray(firstSong.download_url) ? (
              firstSong.download_url.map((q: any, i: number) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p>Quality: {q.quality}</p>
                  <audio controls src={q.url} style={{ width: "100%" }} />
                </div>
              ))
            ) : typeof firstSong.download_url === "string" ? (
              <audio controls src={firstSong.download_url} style={{ width: "100%" }} />
            ) : (
              <p style={{ color: "red" }}>Unknown download_url shape — cannot play</p>
            )}
          </>
        )}
      </section>

      {/* ── Trending song shape ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Trending song[0] shape</h2>
        {!trendingData && <p>Loading...</p>}
        {firstTrendingSong && (
          <>
            <p><b>download_url type:</b> {typeof firstTrendingSong.download_url}</p>
            <p><b>download_url isArray:</b> {String(Array.isArray(firstTrendingSong.download_url))}</p>
            <pre style={{ background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
              {JSON.stringify(firstTrendingSong.download_url, null, 2)}
            </pre>

            {Array.isArray(firstTrendingSong.download_url) ? (
              firstTrendingSong.download_url.map((q: any, i: number) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p>Quality: {q.quality}</p>
                  <audio controls src={q.url} style={{ width: "100%" }} />
                </div>
              ))
            ) : typeof firstTrendingSong.download_url === "string" ? (
              <audio controls src={firstTrendingSong.download_url} style={{ width: "100%" }} />
            ) : (
              <p style={{ color: "orange" }}>download_url is: {JSON.stringify(firstTrendingSong.download_url)}</p>
            )}
          </>
        )}
      </section>

      {/* ── Raw JSON dumps ── */}
      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Full song[0] object</h2>
        <pre style={{ background: "#111", color: "#0f0", padding: 12, overflowX: "auto", maxHeight: 400 }}>
          {JSON.stringify(firstSong, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Home data keys</h2>
        <pre style={{ background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
          {JSON.stringify(Object.keys(homeData ?? {}), null, 2)}
        </pre>
      </section>
    </div>
  );
}
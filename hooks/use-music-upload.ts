import { useState, useCallback } from "react";

export function useMusicUpload() {
  const [status, setStatus] = useState<"idle" | "getting-url" | "uploading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();

  const uploadTrack = useCallback(async (file: File, metadata: any) => {
    setStatus("getting-url"); setProgress(10);
    try {
      const urlRes = await fetch("/api/music/upload-url", {
        method: "POST",
        credentials: "include", 
         headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key, publicUrl } = await urlRes.json();

      setStatus("uploading"); setProgress(30);
      const uploadRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!uploadRes.ok) throw new Error("Upload failed");

      setStatus("processing"); setProgress(70);
      const trackRes = await fetch("/api/music/tracks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...metadata, audioUrl: publicUrl, audioKey: key, originalName: file.name, mimeType: file.type, size: file.size }),
      });
      if (!trackRes.ok) throw new Error("Failed to save track");

      setStatus("done"); setProgress(100);
      return await trackRes.json();
    } catch (e: any) {
      setStatus("error"); setError(e.message); throw e;
    }
  }, []);

  const reset = useCallback(() => { setStatus("idle"); setProgress(0); setError(undefined); }, []);

  return { uploadState: { status, progress, error }, uploadTrack, resetUpload: reset };
}

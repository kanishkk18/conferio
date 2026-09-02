// components/file-manager/AttachExistingFileModal.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LinkType = "CHANNEL" | "MESSAGE" | "PAGE" | "NOTE" | "TASK";

export function AttachExistingFileModal({
  open, onOpenChange, teamId, linkType, contextId, onAttached,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teamId?: string;
  linkType: LinkType;
  contextId: string;
  onAttached: () => void;
}) {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["driveBrowse", teamId],
    queryFn: async () => {
      const queryParam = teamId ? `teamId=${teamId}&` : "";
      const res = await fetch(`/api/files/all?${queryParam}visibility=all&pageSize=100&pageNumber=1`);
      if (!res.ok) return { files: [] };
      return res.json();
    },
    enabled: open,
  });

  const attach = async (fileId: string) => {
    await fetch(`/api/files/${fileId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: linkType, contextId }),
    });
    onAttached();
    onOpenChange(false);
  };

  const files = (data?.files ?? []).filter((f: any) =>
    !search || f.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Attach from Drive</DialogTitle></DialogHeader>
        <Input placeholder="Search files…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="max-h-72 overflow-y-auto space-y-1 mt-2">
          {files.map((f: any) => (
            <button
              key={f.id}
              type="button"
              onClick={() => attach(f.id)}
              className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm"
            >
              <span className="truncate">{f.originalName}</span>
              <Button size="sm" variant="ghost">Attach</Button>
            </button>
          ))}
          {files.length === 0 && (
            <p className="text-center text-zinc-500 text-sm py-6">No files found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import React from "react";

import { useSocket } from "@/components/chat-components/providers/socket-provider";
import { Badge } from "@/components/ui/badge";

export function SocketIndicatior() {
  const { isConnected } = useSocket();

  if (!isConnected)
    return (
      <div className="bg-yellow-600 absolute h-1.5 w-1.5 rounded-full text-white border-none"
      >
      </div>
    );

  return (
    <div className="bg-emerald-600 mt-4 absolute ml-3.5 h-1.5 w-1.5 text-white rounded-full border-none"
    >
    </div>
  );
}

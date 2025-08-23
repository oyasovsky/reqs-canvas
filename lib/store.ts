"use client";
import { create } from "zustand";
import type { BR, GraphPayload } from "@/lib/types";
import { buildGraphPayload } from "@/lib/graph";

type ChatMsg = { role: "user" | "assistant"; text: string };

interface AppState {
  currentSrtId: string | null;
  brs: BR[];
  graph: GraphPayload;
  chat: ChatMsg[];
  createdItems: { type: string; id: string; ref: string }[];
  selectedBrId: string | null;
  setSrt: (id: string, brs: BR[]) => void;
  setBrs: (brs: BR[]) => void;
  setGraph: (graph: GraphPayload) => void;
  addChat: (m: ChatMsg) => void;
  setCreatedItems: (items: { type: string; id: string; ref: string }[]) => void;
  selectBr: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSrtId: null,
  brs: [],
  graph: { nodes: [], edges: [] },
  chat: [],
  createdItems: [],
  selectedBrId: null,
  setSrt: (id, brs) =>
    set({
      currentSrtId: id,
      brs,
      graph: { nodes: [], edges: [] }, // Initialize empty, will be built by Canvas
      selectedBrId: brs[0]?.br_id ?? null
    }),
  setBrs: (brs) => set({ brs, graph: { nodes: [], edges: [] } }),
  setGraph: (graph) => set({ graph }),
  addChat: (m) => set({ chat: [...get().chat, m] }),
  setCreatedItems: (items) => set({ createdItems: items }),
  selectBr: (id) => set({ selectedBrId: id })
}));

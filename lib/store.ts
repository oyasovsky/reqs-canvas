"use client";
import { create } from "zustand";
import type { BR, GraphPayload } from "@/lib/types";
import { buildGraphPayload } from "@/lib/graph";

type ChatMsg = { role: "user" | "assistant"; text: string };

type GraphView = 'hierarchy' | 'dependencies';

interface AppStore {
  currentSrtId: string | null;
  brs: BR[];
  selectedBrId: string | null;
  createdItems: any[];
  graphView: 'hierarchy' | 'dependencies';
  isGraphMaximized: boolean;
  isCanvasCollapsed: boolean;
  setSrt: (srtId: string, brs: BR[]) => void;
  setBrs: (brs: BR[]) => void;
  selectBr: (brId: string | null) => void;
  setCreatedItems: (items: any[]) => void;
  setGraphView: (view: 'hierarchy' | 'dependencies') => void;
  toggleGraphMaximized: () => void;
  toggleCanvasCollapsed: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentSrtId: null,
  brs: [],
  createdItems: [],
  selectedBrId: null,
  graphView: 'hierarchy',
  isGraphMaximized: false,
  isCanvasCollapsed: true,
  setSrt: (id, brs) =>
    set({
      currentSrtId: id,
      brs,
      selectedBrId: null
    }),
  setBrs: (brs) => set({ brs }),
  setCreatedItems: (items) => set({ createdItems: items }),
  selectBr: (id) => set({ selectedBrId: id }),
  setGraphView: (view) => set({ graphView: view }),
  toggleGraphMaximized: () => set({ isGraphMaximized: !get().isGraphMaximized }),
  toggleCanvasCollapsed: () => set({ isCanvasCollapsed: !get().isCanvasCollapsed })
}));

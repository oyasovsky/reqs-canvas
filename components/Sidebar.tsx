"use client";
import React, { useEffect, useState } from "react";
import srts from "@/data/srts.json";
import { useAppStore } from "@/lib/store";
import type { BR } from "@/lib/types";

export default function Sidebar() {
  const { setSrt, brs, selectBr, selectedBrId } = useAppStore();
  const [srtId, setSrtId] = useState((srts as any).srts[0]?.srt_id as string || "");

  useEffect(() => {
    if (srtId) {
      async function load() {
        try {
          const res = await fetch("/api/parse", { method: "POST", body: JSON.stringify({ srtId }) });
          if (res.ok) {
            const data = await res.json();
            setSrt(srtId, data.brs as BR[]);
          }
        } catch (error) {
          console.error("Error loading SRT:", error);
        }
      }
      load();
    }
  }, [srtId, setSrt]);

  if (!(srts as any).srts || (srts as any).srts.length === 0) {
    return (
      <aside className="card p-3 overflow-auto">
        <div className="text-gray-500">No SRTs available</div>
      </aside>
    );
  }

  return (
    <aside className="card p-3 overflow-auto">
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-500">SRT</label>
        <select
          className="input mt-1"
          value={srtId}
          onChange={(e) => setSrtId(e.target.value)}
        >
          {(srts as any).srts.map((s: any) => (
            <option key={s.srt_id} value={s.srt_id}>{s.srt_id} — {s.title}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-500 mb-1">Business Requirements</div>
        {brs.length === 0 ? (
          <div className="text-gray-400 text-sm">Select an SRT to view BRs</div>
        ) : (
          brs.map((b) => (
            <button
              key={b.br_id}
              onClick={() => selectBr(b.br_id)}
              className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedBrId===b.br_id?"bg-gray-100":""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{b.br_id}: {b.title}</span>
                <span className="badge">{b.checklist.acceptance_criteria}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

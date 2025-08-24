"use client";
import React, { useEffect, useState } from "react";
import srts from "@/data/srts.json";
import { useAppStore } from "@/lib/store";
import type { BR } from "@/lib/types";
import { mockFetch } from "@/lib/mockData";

export default function Sidebar() {
  const { setSrt, brs, selectBr, selectedBrId } = useAppStore();
  const [srtId, setSrtId] = useState((srts as any).srts[0]?.srt_id as string || "");

  useEffect(() => {
    if (srtId) {
      async function load() {
        try {
          const res = await mockFetch("/api/parse", { method: "POST", body: JSON.stringify({ srtId }) });
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
      <aside className="card p-6 overflow-y-auto h-full">
        <div className="text-slate-500 text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          No SRTs available
        </div>
      </aside>
    );
  }

  return (
    <aside className="card p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <label className="text-sm font-semibold text-slate-700 mb-3 block">Solution Requirements Template</label>
        <select
          className="input"
          value={srtId}
          onChange={(e) => setSrtId(e.target.value)}
        >
          {(srts as any).srts.map((s: any) => (
            <option key={s.srt_id} value={s.srt_id}>{s.srt_id} — {s.title}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <button 
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200"
            onClick={() => selectBr(null)}
          >
            Business Requirements
          </button>
        </div>
        
        {brs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">Select an SRT to view BRs</p>
          </div>
        ) : (
          brs.map((b) => (
            <button
              key={b.br_id}
              onClick={() => selectBr(b.br_id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                selectedBrId === b.br_id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm'
                  : 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm mb-1 truncate">{b.br_id}</div>
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{b.title}</div>
                </div>
                <span className="badge ml-2 flex-shrink-0">{b.checklist.acceptance_criteria}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

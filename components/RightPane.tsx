"use client";
import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { BR } from "@/lib/types";
import { computeChecklist, computeMissingInfo } from "@/lib/checklist";
import { ConfirmModal } from "@/components/ConfirmModal";

interface EditableAppsListProps {
  apps: any[];
  onUpdate: (apps: any[]) => void;
}

const EditableAppsList = ({ apps, onUpdate }: EditableAppsListProps) => {
  const [newAppName, setNewAppName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddApp = () => {
    if (newAppName.trim()) {
      const newApp = {
        app: newAppName.trim(),
        reason: "Manual addition",
        confidence: "high"
      };
      onUpdate([...apps, newApp]);
      setNewAppName("");
      setIsAdding(false);
    }
  };

  const handleRemoveApp = (index: number) => {
    const updatedApps = apps.filter((_, i) => i !== index);
    onUpdate(updatedApps);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {apps.map((app, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-blue-100/80 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-200/50">
            <span>{app.app}</span>
            <button
              onClick={() => handleRemoveApp(idx)}
              className="ml-1 text-blue-600 hover:text-red-600 transition-colors duration-200"
              title="Remove app"
            >
              ×
            </button>
          </div>
        ))}
        {apps.length === 0 && (
          <div className="text-slate-500 text-sm py-2">No applications affected</div>
        )}
      </div>
      
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="Application name"
            className="input flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddApp()}
            autoFocus
          />
          <button
            onClick={handleAddApp}
            className="btn btn-primary text-xs px-3"
            disabled={!newAppName.trim()}
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewAppName("");
            }}
            className="btn btn-outline text-xs px-3"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="btn btn-outline text-xs px-3 py-1"
        >
          + Add App
        </button>
      )}
    </div>
  );
};

export default function RightPane() {
  const { brs, selectedBrId, setBrs, setCreatedItems, currentSrtId } = useAppStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const br = useMemo(() => brs.find(b => b.br_id === selectedBrId) || null, [brs, selectedBrId]);

  if (!br) return (
    <aside className="card p-6 overflow-y-auto h-full">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Business Requirement</h3>
        <p className="text-slate-500">Choose a BR from the sidebar to view details</p>
      </div>
    </aside>
  );

  function updateBr(mut: (b: BR) => BR) {
    if (!br) return; // Early return if br is null
    const updated = brs.map(b => {
      if (b.br_id !== br.br_id) return b;
      const nb = mut({ ...b });
      nb.checklist = computeChecklist(nb);
      nb.missing_info = computeMissingInfo(nb);
      return nb;
    });
    setBrs(updated);
  }

  async function draftAC() {
    if (!br) return;
    const res = await fetch("/api/draft-ac", {
      method: "POST",
      body: JSON.stringify({ srtId: currentSrtId, brId: br.br_id })
    });
    const data = await res.json();
    updateBr(b => ({
      ...b,
      features: b.features.map((f, i) => (i === 0 ? { ...f, acceptance_criteria: data.acceptance_criteria } : f))
    }));
  }

  async function draftNFRs() {
    if (!br) return;
    const res = await fetch("/api/draft-nfrs", {
      method: "POST",
      body: JSON.stringify({ srtId: currentSrtId, brId: br.br_id })
    });
    const data = await res.json();
    updateBr(b => ({
      ...b,
      features: b.features.map((f, i) => (i === 0 ? { ...f, nfrs: data.nfrs } : f))
    }));
  }

  async function suggestApps() {
    if (!br) return;
    const res = await fetch("/api/suggest-apps", {
      method: "POST",
      body: JSON.stringify({ srtId: currentSrtId, brId: br.br_id })
    });
    const data = await res.json();
    updateBr(b => ({ ...b, impacted_applications: data.impacted }));
  }

  async function suggestDeps() {
    if (!br) return;
    const apps = br.impacted_applications?.map(a => a.app);
    const res = await fetch("/api/suggest-deps", {
      method: "POST",
      body: JSON.stringify({ srtId: currentSrtId, brId: br.br_id, apps })
    });
    const data = await res.json();
    updateBr(b => ({ ...b, app_dependencies: data.dependencies }));
  }

  async function onConfirmCreate() {
    if (!br) return;
    try {
      setCreating(true);
      const res = await fetch("/api/create-ado", {
        method: "POST",
        body: JSON.stringify({ confirm: true, brId: br.br_id })
      });
      const data = await res.json();
      setCreatedItems(data.created || []);
    } finally {
      setCreating(false);
      setConfirmOpen(false);
    }
  }

  return (
    <aside className="card p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{br.br_id}</h3>
            <h4 className="text-base text-slate-700 font-medium mb-3">{br.title}</h4>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button className="btn btn-outline text-xs" onClick={suggestDeps}>Suggest Deps</button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{br.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-slate-700">Capabilities</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {br.capabilities.map((c, idx) => (<span key={idx} className="badge">{c}</span>))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-slate-700">Feature</h4>
        </div>
        {br.features && br.features.length > 0 ? (
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/30 rounded-xl p-4">
            <div className="font-semibold text-slate-800 mb-2">{br.features[0]?.title}</div>
            <div className="text-sm text-slate-600 mb-4 leading-relaxed">{br.features[0]?.description}</div>
            <div className="flex gap-2 mb-4">
              <button className="btn btn-outline text-xs" onClick={draftAC}>Draft AC</button>
              <button className="btn btn-outline text-xs" onClick={draftNFRs}>Draft NFRs</button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Acceptance Criteria</div>
                <ul className="space-y-1">
                  {(br.features[0]?.acceptance_criteria || []).map((a, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start space-x-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Non-Functional Requirements</div>
                <ul className="space-y-1">
                  {(br.features[0]?.nfrs || []).map((n, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start space-x-2">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><span className="font-medium">{n.category}:</span> {n.target}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">No features defined</div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-slate-700">Affected Applications</h4>
          </div>
          <div className="flex gap-1">
            <button 
              className="btn btn-outline text-xs px-2 py-1"
              onClick={suggestApps}
              title="Restore suggested apps"
            >
              Restore
            </button>
          </div>
        </div>
        <EditableAppsList 
          apps={br.impacted_applications || []}
          onUpdate={(apps) => updateBr(b => ({ ...b, impacted_applications: apps }))}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-slate-700">Checklist</h4>
        </div>
        <div className="bg-gradient-to-br from-slate-50/50 to-blue-50/50 border border-slate-200/50 rounded-xl p-4">
          <div className="space-y-2">
            {Object.entries(br.checklist || {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-slate-200/50 last:border-b-0">
                <span className="text-sm text-slate-600 font-medium">{k.replace(/_/g, ' ')}</span>
                <span className="text-lg">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-slate-700">Missing Information</h4>
        </div>
        {(br.missing_info || []).length > 0 ? (
          <div className="space-y-2">
            {(br.missing_info || []).map((m, idx) => (
              <div key={idx} className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200/50 rounded-lg p-3">
                <div className="font-medium text-amber-800 text-sm mb-1">{m.item}</div>
                <div className="text-xs text-amber-700">{m.prompt}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">All information complete</div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200/50">
        <button className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={creating}>
          {creating ? "Creating…" : "Create ADO Items"}
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`Create ADO items for ${br.br_id}?`}
        description="This will create mock BusinessRequirement, Epic, and Feature with IDs."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onConfirmCreate}
      />
    </aside>
  );
}

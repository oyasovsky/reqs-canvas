"use client";
import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { BR } from "@/lib/types";
import { computeChecklist, computeMissingInfo } from "@/lib/checklist";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function RightPane() {
  const { brs, selectedBrId, setBrs, setCreatedItems, currentSrtId } = useAppStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const br = useMemo(() => brs.find(b => b.br_id === selectedBrId) || null, [brs, selectedBrId]);

  if (!br) return <aside className="card p-3">Select a BR</aside>;

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
    <aside className="card p-3 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{br.br_id}: {br.title}</h3>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={suggestApps}>Suggest Apps</button>
          <button className="btn btn-outline" onClick={suggestDeps}>Suggest Deps</button>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-3">{br.description}</p>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Capabilities</div>
        <div className="flex flex-wrap gap-2">
          {br.capabilities.map((c, idx) => (<span key={idx} className="badge">{c}</span>))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Feature</div>
        {br.features && br.features.length > 0 ? (
          <div className="border rounded-lg p-2">
            <div className="font-medium">{br.features[0]?.title}</div>
            <div className="text-sm text-gray-600">{br.features[0]?.description}</div>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-outline" onClick={draftAC}>Draft Acceptance Criteria</button>
              <button className="btn btn-outline" onClick={draftNFRs}>Draft NFRs</button>
            </div>
            <div className="mt-2">
              <div className="text-xs font-semibold text-gray-500">Acceptance Criteria</div>
              <ul className="list-disc list-inside text-sm">
                {(br.features[0]?.acceptance_criteria || []).map((a, idx) => (<li key={idx}>{a}</li>))}
              </ul>
            </div>
            <div className="mt-2">
              <div className="text-xs font-semibold text-gray-500">NFRs</div>
              <ul className="list-disc list-inside text-sm">
                {(br.features[0]?.nfrs || []).map((n, idx) => (<li key={idx}>{n.category}: {n.target}</li>))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No features defined</div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Impacted Apps</div>
        <div className="flex flex-wrap gap-2">
          {(br.impacted_applications || []).map((a, idx) => (<span key={idx} className="badge">{a.app}</span>))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Checklist</div>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(br.checklist || {}).map(([k, v]) => (
              <tr key={k} className="border-t">
                <td className="py-1 pr-2 text-gray-500">{k}</td>
                <td className="py-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Missing Info</div>
        <ul className="list-disc list-inside text-sm">
          {(br.missing_info || []).map((m, idx) => (<li key={idx}><span className="font-medium">{m.item}</span>: {m.prompt}</li>))}
        </ul>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={creating}>
          {creating ? "Creating…" : "Create ADO items…"}
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

import type { BR, ChecklistStatus } from "@/lib/types";

const status = (ok: boolean): ChecklistStatus => (ok ? "✔️" : "❌");

export function computeChecklist(br: BR): BR["checklist"] {
  const title = status(Boolean(br.title?.trim()));
  const description = status(Boolean(br.description?.trim()));
  const capability_map = status(br.capabilities?.length > 0);
  const impacted_apps = status(br.impacted_applications?.length > 0);
  const typed_dependencies = status(br.app_dependencies?.length > 0);
  const hasAC = br.features?.some(f => f.acceptance_criteria?.length > 0);
  const acceptance_criteria = status(hasAC);
  const nfrs = status(br.features?.some(f => f.nfrs?.length > 0));
  const rac = status(
    (br.features?.some(f => f.risks?.length > 0) ||
      br.features?.some(f => f.assumptions?.length > 0) ||
      br.features?.some(f => f.constraints?.length > 0))
  );
  const owners = status(br.owners?.length > 0);

  return {
    title,
    description,
    capability_map,
    impacted_apps,
    typed_dependencies,
    acceptance_criteria,
    nfrs,
    risks_assumptions_constraints: rac,
    owners
  };
}

export function computeMissingInfo(br: BR): BR["missing_info"] {
  const ms: BR["missing_info"] = [];
  const cl = computeChecklist(br);
  if (cl.acceptance_criteria === "❌") ms.push({ item: "acceptance_criteria", prompt: `Draft AC for ${br.br_id}` });
  if (cl.nfrs === "❌") ms.push({ item: "nfrs", prompt: `Add NFRs (latency, availability, security) for ${br.br_id}` });
  if (cl.impacted_apps === "❌") ms.push({ item: "impacted_apps", prompt: `Suggest impacted applications for ${br.br_id}` });
  if (cl.typed_dependencies === "❌") ms.push({ item: "typed_dependencies", prompt: `Propose typed dependencies for ${br.br_id}` });
  if (cl.owners === "❌") ms.push({ item: "owners", prompt: `Assign TPM/SA for ${br.br_id}` });
  return ms;
}

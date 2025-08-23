import { describe, it, expect } from "vitest";
import { computeChecklist, computeMissingInfo } from "@/lib/checklist";
import type { BR } from "@/lib/types";

const emptyBR: BR = {
  br_id: "BR00",
  title: "Test",
  description: "",
  capabilities: [],
  features: [
    {
      feature_id: "F01",
      title: "T",
      description: "D",
      acceptance_criteria: [],
      nfrs: [],
      risks: [],
      assumptions: [],
      constraints: [],
      provenance: []
    }
  ],
  impacted_applications: [],
  app_dependencies: [],
  owners: [],
  checklist: {
    title: "❌",
    description: "❌",
    capability_map: "❌",
    impacted_apps: "❌",
    typed_dependencies: "❌",
    acceptance_criteria: "❌",
    nfrs: "❌",
    risks_assumptions_constraints: "❌",
    owners: "❌"
  },
  missing_info: []
};

describe("checklist", () => {
  it("computes missing items", () => {
    const cl = computeChecklist(emptyBR);
    expect(cl.acceptance_criteria).toBe("❌");
    const mi = computeMissingInfo(emptyBR);
    const items = mi.map(m => m.item);
    expect(items).toContain("acceptance_criteria");
    expect(items).toContain("nfrs");
    expect(items).toContain("impacted_apps");
  });
});

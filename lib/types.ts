export type ChecklistStatus = "✔️" | "⚠️" | "❌";
export type EdgeType = "API" | "Event" | "SharedDB" | "Batch" | "File" | "UI";

export interface Provenance { source: string; snippet: string; }
export interface ImpactedApp { app: string; reason: string; confidence: number; provenance: Provenance[]; }
export interface AppDependency { from: string; to: string; type: EdgeType; confidence: number; provenance: Provenance[]; }

export interface FeatureItem {
  feature_id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  nfrs: { category: string; target: string; notes?: string }[];
  risks: string[];
  assumptions: string[];
  constraints: string[];
  provenance: Provenance[];
}

export interface BR {
  br_id: string;
  title: string;
  description: string;
  capabilities: string[];
  features: FeatureItem[];
  impacted_applications: ImpactedApp[];
  app_dependencies: AppDependency[];
  owners: { role: "TPM" | "SA" | "PO" | "DevLead"; name: string }[];
  checklist: {
    title: ChecklistStatus;
    description: ChecklistStatus;
    capability_map: ChecklistStatus;
    impacted_apps: ChecklistStatus;
    typed_dependencies: ChecklistStatus;
    acceptance_criteria: ChecklistStatus;
    nfrs: ChecklistStatus;
    risks_assumptions_constraints: ChecklistStatus;
    owners: ChecklistStatus;
  };
  missing_info: { item: string; prompt: string }[];
}

export interface SRT {
  srt_id: string;
  title: string;
  scope: string;
  history: string;
  business_requirements: BR[];
}

export interface GraphNode {
  id: string;
  type: "SRT" | "BR" | "Application" | "Epic" | "FR";
  label: string;
  description?: string;
  position: { x: number; y: number };
  data?: {
    label: string;
    description?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "contains" | "decomposes" | "impacts" | EdgeType;
  label?: string;
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Store {
  srts: SRT[];
  selectedSRT: SRT | null;
  selectedBR: BR | null;
  graphData: GraphPayload | null;
  createdItems: any[];
  chatHistory: Array<{ text: string; response: string; timestamp: Date }>;
  loadSRTs: () => void;
  selectSRT: (srtId: string) => void;
  selectBR: (brId: string) => void;
  updateBR: (brId: string, data: any) => void;
  updateGraphData: (data: GraphPayload) => void;
  addCreatedItem: (item: any) => void;
  addChatMessage: (text: string, response: string) => void;
}

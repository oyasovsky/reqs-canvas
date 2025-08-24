// Mock data to replace API calls for static GitHub Pages deployment

export const mockResponses = {
  parse: {
    brs: [
      {
        br_id: "BR01",
        title: "Remove phone line from family account",
        description: "Customer requests line removal; may require prorated charges.",
        capabilities: ["Account Management", "Billing Operations"],
        features: [
          {
            feature_id: "F001",
            title: "Line Removal Workflow",
            description: "Remove phone line from family account with prorated billing",
            acceptance_criteria: [
              "User can select line to remove",
              "System calculates prorated charges", 
              "Line is deactivated immediately"
            ]
          }
        ],
        impacted_applications: [
          { app: "BillingSvc", reason: "Calculate prorated charges", confidence: 0.9 },
          { app: "AccountSvc", reason: "Update account structure", confidence: 0.9 }
        ],
        app_dependencies: [],
        owners: [],
        checklist: {
          title: "✔️",
          description: "✔️",
          capability_map: "✔️",
          impacted_apps: "✔️",
          typed_dependencies: "❌",
          acceptance_criteria: "✔️",
          nfrs: "⚠️",
          risks: "❌",
          assumptions: "❌",
          constraints: "❌",
          provenance: "✔️"
        },
        missing_info: []
      }
    ]
  },
  
  draftAC: {
    acceptance_criteria: [
      "User can select line to remove from family account",
      "System validates user authorization to make changes",
      "System calculates prorated charges for partial billing period",
      "User reviews and confirms removal with charges",
      "Line is immediately deactivated upon confirmation",
      "Account structure is updated to reflect removal",
      "Confirmation notification is sent to account owner"
    ]
  },
  
  draftNFRs: {
    nfrs: [
      { category: "Performance", target: "Response time < 2 seconds", notes: "Critical for customer experience" },
      { category: "Security", target: "Owner verification required", notes: "Prevent unauthorized changes" },
      { category: "Availability", target: "99.9% uptime", notes: "Service must be highly available" },
      { category: "Scalability", target: "Handle 1000 concurrent users", notes: "Peak usage periods" }
    ]
  },
  
  suggestApps: {
    suggested_apps: [
      { app: "BillingSvc", reason: "Calculate prorated charges and refunds", confidence: 0.95 },
      { app: "AccountSvc", reason: "Update family account structure", confidence: 0.9 },
      { app: "NotificationSvc", reason: "Send confirmation to account owner", confidence: 0.8 },
      { app: "AuthSvc", reason: "Verify user authorization", confidence: 0.85 }
    ]
  },
  
  suggestDeps: {
    dependencies: [
      { from: "AccountSvc", to: "BillingSvc", type: "API", confidence: 0.9 },
      { from: "AccountSvc", to: "NotificationSvc", type: "Event", confidence: 0.8 },
      { from: "BillingSvc", to: "AuthSvc", type: "API", confidence: 0.7 }
    ]
  },
  
  createAdo: {
    success: true,
    ado_id: "ADO-12345",
    message: "Azure DevOps work item created successfully"
  }
};

// Mock fetch function to replace real API calls
export async function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let responseData;
  
  if (url.includes('/api/parse')) {
    responseData = mockResponses.parse;
  } else if (url.includes('/api/draft-ac')) {
    responseData = mockResponses.draftAC;
  } else if (url.includes('/api/draft-nfrs')) {
    responseData = mockResponses.draftNFRs;
  } else if (url.includes('/api/suggest-apps')) {
    responseData = mockResponses.suggestApps;
  } else if (url.includes('/api/suggest-deps')) {
    responseData = mockResponses.suggestDeps;
  } else if (url.includes('/api/create-ado')) {
    responseData = mockResponses.createAdo;
  } else {
    responseData = { error: 'Mock endpoint not found' };
  }
  
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

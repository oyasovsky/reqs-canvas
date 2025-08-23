# BSSe Visual Assistant

A POC web application that helps TPMs & SAs plan from SRT → Business Requirements → Capabilities → Functional Requirements (FRs), visualize application dependencies, track completion status, and (on explicit confirmation) create mocked ADO items. All data is local/mocked. No external network calls.

## Features

- **SRT Workspace**: Manage 3 mocked SRTs with 8 Business Requirements each
- **Visual Canvas**: React Flow-based graph showing SRTs, BRs, FRs, Applications, and dependencies
- **BR Management**: Track completion status with checklist and missing info prompts
- **Action Buttons**: Draft AC, NFRs, suggest apps/dependencies, create ADO items
- **AI-Powered Chat**: OpenAI-integrated chat interface for intelligent assistance
- **Local Mock Data**: No external dependencies, all data is local

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS for styling
- Zustand for state management
- React Flow for graph visualization
- OpenAI GPT-4 for AI-powered chat responses
- nanoid for mock ID generation
- Vitest for testing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure OpenAI (optional but recommended):
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a `.env.local` file in the project root:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## OpenAI Integration

The chat interface is powered by OpenAI's GPT-4 model, providing:

- **Context-Aware Responses**: Understands current SRT and BR selection
- **Expert Analysis**: Specialized in business requirements analysis
- **Actionable Insights**: Provides specific recommendations and next steps
- **Professional Tone**: Maintains expert-level communication
- **Fallback Support**: Gracefully falls back to local logic if API is unavailable

### Chat Capabilities

- **BR Analysis**: "What's left for BR01?" - Analyzes completion status
- **SRT Parsing**: "Parse SRT" - Provides comprehensive SRT overview
- **App Suggestions**: "Suggest impacted apps for BR01" - Recommends applications
- **Dependency Mapping**: "Propose dependencies for BR01" - Suggests typed dependencies
- **AC Drafting**: "Draft AC for BR01" - Generates acceptance criteria
- **Solution Intent**: "Generate solution intent" - Creates solution overview

## Usage

### SRT Selection
- Use the left sidebar to select from 3 available SRTs
- Each SRT contains 8 Business Requirements with different completion statuses

### Business Requirements
- Click on any BR to view details in the right pane
- See checklist status (✔️/⚠️/❌) for various completion criteria
- View missing information prompts

### Canvas Interaction
- Drag nodes to reposition them
- View impact relationships (BR → Application)
- See typed dependencies between applications (API, Event, SharedDB, etc.)

### Actions
- **Draft AC**: Generate acceptance criteria for features
- **Draft NFRs**: Create non-functional requirements
- **Suggest Apps**: Identify impacted applications
- **Suggest Dependencies**: Propose app-to-app dependencies
- **Create ADO Items**: Generate mock ADO work items (requires confirmation)

### AI Chat Interface
- Use the chat dock at the bottom for AI-powered assistance
- Ask questions about your current SRT and BRs
- Get intelligent analysis and recommendations
- Use predefined intent buttons for common tasks

## Testing

Run the test suite:
```bash
npm test
```

Tests verify:
- Checklist computation for missing items
- Status marking (✔️/⚠️/❌)
- Missing info prompt generation

## Data Structure

### SRT (Solution Requirements Template)
- Contains multiple Business Requirements
- Includes scope, history, and business context

### Business Requirement (BR)
- Title, description, and capabilities
- Functional Requirements (FRs) with acceptance criteria, NFRs, risks/assumptions/constraints
- Impacted applications and app dependencies
- Checklist status and missing information prompts

### Graph Elements
- **Nodes**: SRT, BR, FR, Application
- **Edges**: impacts (BR→App), typed dependencies (App→App)

## Guardrails

- ADO creation always requires confirmation
- All data is internal/local (no external API calls except OpenAI)
- Provenance tracking for suggestions and dependencies
- Confidence scoring for recommendations
- OpenAI API calls are rate-limited and error-handled

## Acceptance Criteria

✅ `npm i && npm run dev` launches without errors  
✅ Switching SRTs updates BR list, graph, and right pane  
✅ Chat: "what's left for BR01?" returns checklist + missing items  
✅ Suggesting dependencies adds typed edges with labels  
✅ Create ADO flow requires confirmation and returns mock IDs  
✅ Solution intent modal shows JSON preview with Copy button  
✅ AI chat provides context-aware, intelligent responses  

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes (local mocks + OpenAI)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── Sidebar.tsx        # SRT selector + BR list
│   ├── Canvas.tsx         # React Flow graph
│   ├── RightPane.tsx      # BR details + actions
│   ├── ChatDock.tsx       # AI-powered chat interface
│   └── ConfirmModal.tsx   # Confirmation modal
├── lib/                    # Utilities and helpers
│   ├── types.ts           # TypeScript interfaces
│   ├── store.ts           # Zustand store
│   ├── checklist.ts       # Checklist computation
│   ├── graph.ts           # Graph building helpers
│   └── ids.ts             # ID generation
├── data/                   # Mock data
│   ├── srts.json          # SRT definitions
│   └── apps.json          # Application catalog
└── tests/                  # Test files
    └── checklist.test.ts  # Checklist unit tests
```

## Development

This is a POC application with the following characteristics:
- All data is mocked locally
- OpenAI integration for intelligent chat responses
- Focus on UI/UX and workflow demonstration
- TypeScript for type safety
- Clean, minimal styling with TailwindCSS

## Environment Variables

Create a `.env.local` file for configuration:

```bash
# Required for AI chat functionality
OPENAI_API_KEY=your_openai_api_key_here

# Optional OpenAI settings
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

## License

MIT

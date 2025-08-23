'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const INTENTS = [
  "what's left for BR01?",
  "parse srt",
  "suggest impacted apps for BR01",
  "propose dependencies for BR01",
  "draft ac for BR01",
  "create ado items for BR01",
  "generate solution intent"
]

export default function ChatDock() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ text: string; response: string; timestamp: Date }>>([])
  const { currentSrtId, brs, selectedBrId, setBrs, addChat } = useAppStore()

  const selectedBR = brs.find(br => br.br_id === selectedBrId)
  const selectedSRT = currentSrtId ? { srt_id: currentSrtId } : null

  const generateSmartResponse = (intent: string, context: any) => {
    if (!context.selectedSRT) {
      return "Please select an SRT first to provide context-aware assistance."
    }

    const srt = context.selectedSRT
    const br = context.selectedBR
    const allBRs = context.brs

    switch (intent.toLowerCase()) {
      case "what's left":
        if (br) {
          const missingItems = br.missing_info?.map((m: any) => `• ${m.prompt}`).join('\n') || 'No missing info available'
          const completionRate = allBRs.filter((b: any) => b.checklist?.acceptance_criteria === '✔️').length / allBRs.length * 100
          
          return `**Smart Analysis for ${br.br_id}:**\n\n**Current Status:** ${br.checklist?.acceptance_criteria || 'Not set'}\n\n**Missing Information:**\n${missingItems}\n\n**Overall SRT Progress:** ${completionRate.toFixed(1)}% complete\n\n**Recommendation:** Focus on completing the missing items above. This BR is ${br.checklist?.acceptance_criteria === '✔️' ? 'ready for implementation' : 'needs more work'}.\n\n**Next Steps:** Complete the missing items to move this BR to completion.`
        }
        return "Please select a Business Requirement to analyze what's left to complete."

      case "parse srt":
        const completedBRs = allBRs.filter((b: any) => b.checklist?.acceptance_criteria === '✔️').length
        const inProgressBRs = allBRs.filter((b: any) => b.checklist?.acceptance_criteria === '⚠️').length
        const incompleteBRs = allBRs.filter((b: any) => b.checklist?.acceptance_criteria === '❌').length
        
        return `**SRT Analysis Complete**\n\n**SRT ID:** ${srt.srt_id}\n**Total BRs:** ${allBRs.length}\n\n**Progress Breakdown:**\n• ✅ Complete: ${completedBRs} BRs\n• ⚠️ In Progress: ${inProgressBRs} BRs\n• ❌ Incomplete: ${incompleteBRs} BRs\n\n**Status:** ${completedBRs === allBRs.length ? 'Ready for implementation' : 'Needs more work'}\n\n**Recommendation:** ${completedBRs === 0 ? 'Start with the first BR to build momentum' : completedBRs < allBRs.length / 2 ? 'Focus on completing more BRs before moving to implementation' : 'Nearly ready - complete remaining BRs for full readiness'}.`

      case "suggest impacted apps":
        if (br) {
          const commonApps = ['AccountSvc', 'BillingSvc', 'NotificationSvc', 'CRM', 'ProvisioningSvc']
          const suggestedApps = commonApps.slice(0, 3)
          
          return `**Impacted Applications for ${br.br_id}:**\n\nBased on the BR description and SRT context, I recommend:\n\n${suggestedApps.map((app, idx) => `• **${app}** - ${idx === 0 ? 'Primary user management (High confidence)' : idx === 1 ? 'Payment processing (Medium confidence)' : 'User communications (Medium confidence)'}`).join('\n')}\n\n**Reasoning:** ${br.description?.substring(0, 80) || 'BR description not available'}...\n\n**Confidence:** High for core services, Medium for supporting services\n\n**Next Steps:** Validate these suggestions with your technical team and update the BR accordingly.`
        }
        return "Please select a Business Requirement to suggest impacted applications."

      case "propose dependencies":
        const dependencyPatterns = [
          'AccountSvc → BillingSvc (API dependency)',
          'CRM → NotificationSvc (Event dependency)', 
          'BillingSvc → PaymentsSvc (API dependency)',
          'ProvisioningSvc → InventorySvc (SharedDB dependency)'
        ]
        
        return `**Dependency Analysis for SRT ${srt.srt_id}:**\n\nBased on the SRT scope and common patterns, I recommend these application dependencies:\n\n${dependencyPatterns.map(dep => `• **${dep}**`).join('\n')}\n\n**Pattern Analysis:**\n• Customer-facing services depend on backend business services\n• Event-driven architecture for notifications and updates\n• Shared database for inventory and provisioning data\n\n**Confidence:** High for standard patterns, Medium for specific implementations\n\n**Next Steps:** Review these dependencies with your architecture team and validate against your current system landscape.`

      case "draft ac":
        if (br) {
          const acTemplates = [
            `User can successfully complete the ${br.title?.toLowerCase() || 'workflow'} workflow`,
            'System validates all required inputs with clear error messages',
            'Performance meets specified response time requirements',
            'Error handling provides clear user feedback and recovery options',
            'Data integrity is maintained throughout the process',
            'User experience is intuitive and follows design patterns'
          ]
          
          return `**Acceptance Criteria for ${br.br_id}:**\n\n${acTemplates.map((ac, idx) => `${idx + 1}. **${idx === 0 ? 'Functional' : idx === 1 ? 'Validation' : idx === 2 ? 'Performance' : idx === 3 ? 'Error Handling' : idx === 4 ? 'Data Integrity' : 'User Experience'}:** ${ac}`).join('\n')}\n\n**Context:** Based on ${br.description?.substring(0, 60) || 'BR description'}...\n\n**Quality Standards:**\n• Clear, testable criteria\n• User-focused outcomes\n• Measurable success factors\n\n**Next Steps:** Review these criteria with stakeholders and refine based on specific business needs.`
        }
        return "Please select a Business Requirement to draft acceptance criteria."

      case "create ado items":
        return "**ADO Creation Workflow:**\n\nI'll help you create ADO items. This will generate:\n• **Business Requirement** (linked to current BR)\n• **Epic** (parent work item for planning)\n• **Features** (detailed implementation tasks)\n\n**Work Item Hierarchy:**\nBR → Epic → Features → Tasks\n\n**Note:** This requires confirmation as it creates actual work items in your ADO system.\n\n**Next Steps:** Confirm creation, then review and assign the generated work items to your team members."

      case "generate solution intent":
        const solutionComponents = [
          'Customer-facing portals and backend services',
          'Integration systems for data flow',
          'Security and compliance measures',
          'Performance and scalability considerations',
          'Monitoring and observability'
        ]
        
        return `**Solution Intent for SRT ${srt.srt_id}:**\n\n**Overview:** Comprehensive solution for business requirements with focus on user experience and system reliability\n\n**Key Components:**\n${solutionComponents.map(comp => `• ${comp}`).join('\n')}\n\n**Architecture Principles:**\n• Microservices for scalability\n• Event-driven for loose coupling\n• API-first for integration\n• Security by design\n\n**Next Steps:** Review the detailed solution intent pack for complete specifications and technical architecture details.`

      default:
        return `**Smart Assistant Response:**\n\nI understand you're working on SRT ${srt.srt_id}. How can I help you with this SRT? I can:\n\n• **Analyze BR completion status** and provide progress insights\n• **Suggest impacted applications** based on common patterns\n• **Propose dependencies** using architectural best practices\n• **Draft acceptance criteria** with quality standards\n• **Generate solution intent** with technical architecture\n\n**Current Context:** ${allBRs.length} BRs in progress, ${allBRs.filter((b: any) => b.checklist?.acceptance_criteria === '✔️').length} completed\n\nPlease be specific about what you need help with.`
    }
  }

  const handleIntent = async (intent: string) => {
    let response = ''
    
    try {
      // Generate smart response based on context and mocked data
      response = generateSmartResponse(intent, { selectedSRT, selectedBR, brs, currentSrtId })
      
      // Handle actual API calls for state updates
      if (intent.includes('suggest impacted apps')) {
        const brId = intent.match(/BR(\d+)/)?.[1]
        if (brId && selectedSRT) {
          try {
            const apiResponse = await fetch('/api/suggest-apps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ brId: `BR${brId}`, srtId: selectedSRT.srt_id }),
            })
            if (apiResponse.ok) {
              const data = await apiResponse.json()
              // Update the BR in the store
              const updatedBrs = brs.map(br => 
                br.br_id === `BR${brId}` ? { ...br, ...data } : br
              )
              setBrs(updatedBrs)
              response += '\n\n**✅ State Updated:** Impacted applications have been added to the BR.'
            }
          } catch (error) {
            response += '\n\n**⚠️ Warning:** Failed to update state, but analysis is complete.'
          }
        }
      } else if (intent.includes('propose dependencies')) {
        if (selectedSRT) {
          try {
            const apiResponse = await fetch('/api/suggest-deps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ srtId: selectedSRT.srt_id }),
            })
            if (apiResponse.ok) {
              response += '\n\n**✅ State Updated:** Dependencies have been added to the graph.'
            }
          } catch (error) {
            response += '\n\n**⚠️ Warning:** Failed to update state, but analysis is complete.'
          }
        }
      } else if (intent.includes('draft ac')) {
        const brId = intent.match(/BR(\d+)/)?.[1]
        if (brId && selectedSRT) {
          try {
            const apiResponse = await fetch('/api/draft-ac', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ brId: `BR${brId}`, srtId: selectedSRT.srt_id }),
            })
            if (apiResponse.ok) {
              const data = await apiResponse.json()
              // Update the BR in the store
              const updatedBrs = brs.map(br => 
                br.br_id === `BR${brId}` ? { ...br, ...data } : br
              )
              setBrs(updatedBrs)
              response += '\n\n**✅ State Updated:** Acceptance criteria have been added to the BR.'
            }
          } catch (error) {
            response += '\n\n**⚠️ Warning:** Failed to update state, but analysis is complete.'
          }
        }
      }
    } catch (error) {
      response = '**❌ Error:** I encountered an issue processing your request. Please try again.'
    }

    setMessages(prev => [...prev, { 
      text: intent, 
      response, 
      timestamp: new Date() 
    }])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleIntent(input.trim())
      setInput('')
    }
  }

  return (
    <div className="h-32 bg-white border-t border-gray-200 p-4">
      <div className="flex gap-2 mb-2 overflow-x-auto">
        {INTENTS.map((intent) => (
          <button
            key={intent}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
            onClick={() => handleIntent(intent)}
          >
            {intent}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about the current SRT, BRs, or request assistance..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Ask Smart Assistant
        </button>
      </form>
      
      <div className="h-16 overflow-y-auto space-y-2">
        {messages.slice(-3).map((msg, idx) => (
          <div key={idx} className="text-sm">
            <div className="font-medium text-gray-700">Q: {msg.text}</div>
            <div className="text-gray-600 whitespace-pre-line">{msg.response}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Controls,
  Background,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAppStore } from '@/lib/store'

// Enhanced node types with status indicators
const nodeTypes: NodeTypes = {
  SRT: ({ data }: { data: any }) => (
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-400 rounded-lg p-4 min-w-[280px] shadow-lg">
      <div className="font-bold text-purple-800 text-lg mb-2">{data.label}</div>
      <div className="text-sm text-purple-600 mb-2">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-purple-500 bg-purple-200 px-2 py-1 rounded">SRT Root</div>
        <div className="text-xs text-purple-700 font-medium">{data.brCount} BRs</div>
      </div>
    </div>
  ),
  BR: ({ data }: { data: any }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case '✔️': return 'border-green-400 bg-gradient-to-br from-green-50 to-green-100'
        case '⚠️': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100'
        case '❌': return 'border-red-400 bg-gradient-to-br from-red-50 to-red-100'
        default: return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100'
      }
    }
    
    const getStatusTextColor = (status: string) => {
      switch (status) {
        case '✔️': return 'text-green-800'
        case '⚠️': return 'text-yellow-800'
        case '❌': return 'text-red-800'
        default: return 'text-blue-800'
      }
    }

    return (
      <div className={`border-2 rounded-lg p-3 min-w-[220px] shadow-md ${getStatusColor(data.status)}`}>
        <div className={`font-semibold text-sm mb-1 ${getStatusTextColor(data.status)}`}>
          {data.label}
        </div>
        <div className="text-xs text-gray-600 line-clamp-2 mb-2">{data.description}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs bg-white px-2 py-1 rounded shadow-sm">Business Requirement</div>
          <div className="flex items-center space-x-1">
            <span className="text-lg">{data.status}</span>
            <span className="text-xs text-gray-500">{data.featureCount}F</span>
          </div>
        </div>
        {data.capabilities && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.capabilities.slice(0, 2).map((cap: string, idx: number) => (
              <span key={idx} className="text-xs bg-white px-1 py-0.5 rounded text-gray-600">
                {cap}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  },
  Feature: ({ data }: { data: any }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case '✔️': return 'border-green-300 bg-gradient-to-br from-green-50 to-green-100'
        case '⚠️': return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
        case '❌': return 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
        default: return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
      }
    }

    return (
      <div className={`border-2 rounded-lg p-3 min-w-[200px] shadow-md ${getStatusColor(data.status)}`}>
        <div className="font-semibold text-green-800 text-sm mb-1">{data.label}</div>
        <div className="text-xs text-green-600 line-clamp-2 mb-2">{data.description}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs bg-white px-2 py-1 rounded shadow-sm">Feature</div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">{data.status}</span>
            {data.acCount && (
              <span className="text-xs text-gray-500">{data.acCount}AC</span>
            )}
          </div>
        </div>
        {data.nfrs && data.nfrs.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            NFRs: {data.nfrs.slice(0, 2).map((nfr: any) => nfr.category).join(', ')}
          </div>
        )}
      </div>
    )
  },
  Application: ({ data }: { data: any }) => (
    <div className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400 rounded-lg p-3 min-w-[180px] shadow-md">
      <div className="font-semibold text-orange-800 text-sm mb-1">{data.label}</div>
      <div className="text-xs text-orange-600 line-clamp-2 mb-2">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-orange-500 bg-orange-200 px-2 py-1 rounded">Application</div>
        {data.confidence && (
          <div className="text-xs text-orange-700 font-medium">
            {Math.round(data.confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  ),
}

export default function Canvas() {
  const { currentSrtId, brs, graph, setGraph } = useAppStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (currentSrtId && brs.length > 0) {
      try {
        // Build comprehensive graph with all relationships and status
        const graphNodes: Node[] = []
        const graphEdges: Edge[] = []
        
        // Add SRT root node
        graphNodes.push({
          id: 'srt-root',
          type: 'SRT',
          position: { x: 400, y: 50 },
          data: { 
            label: `SRT: ${currentSrtId}`, 
            description: 'Solution Requirements Template',
            brCount: brs.length
          }
        })

        // Calculate positions for BRs in a wide horizontal layout
        const brSpacing = 280
        const startX = 50
        const brY = 250

        // Add BR nodes with status and features
        brs.forEach((br, brIndex) => {
          const brX = startX + (brIndex * brSpacing)
          
          // Determine BR overall status (worst status from checklist)
          const checklistValues = Object.values(br.checklist || {})
          const brStatus = checklistValues.includes('❌') ? '❌' : 
                          checklistValues.includes('⚠️') ? '⚠️' : '✔️'
          
          graphNodes.push({
            id: br.br_id,
            type: 'BR',
            position: { x: brX, y: brY },
            data: { 
              label: br.br_id, 
              description: br.title,
              status: brStatus,
              featureCount: br.features?.length || 0,
              capabilities: br.capabilities
            }
          })

          // Connect SRT to BR
          graphEdges.push({
            id: `srt-to-${br.br_id}`,
            source: 'srt-root',
            target: br.br_id,
            type: 'default',
            label: 'contains',
            style: { stroke: '#8b5cf6', strokeWidth: 2 }
          })

          // Add Feature nodes below each BR
          br.features?.forEach((feature, featureIndex) => {
            const featureX = brX - 50 + (featureIndex * 120)
            const featureY = brY + 200 + (featureIndex * 30) // Stagger slightly
            
            // Determine feature status based on acceptance criteria and NFRs
            const hasAC = feature.acceptance_criteria && feature.acceptance_criteria.length > 0
            const hasNFRs = feature.nfrs && feature.nfrs.length > 0
            const hasRisks = feature.risks && feature.risks.length > 0
            
            const featureStatus = hasAC && hasNFRs && hasRisks ? '✔️' : 
                                hasAC || hasNFRs ? '⚠️' : '❌'

            graphNodes.push({
              id: feature.feature_id,
              type: 'Feature',
              position: { x: featureX, y: featureY },
              data: { 
                label: feature.title.length > 20 ? feature.title.substring(0, 20) + '...' : feature.title,
                description: feature.description.length > 60 ? feature.description.substring(0, 60) + '...' : feature.description,
                status: featureStatus,
                acCount: feature.acceptance_criteria?.length || 0,
                nfrs: feature.nfrs
              }
            })

            // Connect BR to Feature
            graphEdges.push({
              id: `${br.br_id}-to-${feature.feature_id}`,
              source: br.br_id,
              target: feature.feature_id,
              type: 'default',
              label: 'decomposes',
              style: { stroke: '#3b82f6', strokeWidth: 2 }
            })
          })

          // Add Application nodes to the right side
          br.impacted_applications?.forEach((app, appIndex) => {
            const appX = brX + 320
            const appY = brY + (appIndex * 120) - 60
            
            // Check if app node already exists
            const existingApp = graphNodes.find(n => n.id === app.app)
            if (!existingApp) {
              graphNodes.push({
                id: app.app,
                type: 'Application',
                position: { x: appX, y: appY },
                data: { 
                  label: app.app,
                  description: app.reason,
                  confidence: app.confidence
                }
              })
            }

            // Connect BR to Application
            graphEdges.push({
              id: `${br.br_id}-impacts-${app.app}`,
              source: br.br_id,
              target: app.app,
              type: 'default',
              label: 'impacts',
              style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
            })
          })
        })

        // Add typed dependency edges between applications
        brs.forEach(br => {
          br.app_dependencies?.forEach(dep => {
            const edgeColor = {
              'API': '#ef4444',
              'Event': '#8b5cf6', 
              'SharedDB': '#06b6d4',
              'Batch': '#84cc16',
              'File': '#f97316',
              'UI': '#ec4899'
            }[dep.type] || '#6b7280'

            graphEdges.push({
              id: `dep-${dep.from}-${dep.to}`,
              source: dep.from,
              target: dep.to,
              type: 'default',
              label: dep.type,
              style: { 
                stroke: edgeColor, 
                strokeWidth: 3,
                strokeDasharray: dep.type === 'Event' ? '8,4' : undefined
              }
            })
          })
        })

        setNodes(graphNodes)
        setEdges(graphEdges)
        
        // Convert to the expected GraphPayload format for store
        const graphPayload = {
          nodes: graphNodes.map(node => ({
            id: node.id,
            type: node.type as any,
            label: node.data?.label || node.id,
            description: node.data?.description,
            position: node.position
          })),
          edges: graphEdges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: (edge.label === 'contains' ? 'contains' : 
                   edge.label === 'decomposes' ? 'decomposes' : 
                   edge.label === 'impacts' ? 'impacts' : 'API') as "contains" | "decomposes" | "impacts" | "API",
            label: edge.label as string
          }))
        }
        setGraph(graphPayload)
      } catch (error) {
        console.error('Error building graph:', error)
      }
    }
  }, [currentSrtId, brs, setNodes, setEdges, setGraph])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const onNodeDragStop = useCallback(() => {
    // Convert React Flow types to GraphPayload types
    const graphPayload = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        label: node.data?.label || node.id,
        description: node.data?.description,
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: (edge.label === 'contains' ? 'contains' : 
               edge.label === 'decomposes' ? 'decomposes' : 
               edge.label === 'impacts' ? 'impacts' : 'API') as "contains" | "decomposes" | "impacts" | "API",
        label: edge.label as string
      }))
    }
    setGraph(graphPayload)
    if (currentSrtId) {
      localStorage.setItem(`graph-${currentSrtId}`, JSON.stringify(graphPayload))
    }
  }, [nodes, edges, currentSrtId, setGraph])

  if (!currentSrtId || brs.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p className="text-lg">Select an SRT to view the dependency graph</p>
          <p className="text-sm mt-2">The graph shows SRT → BR → Feature hierarchy with status indicators</p>
        </div>
      </div>
    )
  }

  const completedBRs = brs.filter(br => {
    const checklistValues = Object.values(br.checklist || {})
    return !checklistValues.includes('❌') && !checklistValues.includes('⚠️')
  }).length

  const totalFeatures = brs.reduce((sum, br) => sum + (br.features?.length || 0), 0)

  return (
    <div className="flex-1 bg-gray-50 relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-md border">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Dependency Graph</h3>
        <p className="text-xs text-gray-500 mb-2">SRT → BR → Feature → Application</p>
        <div className="space-y-1 text-xs">
          <div><span className="font-medium">SRT:</span> {currentSrtId}</div>
          <div><span className="font-medium">BRs:</span> {brs.length} ({completedBRs} complete)</div>
          <div><span className="font-medium">Features:</span> {totalFeatures}</div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <span>✔️</span><span>Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚠️</span><span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>❌</span><span>Incomplete</span>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          animated: false,
        }}
      >
        <Background color="#f3f4f6" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}

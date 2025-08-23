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
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAppStore } from '@/lib/store'

// Enhanced node types with status indicators
const nodeTypes: NodeTypes = {
  SRT: ({ data }: { data: any }) => (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-200/60 rounded-2xl p-6 min-w-[300px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="font-semibold text-slate-800 text-xl mb-3 tracking-tight">{data.label}</div>
      <div className="text-sm text-slate-600 mb-4 leading-relaxed">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-indigo-600 bg-indigo-100/80 px-3 py-1.5 rounded-full font-medium">SRT Root</div>
        <div className="text-sm text-slate-700 font-semibold">{data.brCount} BRs</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !border-2 !border-white !w-3 !h-3" />
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !border-2 !border-white !w-3 !h-3" />
    </div>
  ),
  BR: ({ data }: { data: any }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case '✔️': return 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-emerald-200/40'
        case '⚠️': return 'border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-amber-200/40'
        case '❌': return 'border-rose-200/60 bg-gradient-to-br from-rose-50 via-white to-red-50 shadow-rose-200/40'
        default: return 'border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-blue-200/40'
      }
    }
    
    const getStatusTextColor = (status: string) => {
      switch (status) {
        case '✔️': return 'text-emerald-700'
        case '⚠️': return 'text-amber-700'
        case '❌': return 'text-rose-700'
        default: return 'text-blue-700'
      }
    }

    const getHandleColor = (status: string) => {
      switch (status) {
        case '✔️': return '!bg-emerald-500'
        case '⚠️': return '!bg-amber-500'
        case '❌': return '!bg-rose-500'
        default: return '!bg-blue-500'
      }
    }

    return (
      <div className={`border rounded-2xl p-4 min-w-[240px] shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${getStatusColor(data.status)}`}>
        <div className={`font-semibold text-base mb-2 tracking-tight ${getStatusTextColor(data.status)}`}>
          {data.label}
        </div>
        <div className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{data.description}</div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm font-medium text-slate-700">Business Requirement</div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">{data.status}</span>
            <span className="text-xs text-slate-500 font-medium">{data.frCount}FR</span>
          </div>
        </div>
        {data.capabilities && (
          <div className="flex flex-wrap gap-1.5">
            {data.capabilities.slice(0, 2).map((cap: string, idx: number) => (
              <span key={idx} className="text-xs bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full text-slate-600 font-medium">
                {cap}
              </span>
            ))}
          </div>
        )}
        <Handle type="target" position={Position.Top} className={`!border-2 !border-white !w-3 !h-3 ${getHandleColor(data.status)}`} />
        <Handle type="source" position={Position.Bottom} className={`!border-2 !border-white !w-3 !h-3 ${getHandleColor(data.status)}`} />
      </div>
    )
  },
  FR: ({ data }: { data: any }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case '✔️': return 'border-teal-200/60 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-teal-200/30'
        case '⚠️': return 'border-orange-200/60 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-orange-200/30'
        case '❌': return 'border-pink-200/60 bg-gradient-to-br from-pink-50 via-white to-rose-50 shadow-pink-200/30'
        default: return 'border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-gray-50 shadow-slate-200/30'
      }
    }

    const getHandleColor = (status: string) => {
      switch (status) {
        case '✔️': return '!bg-teal-500'
        case '⚠️': return '!bg-orange-500'
        case '❌': return '!bg-pink-500'
        default: return '!bg-slate-500'
      }
    }

    return (
      <div className={`border rounded-xl p-3 min-w-[220px] shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 ${getStatusColor(data.status)}`}>
        <div className="font-semibold text-slate-800 text-sm mb-2 tracking-tight">{data.label}</div>
        <div className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{data.description}</div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm font-medium text-slate-700">FR</div>
          <div className="flex items-center space-x-2">
            <span className="text-base">{data.status}</span>
            {data.acCount && (
              <span className="text-xs text-slate-500 font-medium">{data.acCount}AC</span>
            )}
          </div>
        </div>
        {data.nfrs && data.nfrs.length > 0 && (
          <div className="text-xs text-slate-500 font-medium">
            NFRs: {data.nfrs.slice(0, 2).map((nfr: any) => nfr.category).join(', ')}
          </div>
        )}
        <Handle type="target" position={Position.Top} className={`!border-2 !border-white !w-2.5 !h-2.5 ${getHandleColor(data.status)}`} />
        <Handle type="source" position={Position.Bottom} className={`!border-2 !border-white !w-2.5 !h-2.5 ${getHandleColor(data.status)}`} />
      </div>
    )
  },
  Application: ({ data }: { data: any }) => (
    <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50 border border-violet-200/60 rounded-xl p-4 min-w-[200px] shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="font-semibold text-slate-800 text-sm mb-2 tracking-tight">{data.label}</div>
      <div className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-violet-600 bg-violet-100/80 px-3 py-1.5 rounded-full font-medium">Application</div>
        {data.confidence && (
          <div className="text-xs text-slate-700 font-semibold bg-white/60 px-2 py-1 rounded-full">
            {Math.round(data.confidence * 100)}%
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-500 !border-2 !border-white !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-violet-500 !border-2 !border-white !w-3 !h-3" />
    </div>
  ),
}

export default function Canvas() {
  const { brs, selectedBrId, currentSrtId, graphView, setGraphView, isGraphMaximized, toggleGraphMaximized, selectBr, isCanvasCollapsed, toggleCanvasCollapsed } = useAppStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const buildHierarchyGraph = useCallback(() => {
    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []
    
    // If a specific BR is selected, show only that BR subgraph
    if (selectedBrId) {
      const selectedBr = brs.find(br => br.br_id === selectedBrId)
      if (selectedBr) {
        return buildBRSubgraph(selectedBr)
      }
    }
    
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

    // Add BR nodes with status and FRs
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
          frCount: br.features?.length || 0,
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

      // Add FR nodes below each BR
      br.features?.forEach((feature, featureIndex) => {
        const featureX = brX - 50 + (featureIndex * 120)
        const featureY = brY + 200 + (featureIndex * 30) // Stagger slightly

        // Determine FR status based on acceptance criteria and NFRs
        const hasAC = feature.acceptance_criteria && feature.acceptance_criteria.length > 0
        const hasNFRs = feature.nfrs && feature.nfrs.length > 0
        const hasRisks = feature.risks && feature.risks.length > 0

        const frStatus = hasAC && hasNFRs && hasRisks ? '✔️' :
                            hasAC || hasNFRs ? '⚠️' : '❌'

        graphNodes.push({
          id: feature.feature_id,
          type: 'FR',
          position: { x: featureX, y: featureY },
          data: {
            label: feature.title.length > 20 ? feature.title.substring(0, 20) + '...' : feature.title,
            description: feature.description.length > 60 ? feature.description.substring(0, 60) + '...' : feature.description,
            status: frStatus,
            acCount: feature.acceptance_criteria?.length || 0,
            nfrs: feature.nfrs
          }
        })

        // Connect BR to FR
        graphEdges.push({
          id: `${br.br_id}-to-${feature.feature_id}`,
          source: br.br_id,
          target: feature.feature_id,
          type: 'default',
          label: 'decomposes',
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        })
      })
    })
    
    return { graphNodes, graphEdges }
  }, [brs, selectedBrId])

  const buildBRSubgraph = (br: any) => {
    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []
    
    // Determine BR overall status
    const checklistValues = Object.values(br.checklist || {})
    const brStatus = checklistValues.includes('❌') ? '❌' : 
                    checklistValues.includes('⚠️') ? '⚠️' : '✔️'
    
    // Add central BR node
    graphNodes.push({
      id: br.br_id,
      type: 'BR',
      position: { x: 400, y: 150 },
      data: { 
        label: br.br_id, 
        description: br.title,
        status: brStatus,
        frCount: br.features?.length || 0,
        capabilities: br.capabilities
      }
    })

    // Add FR nodes in a radial layout around the BR
    br.features?.forEach((feature: any, featureIndex: number) => {
      const angle = (featureIndex * 2 * Math.PI) / (br.features?.length || 1)
      const radius = 250
      const featureX = 400 + Math.cos(angle) * radius
      const featureY = 150 + Math.sin(angle) * radius

      // Determine FR status
      const hasAC = feature.acceptance_criteria && feature.acceptance_criteria.length > 0
      const hasNFRs = feature.nfrs && feature.nfrs.length > 0
      const hasRisks = feature.risks && feature.risks.length > 0

      const frStatus = hasAC && hasNFRs && hasRisks ? '✔️' :
                          hasAC || hasNFRs ? '⚠️' : '❌'

      graphNodes.push({
        id: feature.feature_id,
        type: 'FR',
        position: { x: featureX, y: featureY },
        data: {
          label: feature.title.length > 20 ? feature.title.substring(0, 20) + '...' : feature.title,
          description: feature.description.length > 60 ? feature.description.substring(0, 60) + '...' : feature.description,
          status: frStatus,
          acCount: feature.acceptance_criteria?.length || 0,
          nfrs: feature.nfrs
        }
      })

      // Connect BR to FR
      graphEdges.push({
        id: `${br.br_id}-to-${feature.feature_id}`,
        source: br.br_id,
        target: feature.feature_id,
        type: 'default',
        label: 'decomposes',
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      })
    })
    
    return { graphNodes, graphEdges }
  }

  const buildDependenciesGraph = useCallback(() => {
    const graphNodes: Node[] = []
    const graphEdges: Edge[] = []
    
    if (!selectedBrId) return { graphNodes, graphEdges }
    
    const selectedBr = brs.find(br => br.br_id === selectedBrId)
    if (!selectedBr) return { graphNodes, graphEdges }

    // Add central BR node
    graphNodes.push({
      id: selectedBr.br_id,
      type: 'BR',
      position: { x: 400, y: 300 },
      data: { 
        label: selectedBr.br_id, 
        description: selectedBr.title,
        status: '✔️',
        frCount: selectedBr.features?.length || 0,
        capabilities: selectedBr.capabilities
      }
    })

    // Add impacted applications
    const appPositions = new Map<string, { x: number, y: number }>()
    selectedBr.impacted_applications?.forEach((app, appIndex) => {
      const angle = (appIndex * 2 * Math.PI) / (selectedBr.impacted_applications?.length || 1)
      const radius = 300
      const appX = 400 + Math.cos(angle) * radius
      const appY = 300 + Math.sin(angle) * radius
      
      appPositions.set(app.app, { x: appX, y: appY })
      
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

      // Connect BR to Application
      graphEdges.push({
        id: `${selectedBr.br_id}-impacts-${app.app}`,
        source: selectedBr.br_id,
        target: app.app,
        type: 'default',
        label: 'impacts',
        style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
      })
    })

    // Add dependency edges between applications
    const addedDependencies = new Set<string>()
    selectedBr.app_dependencies?.forEach(dep => {
      const depKey = `${dep.from}-${dep.to}-${dep.type}`
      
      if (addedDependencies.has(depKey)) return
      addedDependencies.add(depKey)

      const edgeColor = {
        'API': '#ef4444',
        'Event': '#8b5cf6', 
        'SharedDB': '#06b6d4',
        'Batch': '#84cc16',
        'File': '#f97316',
        'UI': '#ec4899'
      }[dep.type] || '#6b7280'

      graphEdges.push({
        id: `dep-${dep.from}-${dep.to}-${dep.type}`,
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
    
    return { graphNodes, graphEdges }
  }, [brs, selectedBrId])

  useEffect(() => {
    if (currentSrtId && brs.length > 0) {
      try {
        let graphNodes: Node[] = []
        let graphEdges: Edge[] = []
        
        if (graphView === 'hierarchy') {
          const result = buildHierarchyGraph()
          graphNodes = result.graphNodes
          graphEdges = result.graphEdges
        } else {
          const result = buildDependenciesGraph()
          graphNodes = result.graphNodes
          graphEdges = result.graphEdges
        }

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
        // Graph payload removed from global state
      } catch (error) {
        console.error('Error building graph:', error)
      }
    }
  }, [currentSrtId, brs, graphView, selectedBrId, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'BR') {
      useAppStore.getState().selectBr(node.id)
      setGraphView('dependencies')
    }
  }, [setGraphView])

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
    // Graph payload removed from global state
    if (currentSrtId) {
      localStorage.setItem(`graph-${currentSrtId}`, JSON.stringify(graphPayload))
    }
  }, [nodes, edges, currentSrtId])

  if (!currentSrtId || brs.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p className="text-lg">Select an SRT to view the dependency graph</p>
          <p className="text-sm mt-2">The graph shows SRT → BR → FR hierarchy with status indicators</p>
        </div>
      </div>
    )
  }

  const completedBRs = brs.filter(br => {
    const checklistValues = Object.values(br.checklist || {})
    return !checklistValues.includes('❌') && !checklistValues.includes('⚠️')
  }).length

  const totalFRs = brs.reduce((sum, br) => sum + (br.features?.length || 0), 0)

  return (
    <div className="flex-1 bg-gray-50 relative w-full h-full">
      {/* React Flow Container - Always Visible */}
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50"
        >
          <Controls 
            className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <Background 
            gap={20} 
            size={1}
            className="opacity-30"
          />
        </ReactFlow>
      </div>

      {/* Collapsible Control Panel */}
      <div className={`absolute top-6 left-6 z-10 transition-all duration-300 ${isCanvasCollapsed ? 'h-12' : 'h-auto'}`}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCanvasCollapsed}
            className="w-full p-3 hover:bg-white/95 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-700">Controls</span>
            </div>
            <span className="text-slate-500">
              {isCanvasCollapsed ? '▼' : '▲'}
            </span>
          </button>

          {/* Expanded Panel Content */}
          {!isCanvasCollapsed && (
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-1 mb-4 bg-slate-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setGraphView('hierarchy')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    graphView === 'hierarchy'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  Hierarchy
                </button>
                <button
                  onClick={() => setGraphView('dependencies')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    graphView === 'dependencies'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                  disabled={!selectedBrId}
                >
                  Dependencies
                </button>
                <button
                  onClick={toggleGraphMaximized}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                  title={isGraphMaximized ? 'Minimize' : 'Maximize'}
                >
                  {isGraphMaximized ? '⊟' : '⊞'}
                </button>
              </div>
              
              <h3 className="text-base font-semibold text-slate-800 mb-2 tracking-tight">
                {graphView === 'hierarchy' ? 'Requirements Hierarchy' : 'Application Dependencies'}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {graphView === 'hierarchy' ? 'SRT → BR → FR' : `${selectedBrId} Dependencies`}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">SRT:</span> <span className="font-medium text-slate-700">{currentSrtId}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">BRs:</span> <span className="font-medium text-slate-700">{brs.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Complete:</span> <span className="font-medium text-emerald-600">{completedBRs}/{brs.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total FRs:</span> <span className="font-medium text-slate-700">{totalFRs}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

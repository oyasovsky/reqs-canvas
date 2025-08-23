import { SRT, GraphPayload, GraphNode, GraphEdge } from './types'

export function buildGraphPayload(srt: SRT): GraphPayload {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let nodeId = 0

  // Add SRT as the root node
  nodes.push({
    id: `SRT-${srt.srt_id}`,
    type: 'SRT',
    label: srt.title,
    description: srt.scope.substring(0, 100) + '...',
    position: { x: 50, y: 50 }
  })

  // Add BR nodes in a horizontal row below SRT
  srt.business_requirements.forEach((br, index) => {
    const xPos = 50 + (index * 300)
    const yPos = 200
    
    nodes.push({
      id: br.br_id,
      type: 'BR',
      label: br.br_id,
      description: br.title,
      position: { x: xPos, y: yPos }
    })

    // Connect SRT to BR
    edges.push({
      id: `srt-to-${br.br_id}`,
      source: `SRT-${srt.srt_id}`,
      target: br.br_id,
      type: 'contains',
      label: 'contains'
    })

    // Add Features for each BR in a vertical column below
    br.features.forEach((feature, featureIndex) => {
      const featureX = xPos
      const featureY = yPos + 150 + (featureIndex * 120)
      
      nodes.push({
        id: feature.feature_id,
        type: 'Feature',
        label: feature.title,
        description: feature.description.substring(0, 80) + '...',
        position: { x: featureX, y: featureY }
      })

      // Connect BR to Feature
      edges.push({
        id: `${br.br_id}-to-${feature.feature_id}`,
        source: br.br_id,
        target: feature.feature_id,
        type: 'decomposes',
        label: 'decomposes'
      })
    })

    // Add Application nodes from impacted apps to the right
    br.impacted_applications.forEach((app, appIndex) => {
      const appX = xPos + 400
      const appY = yPos + (appIndex * 100)
      
      // Check if app node already exists
      const existingApp = nodes.find(n => n.id === app.app)
      if (!existingApp) {
        nodes.push({
          id: app.app,
          type: 'Application',
          label: app.app,
          description: `Impacted by ${br.br_id}`,
          position: { x: appX, y: appY }
        })
      }

      // Connect BR to Application
      edges.push({
        id: `${br.br_id}-impacts-${app.app}`,
        source: br.br_id,
        target: app.app,
        type: 'impacts',
        label: 'impacts'
      })
    })
  })

  // Add typed dependency edges between applications
  srt.business_requirements.forEach(br => {
    br.app_dependencies.forEach(dep => {
      edges.push({
        id: `dep-${dep.from}-${dep.to}`,
        source: dep.from,
        target: dep.to,
        type: dep.type,
        label: dep.type
      })
    })
  })

  return { nodes, edges }
}

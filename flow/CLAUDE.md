# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the `flow` package in the `pc-uni-h5` pnpm workspace. It's a Vue 3 + Vite + TypeScript application for visual flowchart/process editing, built on top of the [LogicFlow](https://docs.logic-flow.cn/) library.

## Common Commands

```bash
# Development (runs on port 5175)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Architecture

### Core Components

**LogicFlowPanel.vue** (`src/components/LogicFlowPanel.vue`)
- Core LogicFlow wrapper component that initializes the canvas
- Registers custom Vue nodes (start-node, end-node, my-logic-node, copy-node)
- Registers custom InteractiveEdge
- Exposes methods via `defineExpose`: getData, setData, zoomIn/zoomOut, undo/redo, addNode, deleteNode, etc.

**LogicNodeModel.ts** (`src/components/nodes/LogicNodeModel.ts`)
- Base model class extending `VueNodeModel` from @logicflow/vue-node-registry
- Defines connection rules (sourceRules/targetRules):
  - End nodes cannot connect to other nodes
  - Copy nodes cannot connect to other nodes
  - Start nodes cannot be connected by other nodes
  - Copy nodes can only have one incoming connection
  - No duplicate connections between nodes
  - No self-connections
- Defines custom anchors: left anchor (in), right anchor (out)
- Start nodes only have out anchor; end/copy nodes only have in anchor

**InteractiveEdge.ts** (`src/components/edges/InteractiveEdge.ts`)
- Custom polyline edge with interactive red circle button
- Circle appears when edge is selected; emits `edge:circle-click` event on click

### Custom Nodes

Custom nodes are Vue components registered via `@logicflow/vue-node-registry`:

- **StartNode** (`src/components/nodes/StartNode/`): Green, only has output anchor
- **EndNode** (`src/components/nodes/EndNode/`): Gray, only has input anchor
- **ApproveNode** (`src/components/nodes/ApproveNode/`): Blue workflow node
- **CopyNode** (`src/components/nodes/CopyNode/`): Teal, only has input anchor

Each node consists of:
- `NodeName.vue`: The Vue component rendered on canvas (uses `inject('getNode')` and `inject('getGraph')`)
- `NodeNameIcon.vue`: Icon component used in the left node panel

### Views

- **FlowEditor.vue** (`src/views/FlowEditor.vue`): Main editor with toolbar, node palette, canvas, and property panel
- **SqlEditor.vue** (`src/views/sql/SqlEditor.vue`): New SQL flow editor (WIP)
- **FlowViewer.vue**: Read-only flow viewer
- **XmlParserView.vue**, **JsonToXmlView.vue**: BPMN XML utilities
- **moddle.vue**: BPMN moddle test page

### State Persistence

- Flow data is saved to/loaded from `localStorage` (key: `flowData`)
- Flow name is stored separately (key: `flow_name`)
- Import/export uses JSON files

## Key Patterns

### Adding a New Node Type

1. Create component in `src/components/nodes/NewNode/NewNode.vue`
2. Create icon component `NewNodeIcon.vue`
3. Register in `LogicFlowPanel.vue` using `register({ type, component, model }, lf)`
4. Add to nodeTypes array in `FlowEditor.vue` for the left panel
5. Add to iconMap in `FlowEditor.vue`

### Node Component Structure

```vue
<script setup lang="ts">
const getNode = inject('getNode') as () => any
const getGraph = inject('getGraph') as () => any
const node = getNode()
const graph = getGraph()
// Access node data: node.getData()
// Access properties: node.getData().properties
</script>
```

### Connection Rules

Connection validation is done in `LogicNodeModel.ts` via `sourceRules` and `targetRules` arrays. Each rule has a `message` and `validate` function.

## Dependencies

- **@logicflow/core**: Core diagramming engine
- **@logicflow/vue-node-registry**: Vue component registration for nodes
- **@logicflow/extension**: Extensions (MiniMap, Menu - currently disabled)
- **bpmn-js** / **bpmn-moddle**: BPMN 2.0 modeling support
- **ant-design-vue**: UI component library
- **@pc-uni-h5/utils**: Shared workspace utilities

## Workspace Context

This package is part of a pnpm monorepo. The root `package.json` provides scripts like `pnpm run dev:flow` to start this package from the workspace root.

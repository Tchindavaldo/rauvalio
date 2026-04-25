# Rauvalio — Handoff Context

## Stack
Electron + React + TypeScript desktop application.

## Architecture

- **Main Process (Electron)** — hosts all agents (NavigationAgent, ScannerAgent, PageIdentifierAgent, MemoryAgent, AmbiguityResolver, AgentCartographe).
- **Renderer Process** — React canvas built on `@xyflow/react` (React Flow). Pan/zoom, node graph, edges.
- **IPC bridge** exposed on `window.rauvalio`:
  - `scanProject()` — kicks off the project scan pipeline
  - `askAgent(agentName, payload)` — forwards a request to a Main-side agent
  - `getMemory()` — reads the current MemoryAgent session

## Canvas nodes

- **PhoneFrame** — a React Flow node containing a **real `<iframe>`** pointing at `http://localhost:8081` (Expo dev server). One iframe per route the project exposes; each frame is navigated to its route on mount.
- **NavigationEdge** — React Flow edge type. Edges are produced by `NavigationAgent`, which uses **ts-morph** to walk the source AST and the **Claude API** to classify navigation intents (e.g. `navigation.navigate('Checkout')`, `<Link to="/cart">`, conditional auth branches).

## AI Context Dialog

`AIContextDialog` opens via an **overlay click interceptor** layered on top of each PhoneFrame iframe. The overlay captures clicks (the iframe itself can't be inspected cross-origin), maps the click coordinates back to the source component via the navigation graph + source map data, and opens the dialog anchored to the clicked element with the corresponding file/line metadata (e.g. `ProductScreen.tsx:142`).

## Mapping this mockup to real components

| Mockup element | Real component |
|---|---|
| Phone card on canvas | `<PhoneFrame route="..." />` (iframe + chrome) |
| Bezier arrow + label | `<NavigationEdge>` (React Flow custom edge) |
| Selected glow | `data-selected` on the React Flow node wrapper |
| AI popup | `<AIContextDialog component={...} sourceLoc={...} />` |
| Agents panel | Subscribes to `window.rauvalio.onAgentEvent(...)` IPC stream |
| Mini chat | `<GlobalChat>` — talks to all Main agents via `askAgent` |
| Left sidebar icons | `Canvas | Mémoire | Agents | Historique | Settings` views |

## Notes for implementation

- The mockup arrows are anchored to `data-anchor` attributes inside the simulated screens. In production these anchors come from the **real DOM of the running Expo app**, surfaced through a small bridge script injected into the iframe that posts element bounds back to the parent on layout changes.
- Pan/zoom in the mockup is hand-rolled; in production replace with React Flow's built-in viewport.
- Dot grid background should use React Flow's `<Background variant="dots" />`.

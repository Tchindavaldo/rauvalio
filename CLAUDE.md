# Rauvalio — CLAUDE.md
> Lis ce fichier entièrement avant de toucher au code.
> Dernière mise à jour : 2026-04-27

---

## C'est quoi Rauvalio ?

Rauvalio est un **AI coding tool desktop** (Electron) qui remplace le layout classique
(arbre fichiers | éditeur | chat) par un **canvas vivant** du projet ouvert.

Le dev ouvre son projet et voit immédiatement :
- Toutes ses pages rendues dans des **frames iPhone** sur un canvas infini
- Des **flèches bezier animées** générées par l'IA selon la navigation réelle du code
- Un **dialog IA contextuel** au click sur n'importe quel composant
- Un **mini chat global** en bas pour les questions projet-wide
- Une **sidebar agents** en temps réel

---

## État actuel — ce qui est FAIT ✅

### Infrastructure
- App Electron qui se lance : `npm run dev`
- Build de production : `npm run build`
- TypeScript sans erreurs
- Monorepo pnpm avec `packages/agents/`

### Design system
```
bg_primary:     #0A0A0F
bg_surface:     #12121A
accent_blue:    #4F8EF7
border:         rgba(255,255,255,0.08)
border_radius:  8px
font_ui:        Syne
font_mono:      JetBrains Mono
```

### UI Renderer (src/renderer/src/)
```
App.tsx                     — Root layout
components/
  TitleBar.tsx              — barre titre macOS, traffic lights, drag region
  LeftSidebar.tsx           — 48px icônes
  AgentsPanel.tsx           — sidebar droite 260px glassmorphism, IPC stream
  GlobalChat.tsx            — mini chat 380px collapsible, suggestion pills
  AIContextDialog.tsx       — popup IA flottante sur composant sélectionné
  canvas/
    CanvasView.tsx          — ReactFlow canvas, BRANCHÉ SUR IPC RÉEL
    PhoneFrameNode.tsx      — nœud custom : chrome iPhone + écran simulé
    NavigationEdge.tsx      — arête custom : bezier glow animé + label
    AIContextNode.tsx       — dialog ancré en coords monde
    CanvasToolbar.tsx       — zoom %, fit
    CanvasMinimap.tsx       — minimap bas-droite
screens/                    — 5 écrans simulés inline (pas de vraies iframes)
  HomeScreen.tsx
  ProductScreen.tsx         — data-anchor: "add-to-cart", "order-now"
  CartScreen.tsx            — data-anchor: "checkout-cta"
  CheckoutScreen.tsx
  LoginScreen.tsx           — data-anchor: "login-cta"
  shared/StatusBar.tsx
styles/globals.css          — design tokens, glass, animations
```

### Pipeline agents IA ✅ FONCTIONNEL
```
packages/agents/cartographer/
  ASTReaderAgent.ts         — ts-morph, PAS d'IA, produit JSON structuré
  PageIdentifierAgent.ts    — Claude API, classifie page/layout/component/shared
  NavigationAgent.ts        — Claude API, détecte les edges de navigation
```

**Résultats validés sur le projet exemple (screens/) :**
- 5 pages classifiées à 90%+ de confidence
- StatusBar classifié `component` à 80%
- 4 edges détectés : `add-to-cart`, `order-now`, `checkout-cta`, `login-cta`

### IPC branché ✅
```
src/main/index.ts           — handler scan-project RÉEL (plus de stub)
src/preload/index.ts        — contextBridge exposé au Renderer

Flux complet :
Renderer → IPC scan-project
  → ASTReaderAgent (ts-morph)
  → PageIdentifierAgent (Claude API)
  → NavigationAgent (Claude API)
  → { pages, edges } retourné au Renderer
  → CanvasView génère le canvas dynamiquement
```
- Fallback statique affiché pendant le scan (~2-3s)
- CanvasView utilise le retour IPC réel, plus de données hardcodées

---

## Ce qui est STUBBED / pas encore fait ❌

### Agents restants
```
packages/agents/
  mother/AgentMere.ts               — orchestrateur principal (pas créé)
  cartographer/
    SemanticLabelAgent.ts           — nommage métier des pages (pas créé)
    AmbiguityResolverAgent.ts       — résolution cas ambigus (pas créé)
  memory/
    capture/SessionRecorder.ts      — capture session (pas créé)
    extraction/FactExtractor.ts     — extraction faits via Claude (pas créé)
    storage/EpisodicStore.ts        — SQLite mémoire (pas créé)
    injection/ContextBuilder.ts     — injection contexte au démarrage (pas créé)
```

### Vraies iframes (rendu réel)
- PhoneFrameNode affiche des écrans **simulés inline**
- À terme : vraie `<iframe src="localhost:8081/[route]" />`
- Overlay d'interception de clicks : non implémenté
- Script postMessage pour identifier le composant cliqué : non fait

### Ouverture d'un vrai projet externe
- Canvas sur le projet exemple hardcodé
- Dialog "Ouvrir un projet" → scan → canvas dynamique : non fait
- Détection automatique du framework (Next.js / Expo / Vite) : non fait

### Dialog IA réel
- AIContextDialog n'applique pas de diff dans le fichier source réel
- Pas de chargement du fichier source + ligne au click

### Base de données mémoire
- SQLite non initialisé
- Pas de persistance entre sessions

---

## Architecture — règles ABSOLUES

### Deux processus Electron, deux mondes
```
Main Process (Node.js)              Renderer Process (Chromium)
──────────────────────              ───────────────────────────
Tous les agents IA                  Canvas React Flow
Appels Claude API                   Composants UI
Accès fichiers système              Dialog IA contextuel
SQLite / mémoire                    Chat global
chokidar (file watching)            AgentsPanel
simple-git                          ← IPC uniquement →
```

**JAMAIS d'appel Claude API dans le Renderer.**
**JAMAIS de require('fs') dans le Renderer.**
**Tout passe par IPC via window.rauvalio.**

### Pont IPC — window.rauvalio (preload)
```typescript
window.rauvalio.scanProject(path: string)  // → scan-project IPC
window.rauvalio.askAgent(prompt: string)   // → ask-agent IPC (stub)
window.rauvalio.getMemory()                // → get-memory IPC (stub)
window.rauvalio.onAgentEvent(callback)     // → stream événements agents
```

### Chaque agent IA a UN seul rôle
- `ASTReaderAgent` : lire le code → JSON. PAS d'IA.
- `PageIdentifierAgent` : classifier les fichiers. PAS de navigation.
- `NavigationAgent` : détecter les edges. PAS de classification.
- Un agent = un system prompt = une responsabilité.

### Stack technique
```
Framework desktop :  Electron + electron-vite
UI Renderer :        React 18 + TypeScript
Canvas :             @xyflow/react (React Flow)
Agents IA :          Anthropic SDK — claude-sonnet-4-6
AST Parser :         ts-morph
Base de données :    better-sqlite3 (SQLite embarqué) — pas encore init
File watching :      chokidar
Git :                simple-git
Build/distrib :      electron-builder
Package manager :    pnpm workspaces
```

### Variable d'environnement requise
```
ANTHROPIC_API_KEY=sk-...   # dans .env à la racine
```

---

## Prochaines étapes — ordre recommandé

### Étape A — Ouvrir un vrai projet externe 🔴 PRIORITÉ
C'est le déblocage principal : Rauvalio doit scanner N'IMPORTE quel
projet, pas juste son propre dossier screens/.

1. Dialog "Ouvrir un projet" dans TitleBar
   → `dialog.showOpenDialog({ properties: ['openDirectory'] })`
2. Passer le path au handler IPC `scan-project` existant
3. Détection du framework :
   - `next.config.js` → Next.js
   - `app.json` + `expo` dans package.json → Expo
   - `vite.config.ts` → Vite
4. ASTReaderAgent scan le dossier `src/` ou `app/` du projet externe
5. Canvas se régénère avec les vrais écrans du projet

### Étape B — SemanticLabelAgent
Ajouter au pipeline après NavigationAgent :
- Reçoit pages + edges
- Lit les textes UI (titres, labels boutons) via Claude API
- Retourne un nom métier pour chaque page
- Ex : "AuthScreen.tsx" → "Connexion"

### Étape C — Vraies iframes
Remplacer les screens simulés dans PhoneFrameNode :
1. Spawner le dev server du projet (Vite/Expo/Next) depuis Main Process
2. `<iframe src="localhost:[port]/[route]" sandbox="allow-scripts allow-same-origin" />`
3. Script injecté dans l'iframe → détecte composant cliqué → postMessage
4. Overlay transparent dans PhoneFrameNode intercepte les clicks

### Étape D — Dialog IA réel
AIContextDialog fonctionnel de bout en bout :
1. Charge le fichier source + ligne du composant cliqué
2. Injecte dans Claude avec contexte mémoire projet
3. Retourne un diff unifié
4. Applique le diff dans le fichier source réel

### Étape E — Système mémoire
Pipeline C1→C2→C3→C4 :
1. SessionRecorder capture tout pendant la session
2. FactExtractor extrait les faits via Claude en fin de session
3. EpisodicStore persiste dans SQLite (better-sqlite3)
4. ContextBuilder reconstruit le contexte au démarrage suivant

---

## Commandes
```bash
npm run dev        # Electron dev mode avec hot reload
npm run build      # Build de production
npm run typecheck  # Vérification TypeScript
```

---

## Pourquoi Rauvalio

Les devs passent 45% de leur temps à vérifier le code IA.
46% ne font pas confiance à l'output des outils actuels.
Cursor/Windsurf restent sur le paradigme fichier/éditeur/chat.

Rauvalio résout 3 problèmes uniques :
1. **Contexte visuel** — le dev voit son app, pas des fichiers
2. **IA chirurgicale** — click composant = dialog IA ciblé sur CE composant
3. **Mémoire transparente** — l'outil sait, le dev peut voir et corriger

Cible MVP : macOS → Windows → Linux.
<!-- Pushed to the "Blog design chat" project on claude.ai/design as SOURCE-OF-TRUTH.md.
     Its CLAUDE.md must point at this file: the tool refuses to write CLAUDE.md,
     which is the design agent's instruction channel and deliberately not machine-writable.
     The repo is the source of truth — edit here, then re-sync. -->

# Progetto: blog personale di Fabio

## La fonte di verità è il repo, non questo progetto

Il sito esiste, è implementato e in produzione: **github.com/fmmenchi/dev-blog**
(pubblico) → **fabiomenchicchi.com**.

Quando un mock ha bisogno di un contenuto — una bio, un progetto, un post, una
skill, un tool — quel contenuto **si prende dal repo**. Non si inventa.

I mock precedenti sono stati generati senza accesso al repo e hanno inventato
tutto, ed è costata una giornata di correzioni. Nessuna di queste cose è vera:

- Rust (non c'è una riga di Rust da nessuna parte), Neovim, tmux, Ghostty
- Torino come città, i "distributed systems", i microservizi
- i progetti `rss-gen`, `tempo`, `quaderno`, `dotfiles`
- i post su Neovim, tRPC, database append-only, microservizi
- la newsletter (non esiste), il caffè, X/Twitter
- il dominio `fabio.dev` (è `fabiomenchicchi.com`)

## I fatti veri

- **Lingua del sito: inglese.** La conversazione qui può restare in italiano.
- **Fabio Menchicchi**, full stack engineer. Nato ad Arezzo, ingegneria
  informatica a Bologna, **vive a Cusco, in Perù**. ~13 anni di esperienza.
- Lavora su un prodotto **mobile e web**: app React Native, backend NestJS,
  servizi Go, Google Cloud. Prima, dieci anni su una piattaforma enterprise di
  supply chain, dove ha creato da zero il reparto frontend. Ultimamente molto
  lavoro con **AI**.
- Skill (gli 8 badge): TypeScript, React & React Native, Node & Nest, Go & Java,
  GCP, Architecture, DX, AI.
- Contatti: **github, linkedin, mail**. Niente X.
- `$ NOW BUILDING`: _this blog — rewriting it in the open_, barra al 70%.
- Tagline: _Honest notes on architecture, tooling and developer experience._
- Contenuti reali oggi: **un progetto** (`dev-blog`, TypeScript, pubblico) e
  **un post** (_Starting a notebook_). Se una lista sembra vuota è perché lo è:
  si usano gli **stati di vuoto**, non la si riempie di finzione.

## Il design system è quello del blog, non Andes Routes

Il blog ha il suo, nel repo:

- `libs/theme` — token OKLCH su tre livelli (primitives → derived → semantic).
  I componenti toccano **solo il livello semantico**; Stylelint fa fallire la
  build su un colore o un font hardcoded. Dark-first. Accento commutabile
  (giallo / lime / ambra) a runtime: rimappa solo la famiglia `--color-primary`.
- `libs/ui` — Badge, Button, Card, Container, EmptyState, ErrorState, Link,
  Prose.
- Type: **Space Grotesk** per il testo, **JetBrains Mono** per etichette e
  metadati.

`Button` accetta un `href` opzionale e in quel caso rende un `<a>` con l'aspetto
del bottone: un'azione che naviga deve restare un link. `EmptyState` non rende
mai un `<h1>`, perché la pagina ha già il suo titolo.

**L'accessibilità è un gate di build**, non una nota di review: HTML semantico,
nome accessibile su ogni controllo, focus visibile, reduced-motion. I test
interrogano l'albero di accessibilità (per ruolo e nome accessibile) e la suite
e2e passa axe (WCAG A/AA) su ogni pagina. Un mock che non regge quel gate non è
implementabile.

## Le pagine che esistono

`/` (home: hero, colonna profilo, lista post) · `/blog` (archivio) ·
`/blog/:slug` (articolo) · `/projects` · `/about` · `/colophon` · `/uses` ·
404 · 500 · pagina di manutenzione (503).

**Niente bottoni finti**: ogni CTA deve fare qualcosa di reale. "Say hi" apre la
mail. La newsletter non esiste.

## Note di design ancora valide

- Direzione: concept **3B** — dark, accento giallo, etichette monospace, layout
  asimmetrico con colonna profilo.
- Palette: ridefinire i token **semantici** (`--color-primary`, `-hover`,
  `-active`, `-foreground`, `-subtle`, `-subtle-foreground`, `--color-ring`)
  inline sul wrapper. Sovrascrivere solo `--color-*-base` non funziona: le var
  si risolvono dove sono definite.
- Avatar del DS: `size` va passato come numero via hole (`size="{{ 60 }}"`), mai
  come stringa.
- Pagine come **file separati** collegati da link veri. Niente switcher di
  pagina nei tweak.
- Switcher dell'accento nella barra: un solo chip mono (quadratino colore +
  nome, click per ciclare giallo → lime → ambra; niente pallini stile semaforo),
  stato condiviso via `localStorage['fabio-accent']`.
- `Blog Concepts.dc.html` è l'archivio delle esplorazioni.

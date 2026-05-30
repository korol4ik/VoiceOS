# Neuro-OS

**Un système d'exploitation où l'interface est la conversation.**

L'utilisateur dit ce dont il a besoin — l'agent exécute. Fenêtres, boutons, fichiers — tout est créé à la demande et disparaît quand ce n'est plus nécessaire.

## Démarrage rapide

1. Installez [OpenClaw](https://openclaw.ai) ou tout autre agent IA.
2. Clonez le dépôt : `git clone https://github.com/korol4ik/VoiceOS`
3. Pointez votre agent vers `VoiceOS/bootstrap.md`.
4. Suivez le dialogue de configuration avec l'agent — votre bureau est prêt.

Ou pointez directement l'agent vers ce dépôt — il lira `bootstrap.md` et commencera le dialogue.

## Structure

```
VoiceOS/
├── bootstrap.md                ← instructions de premier lancement (lues par l'agent)
├── README.md
└── neuro-os/
    ├── core/                   ← personnalité de l'agent (copiée dans le workspace)
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← bureau (point d'entrée)
    ├── css/index.css           ← styles
    ├── js/
    │   ├── config.js           ← constantes
    │   ├── drag.js             ← glisser et redimensionner
    │   ├── wm.js               ← gestionnaire de fenêtres
    │   ├── channel.js          ← canal de commandes (WS)
    │   ├── ui.js               ← chat + API REST
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← initialisation
    ├── apps/                   ← applications web de l'utilisateur
    │   ├── css/
    │   └── js/
    └── user/                   ← dossier personnel de l'utilisateur
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## Principes

- **HTML+CSS+JS pur** — pas de frameworks, pas d'A2UI.
- **Neutralité d'agent** — le bootstrap est écrit en langage naturel, compatible avec tout agent IA.
- **Confidentialité** — tout est exécuté localement, les données ne quittent jamais le serveur.
- **Minimalisme** — résultat immédiat, sans étapes superflues.

## Dépendances

- Agent IA (OpenClaw, Hermes ou tout autre)
- Serveur web (nginx, OpenClaw embarqué, Caddy — au choix de l'utilisateur)
- ChromaDB (optionnel, pour la mémoire vectorielle)

## Licence
MIT

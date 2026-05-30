# Neuro-OS

**Ein Betriebssystem, bei dem die Benutzeroberfläche das Gespräch ist.**

Der Benutzer sagt, was er braucht — der Agent führt es aus. Fenster, Schaltflächen, Dateien — alles wird bei Bedarf erstellt und verschwindet, wenn es nicht mehr benötigt wird.

## Schnellstart

1. Installiere [OpenClaw](https://openclaw.ai) oder einen anderen KI-Agenten.
2. Klone das Repository: `git clone https://github.com/korol4ik/VoiceOS`
3. Weise deinen Agenten auf `VoiceOS/bootstrap.md`.
4. Gehe den Einrichtungsdialog mit dem Agenten durch — dein Desktop ist bereit.

Oder weise den Agenten direkt auf dieses Repository — er liest `bootstrap.md` und beginnt den Dialog.

## Struktur

```
VoiceOS/
├── bootstrap.md                ← Ersteinrichtungsanleitung (vom Agenten gelesen)
├── README.md
└── neuro-os/
    ├── core/                   ← Agentenpersönlichkeit (ins Workspace kopiert)
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← Desktop (Einstiegspunkt)
    ├── css/index.css           ← Stile
    ├── js/
    │   ├── config.js           ← Konstanten
    │   ├── drag.js             ← Ziehen und Größenänderung
    │   ├── wm.js               ← Fenstermanager
    │   ├── channel.js          ← Befehlskanal (WS)
    │   ├── ui.js               ← Chat + REST API
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← Initialisierung
    ├── apps/                   ← Webanwendungen des Benutzers
    │   ├── css/
    │   └── js/
    └── user/                   ← Benutzerordner
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## Prinzipien

- **Reines HTML+CSS+JS** — keine Frameworks, kein A2UI.
- **Agentenneutral** — Bootstrap ist in natürlicher Sprache verfasst, kompatibel mit jedem KI-Agenten.
- **Privatsphäre** — alles läuft lokal, Daten verlassen niemals den Server.
- **Minimalismus** — sofortiges Ergebnis, keine unnötigen Schritte.

## Abhängigkeiten

- KI-Agent (OpenClaw, Hermes oder jeder andere)
- Webserver (nginx, OpenClaw eingebettet, Caddy — nach Wahl des Benutzers)
- ChromaDB (optional, für Vektorspeicher)

## Lizenz
MIT

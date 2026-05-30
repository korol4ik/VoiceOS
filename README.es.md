# Neuro-OS

**Un sistema operativo donde la interfaz es la conversación.**

El usuario dice lo que necesita — el agente lo ejecuta. Ventanas, botones, archivos — todo se crea bajo demanda y desaparece cuando ya no se necesita.

## Inicio rápido

1. Instala [OpenClaw](https://openclaw.ai) o cualquier otro agente de IA.
2. Clona el repositorio: `git clone https://github.com/korol4ik/VoiceOS`
3. Indica a tu agente la ruta a `VoiceOS/bootstrap.md`.
4. Sigue el diálogo de configuración con el agente — tu escritorio está listo.

O simplemente apunta al agente directamente a este repositorio — leerá `bootstrap.md` e iniciará el diálogo.

## Estructura

```
VoiceOS/
├── bootstrap.md                ← instrucciones de inicio (las lee el agente)
├── README.md
└── neuro-os/
    ├── core/                   ← personalidad del agente (se copia al workspace)
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← escritorio (punto de entrada)
    ├── css/index.css           ← estilos
    ├── js/
    │   ├── config.js           ← constantes
    │   ├── drag.js             ← arrastrar y redimensionar
    │   ├── wm.js               ← gestor de ventanas
    │   ├── channel.js          ← canal de comandos (WS)
    │   ├── ui.js               ← chat + API REST
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← inicialización
    ├── apps/                   ← aplicaciones web del usuario
    │   ├── css/
    │   └── js/
    └── user/                   ← carpeta personal del usuario
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## Principios

- **HTML+CSS+JS puro** — sin frameworks, sin A2UI.
- **Neutralidad de agente** — bootstrap está escrito en lenguaje natural, funciona con cualquier agente de IA.
- **Privacidad** — todo se ejecuta localmente, los datos nunca salen del servidor.
- **Minimalismo** — resultado inmediato, sin pasos innecesarios.

## Dependencias

- Agente de IA (OpenClaw, Hermes o cualquier otro)
- Servidor web (nginx, OpenClaw embebido, Caddy — a elección del usuario)
- ChromaDB (opcional, para memoria vectorial)

## Licencia
MIT

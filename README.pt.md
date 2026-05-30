# Neuro-OS

**Um sistema operacional onde a interface é a conversa.**

O usuário diz o que precisa — o agente executa. Janelas, botões, arquivos — tudo é criado sob demanda e desaparece quando não é mais necessário.

## Início rápido

1. Instale o [OpenClaw](https://openclaw.ai) ou qualquer outro agente de IA.
2. Clone o repositório: `git clone https://github.com/korol4ik/VoiceOS`
3. Aponte seu agente para `VoiceOS/bootstrap.md`.
4. Siga o diálogo de configuração com o agente — sua área de trabalho está pronta.

Ou aponte o agente diretamente para este repositório — ele lerá `bootstrap.md` e iniciará o diálogo.

## Estrutura

```
VoiceOS/
├── bootstrap.md                ← instruções de primeiro uso (agente lê)
├── README.md
└── neuro-os/
    ├── core/                   ← personalidade do agente (copiada para o workspace)
    │   ├── AGENTS.md
    │   ├── IDENTITY.md
    │   └── SOUL.md
    ├── index.html              ← área de trabalho (ponto de entrada)
    ├── css/index.css           ← estilos
    ├── js/
    │   ├── config.js           ← constantes
    │   ├── drag.js             ← arrastar e redimensionar
    │   ├── wm.js               ← gerenciador de janelas
    │   ├── channel.js          ← canal de comandos (WS)
    │   ├── ui.js               ← chat + API REST
    │   ├── ws.js               ← WebSocket
    │   └── app.js              ← inicialização
    ├── apps/                   ← aplicações web do usuário
    │   ├── css/
    │   └── js/
    └── user/                   ← pasta pessoal do usuário
        ├── documents/
        ├── image/
        ├── video/
        └── audio/
```

## Princípios

- **HTML+CSS+JS puro** — sem frameworks, sem A2UI.
- **Neutralidade de agente** — bootstrap escrito em linguagem natural, funciona com qualquer agente de IA.
- **Privacidade** — tudo roda localmente, os dados nunca saem do servidor.
- **Minimalismo** — resultado imediato, sem etapas desnecessárias.

## Dependências

- Agente de IA (OpenClaw, Hermes ou qualquer outro)
- Servidor web (nginx, OpenClaw embutido, Caddy — escolha do usuário)
- ChromaDB (opcional, para memória vetorial)

## Licença
MIT

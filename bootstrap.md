# Neuro-OS Bootstrap

> Agent instructions. First launch of Neuro-OS.

Read this instruction fully before starting.
Every step is discussed with the user in dialog — do nothing without consent.

---

## Step 1. Greeting

Introduce yourself: "I'm Neuro-OS. I'll help set up the system."

Ask the user's name → save to `USER.md`.

## Step 2. Language

Ask: "What language should we use?"

The agent translates all `.md` files (AGENTS.md, IDENTITY.md, SOUL.md, bootstrap.md, USER.md)
into the chosen language after setup is complete.

## Step 3. Web root

Ask where to deploy Neuro-OS.

Default: `/var/www/html/neuro-os/`

If the folder exists and has `index.html` — ask: update or keep?

## Step 4. Web server

Ask: "How should we serve the page?"

Options:
1. **nginx** — classic. Agent checks `nginx -t` and reloads.
2. **OpenClaw built-in server** — no install needed.
3. **Caddy** — minimal config.
4. **Other** — user configures manually, agent only verifies via curl.

If nginx:
- Check: `which nginx`
- If missing — ask to install: `apt install nginx`
- Create or update config:
  ```
  location /neuro-os {
      alias /var/www/html/neuro-os;
      index index.html;
  }
  ```
- Verify: `nginx -t`, then reload.

After setup — open the page in browser and confirm `index.html` loads, WS indicator is green.

## Step 5. Model (LLM)

Ask: "Which model should power the system?"

1. **Local (ollama)** — check `which ollama && ollama list`. Offer to install if missing. Pick a model (llama3, qwen2.5, gemma, etc.).
2. **Remote API** — OpenAI, Anthropic, DeepSeek, any OpenClaw-compatible API. Ask for key and endpoint.
3. **Built-in OpenClaw** — already configured.

## Step 6. Memory (RAG)

Ask: "Do you need vector memory for fast responses?"

1. **ChromaDB** — check if running. Offer Docker: `docker run -d -p 8090:8000 chromadb/chroma`.
2. **None** — fine, simpler and faster.

## Step 7. Deployment

Ask: "Ready to deploy?"

If yes:
1. Create the web root (if not exists).
2. Copy all files from `VoiceOS/neuro-os/` (except `core/`) to web root.
3. If `apps/` or `user/` already exist — do not overwrite (user's personal space).
4. Replace `SESSION_KEY` in `config.js` or `index.html` with the actual agent session key.
5. Replace `password` in `ws.js` with the actual gateway password.
6. Configure web server (Step 4).
7. Open the page in browser and verify `index.html` loads, WS indicator is green.

## Step 8. Agent identity

Ask: "What should I be called? Neuro-OS or another name?"

Update `IDENTITY.md` with the chosen name and selected config (model, memory, web server).

## Step 9. Translate

Translate all `.md` files (AGENTS.md, IDENTITY.md, SOUL.md, USER.md, bootstrap.md) 
to the language chosen in Step 2.

## Step 10. Done

Congratulate the user. Ask: "Want to open the file navigator and look around? Or something else?"

---

## Notes for the agent

- **Do not delete** `bootstrap.md` — it's needed for reinstallation.
- If the user interrupts at any step — save progress in memory and resume from there next time.
- **Never touch** `apps/` — it's the user's private application space.
- **Never touch** `user/` — it's the user's home folder.
- Save settings to `/root/.openclaw/workspace/neuro-os-config.md`.

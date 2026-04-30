# Neuro-OS — архитектура и workflow

## Bootstrap (при первом запуске)

1. Скопировать `neuro-os/core/*` в `~/.neuro-os/`
2. Установить зависимости: `pip install chromadb pysqlite3-binary`
3. Настроить nginx на `/var/www/html/neuro-os/`
4. Запустить OpenClaw Gateway
5. При старте агента — прочитать `~/.neuro-os/AGENTS.md`

Без этих шагов система не работает.


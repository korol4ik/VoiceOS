// ── Config & DOM refs ──
// Agent replaces SESSION_KEY during deployment
const API_URL = '/v1/chat/completions';
const WS_URL = 'wss://' + location.hostname + '/__openclaw__/ws';
const SESSION_KEY = '***';

const desktop = document.getElementById('desktop');
const chat = document.getElementById('chat-log');
const input = document.getElementById('user-input');

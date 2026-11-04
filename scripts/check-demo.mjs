#!/usr/bin/env node
/**
 * Checks that the live demo works end to end. Run it before sending the resume:
 *
 *   npm run check:demo
 *
 * Steps: wait for the (free-tier) backend to wake up, check the database, log in with the
 * public demo account, call authenticated routes, and load the site on Vercel.
 * Exit code 0 = everything works, 1 = something failed. Plain Node, no dependencies.
 *
 * Optional environment variables:
 *   BACKEND_URL, FRONTEND_URL, WAKE_TIMEOUT_SECONDS (default 120), DEMO_EMAIL, DEMO_PASSWORD
 */
import { appendFileSync } from 'node:fs';

const BACKEND = (process.env.BACKEND_URL || 'https://everlabs-fullstack.onrender.com').replace(/\/+$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'https://everlabs-fullstack.vercel.app').replace(/\/+$/, '');
const WAKE_TIMEOUT_MS = Number(process.env.WAKE_TIMEOUT_SECONDS || 120) * 1000;
// Public demo account, documented in the README.
const EMAIL = process.env.DEMO_EMAIL || 'admin@demo.com';
const PASSWORD = process.env.DEMO_PASSWORD || 'demo12345';

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, status: ok ? 'OK' : 'FALHA', detail });
  console.log(`${ok ? '[OK]   ' : '[FALHA]'} ${name}${detail ? ' - ' + detail : ''}`);
  return ok;
}

function skip(name, reason) {
  results.push({ name, status: 'PULOU', detail: reason });
  console.log(`[PULOU] ${name} - ${reason}`);
}

async function call(url, options = {}, timeoutMs = 20_000) {
  const startedAt = Date.now();
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // not JSON (HTML error page, for example)
  }
  return { response, text, json, ms: Date.now() - startedAt };
}

const describeError = (error) => error?.cause?.code || error?.name || 'erro desconhecido';

// 1. Wake up the backend ------------------------------------------------------------------
async function waitForBackend() {
  console.log(`Backend: ${BACKEND}`);
  console.log(`Aguardando o backend responder (limite de ${WAKE_TIMEOUT_MS / 1000} s)...`);
  const startedAt = Date.now();
  let lastProblem = 'sem resposta';

  while (Date.now() - startedAt < WAKE_TIMEOUT_MS) {
    // Never let the last attempt run past the overall limit.
    const remaining = WAKE_TIMEOUT_MS - (Date.now() - startedAt);
    try {
      const { response } = await call(`${BACKEND}/health`, {}, Math.max(1_000, Math.min(10_000, remaining)));
      // Anything below 500 means the app itself answered (a 502/503/504 is the host saying "not up yet").
      if (response.status < 500) {
        return { awake: true, seconds: (Date.now() - startedAt) / 1000, status: response.status };
      }
      lastProblem = `HTTP ${response.status}`;
    } catch (error) {
      lastProblem = describeError(error);
    }
    console.log(`  ... ainda sem resposta (${Math.round((Date.now() - startedAt) / 1000)} s, ${lastProblem})`);
    if (Date.now() - startedAt >= WAKE_TIMEOUT_MS) break;
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  return { awake: false, seconds: (Date.now() - startedAt) / 1000, problem: lastProblem };
}

async function checkBackend() {
  const wake = await waitForBackend();

  if (!wake.awake) {
    record(
      'Backend acordou',
      false,
      `sem resposta em ${wake.seconds.toFixed(0)} s (${wake.problem}). Veja a seção "Solução de problemas" do README.`,
    );
    for (const step of ['Banco de dados', 'Login com a conta demo', 'Rota autenticada /users/me', 'Lista de tarefas']) {
      skip(step, 'backend não respondeu');
    }
    return;
  }

  record(
    'Backend acordou',
    wake.status === 200,
    `${wake.seconds.toFixed(1)} s até responder` + (wake.status === 200 ? '' : ` (GET /health devolveu HTTP ${wake.status}: versão sem /health?)`),
  );

  // 2. Database ---------------------------------------------------------------------------
  try {
    const { response, json, ms } = await call(`${BACKEND}/health/db`);
    record(
      'Banco de dados',
      response.status === 200,
      response.status === 200 ? `respondeu em ${ms} ms` : `HTTP ${response.status}${json?.reason ? ` (${json.reason})` : ''}`,
    );
  } catch (error) {
    record('Banco de dados', false, describeError(error));
  }

  // 3. Login ------------------------------------------------------------------------------
  let token = null;
  try {
    const { response, json, ms } = await call(
      `${BACKEND}/api/users/authenticate`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) },
      40_000,
    );
    token = json?.data?.token ?? null;
    record(
      'Login com a conta demo',
      response.status === 200 && typeof token === 'string',
      response.status === 200 ? `token recebido em ${ms} ms` : `HTTP ${response.status}${json?.message ? ` - ${json.message}` : ''}`,
    );
  } catch (error) {
    record('Login com a conta demo', false, describeError(error));
  }

  if (!token) {
    skip('Rota autenticada /users/me', 'sem token');
    skip('Lista de tarefas', 'sem token');
    return;
  }

  // 4. Authenticated routes ---------------------------------------------------------------
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const { response, json } = await call(`${BACKEND}/api/users/me`, { headers });
    record(
      'Rota autenticada /users/me',
      response.status === 200 && json?.data?.email === EMAIL,
      response.status === 200 ? `usuário ${json?.data?.email}` : `HTTP ${response.status}`,
    );
  } catch (error) {
    record('Rota autenticada /users/me', false, describeError(error));
  }

  try {
    const { response, json } = await call(`${BACKEND}/api/tasks`, { headers });
    const ok = response.status === 200 && Array.isArray(json?.data);
    record('Lista de tarefas', ok, ok ? `${json.data.length} tarefa(s)` : `HTTP ${response.status}`);
  } catch (error) {
    record('Lista de tarefas', false, describeError(error));
  }
}

// 5. Frontend -----------------------------------------------------------------------------
async function checkFrontend() {
  console.log(`Frontend: ${FRONTEND}`);
  try {
    const { response, text, ms } = await call(FRONTEND);
    const ok = response.status === 200 && text.includes('id="root"');
    record('Site no ar', ok, ok ? `HTTP 200 em ${ms} ms` : `HTTP ${response.status}`);
    if (!ok) return skip('Site aponta para o backend certo', 'página não carregou');

    const script = text.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
    if (!script) return record('Site aponta para o backend certo', false, 'não achei o script principal na página');

    const bundle = await call(new URL(script, FRONTEND + '/').toString());
    record(
      'Site aponta para o backend certo',
      bundle.text.includes(`${BACKEND}/api`),
      bundle.text.includes(`${BACKEND}/api`) ? `${BACKEND}/api` : `o bundle não contém ${BACKEND}/api (VITE_API_URL errada na Vercel?)`,
    );
  } catch (error) {
    record('Site no ar', false, describeError(error));
  }
}

// Run -------------------------------------------------------------------------------------
const startedAt = Date.now();
await checkBackend();
await checkFrontend();

const failed = results.filter((r) => r.status === 'FALHA').length;
const skipped = results.filter((r) => r.status === 'PULOU').length;
const seconds = ((Date.now() - startedAt) / 1000).toFixed(0);

console.log('\n' + '-'.repeat(60));
console.log(
  failed === 0 && skipped === 0
    ? `RESULTADO: DEMO OK (${results.length} verificações em ${seconds} s)`
    : `RESULTADO: DEMO COM PROBLEMAS (${failed} falha(s), ${skipped} etapa(s) puladas, ${seconds} s)`,
);

// In GitHub Actions, also show the table in the run summary.
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = results.map((r) => `| ${r.status} | ${r.name} | ${r.detail.replace(/\|/g, '/')} |`).join('\n');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Verificação da demo\n\n| Status | Etapa | Detalhe |\n|---|---|---|\n${rows}\n`);
}

process.exit(failed === 0 && skipped === 0 ? 0 : 1);

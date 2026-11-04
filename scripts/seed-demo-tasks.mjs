#!/usr/bin/env node
/**
 * Fills the public demo board with sample tasks, through the app's own API, logged in as
 * the demo account. A recruiter who opens the demo then sees a populated Kanban board.
 *
 *   npm run seed:demo                 create whatever is missing (safe to run again)
 *   npm run seed:demo -- --dry-run    print the plan and write nothing
 *   npm run seed:demo -- --remove     delete the sample tasks created by this script
 *
 * Tasks are matched by exact name, so running it twice never duplicates anything and
 * tasks you create yourself are never touched. Tags are shared and are kept on --remove.
 * Plain Node, no dependencies.
 *
 * Optional environment variables: BACKEND_URL, DEMO_EMAIL, DEMO_PASSWORD
 */

const BACKEND = (process.env.BACKEND_URL || 'https://everlabs-fullstack.onrender.com').replace(/\/+$/, '');
const EMAIL = process.env.DEMO_EMAIL || 'admin@demo.com';
const PASSWORD = process.env.DEMO_PASSWORD || 'demo12345';

const DRY_RUN = process.argv.includes('--dry-run');
const REMOVE = process.argv.includes('--remove');

// Days relative to "today", so the board always looks current.
const day = (offset) => new Date(Date.now() + offset * 86_400_000).toISOString();

// Real work on this project, so the board tells the truth: what is in the open pull request is
// "in progress" or "in review", never "done".
const SAMPLE_TASKS = [
  // ---- A fazer (TODO)
  {
    name: 'Guardar anexos em armazenamento persistente',
    description:
      'Hoje os arquivos anexados ficam no disco do servidor, que é efêmero no plano gratuito do Render e se perde a cada deploy. Avaliar Supabase Storage ou Cloudinary.',
    priority: 8, status: 'TODO', start: 2, end: 14, tags: ['Backend', 'DevOps'],
    comments: ['Limitação já documentada no README. Supabase Storage evita criar mais uma conta.'],
  },
  {
    name: 'Adicionar filtro por responsável no quadro',
    description: 'Permitir que o admin filtre o Kanban por pessoa responsável e por prioridade.',
    priority: 4, status: 'TODO', start: 5, end: 20, tags: ['Frontend'], comments: [],
  },
  {
    name: 'Testes de integração das rotas de tarefas',
    description: 'Cobrir criação, atualização de status e permissões de Admin e User com um banco de teste.',
    priority: 5, status: 'TODO', start: 7, end: 25, tags: ['Backend', 'Testes'], comments: [],
  },
  // ---- Em andamento (IN_PROGRESS)
  {
    name: 'Aviso de "servidor acordando" no login',
    description:
      'O backend gratuito dorme após 15 minutos sem acesso e leva cerca de 1 minuto para acordar. O login avisa o visitante e tenta de novo sozinho, em vez de falhar.',
    priority: 7, status: 'IN_PROGRESS', start: -2, end: 3, tags: ['Frontend'],
    comments: ['Aquecimento do /health ao abrir o app e nova tentativa com espera progressiva por até 90 s.'],
  },
  {
    name: 'Respostas 503 claras quando o banco está fora',
    description: 'Falhar rápido e com mensagem legível quando o banco de dados não responde, em vez de deixar a requisição pendurada.',
    priority: 8, status: 'IN_PROGRESS', start: -2, end: 3, tags: ['Backend'], comments: [],
  },
  // ---- Em revisão (REVIEW)
  {
    name: 'Verificação diária da demo (GitHub Actions)',
    description:
      'Workflow agendado que acorda o backend, faz login com a conta demo e confere o site. Gera atividade no banco, o que evita a pausa do Supabase gratuito após 7 dias.',
    priority: 7, status: 'REVIEW', start: -3, end: 1, tags: ['DevOps'],
    comments: ['Mesma checagem do comando npm run check:demo.'],
  },
  {
    name: 'Documentar a API no Swagger',
    description: 'Manter o Swagger em /api-docs atualizado com os endpoints de saúde (/health e /health/db).',
    priority: 3, status: 'REVIEW', start: -4, end: 2, tags: ['Docs'], comments: [],
  },
  // ---- Concluído (DONE)
  {
    name: 'Publicar o app (Vercel + Render + Supabase)',
    description: 'Frontend na Vercel, API no Render e PostgreSQL no Supabase, tudo em planos gratuitos, com conta de demonstração.',
    priority: 9, status: 'DONE', start: -30, end: -25, tags: ['DevOps'],
    comments: ['Demo no ar. Login de demonstração documentado no README.'],
  },
  {
    name: 'Quadro Kanban com arrastar e soltar',
    description: 'Colunas A fazer, Em andamento, Em revisão e Concluído, com drag-and-drop nativo (sem biblioteca externa).',
    priority: 8, status: 'DONE', start: -60, end: -45, tags: ['Frontend'], comments: [],
  },
  {
    name: 'Autenticação JWT com perfis Admin e User',
    description: 'Login com token JWT e autorização por perfil: o Admin gerencia tarefas, o User atualiza as próprias.',
    priority: 9, status: 'DONE', start: -75, end: -60, tags: ['Backend'], comments: [],
  },
];

async function api(path, { method = 'GET', body, token, timeoutMs = 30_000 } = {}) {
  const response = await fetch(`${BACKEND}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // not JSON
  }
  if (!response.ok) {
    const error = new Error(`${method} ${path} -> HTTP ${response.status}${json?.message ? ` (${json.message})` : ''}`);
    error.status = response.status;
    throw error;
  }
  return json;
}

// The free-tier backend may be asleep: retry on network errors and 5xx, fail fast on 4xx.
async function login() {
  const deadline = Date.now() + 120_000;
  for (;;) {
    try {
      const { data } = await api('/api/users/authenticate', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
      return { token: data.token, userId: data.user.id };
    } catch (error) {
      const transient = error.status === undefined || error.status >= 500;
      if (!transient || Date.now() > deadline) throw error;
      console.log(`  ... backend ainda não respondeu (${error.status ?? error.cause?.code ?? error.name}); tentando de novo em 5 s`);
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }
}

const countByStatus = (tasks) =>
  ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((s) => `${s}=${tasks.filter((t) => t.status === s).length}`).join('  ');

async function main() {
  console.log(`Backend: ${BACKEND}${DRY_RUN ? '  (DRY RUN: nada será gravado)' : ''}`);
  const { token, userId } = await login();
  console.log(`Login ok como ${EMAIL}`);

  const existing = (await api('/api/tasks', { token })).data;
  console.log(`Tarefas hoje no quadro: ${existing.length}  (${countByStatus(existing)})`);
  const byName = new Map(existing.map((t) => [t.name, t]));

  if (REMOVE) {
    const mine = SAMPLE_TASKS.filter((t) => byName.has(t.name));
    for (const sample of mine) {
      console.log(`${DRY_RUN ? '[plano] ' : ''}remover: ${sample.name}`);
      if (!DRY_RUN) await api(`/api/tasks/${byName.get(sample.name).id}`, { method: 'DELETE', token });
    }
    console.log(`\n${DRY_RUN ? 'Removeria' : 'Removidas'} ${mine.length} tarefa(s) de exemplo.`);
    return;
  }

  const missing = SAMPLE_TASKS.filter((t) => !byName.has(t.name));
  const neededTags = [...new Set(missing.flatMap((t) => t.tags))];

  if (missing.length === 0) {
    console.log('\nTodas as tarefas de exemplo já existem. Nada a fazer.');
    return;
  }

  // Tags are global: reuse the ones that exist, create only the missing ones.
  const tagIds = new Map((await api('/api/tags', { token })).data.map((t) => [t.name, t.id]));
  for (const name of neededTags.filter((n) => !tagIds.has(n))) {
    console.log(`${DRY_RUN ? '[plano] ' : ''}criar tag: ${name}`);
    if (!DRY_RUN) tagIds.set(name, (await api('/api/tags', { method: 'POST', token, body: { name } })).data.id);
  }

  for (const sample of missing) {
    console.log(`${DRY_RUN ? '[plano] ' : ''}criar [${sample.status}] ${sample.name}  (prioridade ${sample.priority}, tags: ${sample.tags.join(', ')}, ${sample.comments.length} comentário(s))`);
    if (DRY_RUN) continue;

    const created = (
      await api('/api/tasks', {
        method: 'POST',
        token,
        body: {
          name: sample.name,
          description: sample.description,
          priority: sample.priority,
          startDate: day(sample.start),
          endDate: day(sample.end),
          assigneeId: userId,
        },
      })
    ).data;

    if (sample.status !== 'TODO') {
      await api(`/api/tasks/${created.id}/status`, { method: 'PATCH', token, body: { status: sample.status } });
    }
    for (const tag of sample.tags) {
      await api(`/api/tags/tasks/${created.id}/tags/${tagIds.get(tag)}`, { method: 'POST', token });
    }
    for (const content of sample.comments) {
      await api(`/api/tasks/${created.id}/comments`, { method: 'POST', token, body: { content } });
    }
  }

  if (DRY_RUN) {
    console.log(`\nPlano: criaria ${missing.length} tarefa(s) e ${neededTags.filter((n) => !tagIds.has(n)).length} tag(s). Nada foi gravado.`);
    return;
  }

  const after = (await api('/api/tasks', { token })).data;
  console.log(`\nPronto. Quadro agora: ${after.length} tarefa(s)  (${countByStatus(after)})`);
}

main().catch((error) => {
  console.error(`\nFALHOU: ${error.message}`);
  process.exit(1);
});

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const questionsSource = fs.readFileSync(
  path.join(__dirname, '..', 'questions.js'),
  'utf8'
);
eval(questionsSource.replace('const QUESTIONS', 'var QUESTIONS'));

const MIN_Q = 6;
const MIN_Q_IG = 12;
const IG_MIN = 0.015;
const MAX_Q_HARD = 20;
const LEVELS = ['Básico', 'Medio', 'Avanzado'];
const DIFF_LABELS = ['Fácil', 'Media', 'Difícil'];
const B_MAX = Math.max(...QUESTIONS.map(q => Math.abs(q.dificultad)));
const THETA_SCALE = B_MAX * 2;
const NIVELES = [
  { nombre: 'Básico', theta: -THETA_SCALE },
  { nombre: 'Medio', theta: 0 },
  { nombre: 'Avanzado', theta: THETA_SCALE },
];
const SENSIBILIDAD = 1.5;

function parseArgs(argv) {
  const options = {
    runs: 5000,
    observedRuns: 2000,
    seed: 12345,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--runs') options.runs = Number(argv[++i]);
    else if (arg === '--observed-runs') options.observedRuns = Number(argv[++i]);
    else if (arg === '--seed') options.seed = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Opción no reconocida: ${arg}`);
    }
  }

  if (!Number.isFinite(options.runs) || options.runs <= 0) {
    throw new Error('--runs debe ser un entero positivo');
  }
  if (!Number.isFinite(options.observedRuns) || options.observedRuns <= 0) {
    throw new Error('--observed-runs debe ser un entero positivo');
  }
  if (!Number.isFinite(options.seed)) {
    throw new Error('--seed debe ser numérico');
  }

  return options;
}

function printHelp() {
  console.log(
    [
      'Uso: node scripts/simulate.js [opciones]',
      '',
      'Opciones:',
      '  --runs N            Monte Carlo por nivel (por defecto: 5000)',
      '  --observed-runs N   Respondedores aleatorios para buscar caminos largos (por defecto: 2000)',
      '  --seed N            Semilla base reproducible (por defecto: 12345)',
    ].join('\n')
  );
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 2 ** 32);
}

function probabilidadAcierto(theta, dificultad, opciones, sensibilidad = SENSIBILIDAD) {
  const c = opciones && opciones > 0 ? 1 / opciones : 0;
  const logistica = 1 / (1 + Math.exp(-sensibilidad * (theta - dificultad)));
  return c + (1 - c) * logistica;
}

function generarVerosimilitudes(pregunta, niveles = NIVELES, sensibilidad = SENSIBILIDAD) {
  return niveles.map(nivel => {
    const acierto = probabilidadAcierto(
      nivel.theta,
      pregunta.dificultad,
      pregunta.opciones,
      sensibilidad
    );
    return { nivel: nivel.nombre, acierto, fallo: 1 - acierto };
  });
}

function entropy(dist) {
  return -dist.reduce((h, p) => h + (p > 1e-12 ? p * Math.log2(p) : 0), 0);
}

const H_STOP = entropy([0.80, 0.10, 0.10]);

function gananciaInformacion(prior, pregunta) {
  const veros = generarVerosimilitudes(pregunta);
  const pAcierto = prior.reduce((sum, p, i) => sum + p * veros[i].acierto, 0);
  const pFallo = 1 - pAcierto;
  const rawA = prior.map((p, i) => p * veros[i].acierto);
  const rawF = prior.map((p, i) => p * veros[i].fallo);
  const sumA = rawA.reduce((a, b) => a + b, 0);
  const sumF = rawF.reduce((a, b) => a + b, 0);
  const postA = rawA.map(v => v / sumA);
  const postF = rawF.map(v => v / sumF);
  return entropy(prior) - (pAcierto * entropy(postA) + pFallo * entropy(postF));
}

function bestInformationGain(prior, pool) {
  let best = -Infinity;
  for (const question of pool) {
    best = Math.max(best, gananciaInformacion(prior, question));
  }
  return pool.length ? best : 0;
}

function updatePrior(prior, pregunta, isCorrect) {
  const veros = generarVerosimilitudes(pregunta);
  const raw = prior.map((p, i) => p * (isCorrect ? veros[i].acierto : veros[i].fallo));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map(v => v / sum);
}

function shouldStop(prior, answered) {
  return answered >= MIN_Q && entropy(prior) < H_STOP && Math.max(...prior) >= 0.80;
}

function shouldStopLowGain(prior, answered, pool) {
  return answered >= MIN_Q_IG && bestInformationGain(prior, pool) < IG_MIN;
}

function bestLevel(prior) {
  return prior.indexOf(Math.max(...prior));
}

function selectNext(prior, askedIds, history, rng = Math.random) {
  const available = QUESTIONS.filter(q => !askedIds.has(q.id));
  if (!available.length) return null;

  const catCount = {};
  history.forEach(h => {
    catCount[h.cat] = (catCount[h.cat] || 0) + 1;
  });

  const gains = available.map(q => gananciaInformacion(prior, q));
  const maxGain = Math.max(...gains);
  const candidates = available.filter((_, i) => gains[i] >= maxGain - 1e-9);
  const weights = candidates.map(q => 1 / (1 + (catCount[q.cat] || 0)));
  const total = weights.reduce((sum, w) => sum + w, 0);

  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function selectNextDeterministic(prior, askedIds, history) {
  return selectNext(prior, askedIds, history, () => 0);
}

function runSession(answerFn, rng) {
  let prior = [1 / 3, 1 / 3, 1 / 3];
  const askedIds = new Set();
  const history = [];

  while (true) {
    const available = QUESTIONS.filter(q => !askedIds.has(q.id));
    if (history.length >= MAX_Q_HARD) break;
    if (shouldStopLowGain(prior, history.length, available)) break;

    const question = selectNext(prior, askedIds, history, rng);
    if (!question) break;

    askedIds.add(question.id);
    const isCorrect = answerFn(question, prior, history, rng);
    prior = updatePrior(prior, question, isCorrect);

    history.push({
      n: history.length + 1,
      id: question.id,
      q: question.q,
      cat: question.cat,
      diff: question.diff,
      ok: isCorrect,
      prior: [...prior],
      H: entropy(prior),
      level: LEVELS[bestLevel(prior)],
    });

    if (shouldStop(prior, history.length)) break;
  }

  return history;
}

function summarize(rows) {
  const counts = [0, 0, 0];
  rows.forEach(r => counts[r.diff]++);
  const last = rows.at(-1);
  return {
    preguntas: rows.length,
    dificultad: counts.map((n, i) => `${DIFF_LABELS[i]}:${n}`).join(' '),
    nivel: last.level,
    confianza: `${(Math.max(...last.prior) * 100).toFixed(1)}%`,
    entropia: last.H.toFixed(3),
    firme: shouldStop(last.prior, rows.length),
    secuencia: rows.map(r => `${r.ok ? '+' : '-'}${r.diff}`).join(' '),
  };
}

function stochasticResponder(levelIdx, rng) {
  const theta = NIVELES[levelIdx].theta;
  return q => rng() < probabilidadAcierto(theta, q.dificultad, q.opciones);
}

function randomResponder(rng) {
  return () => rng() < 0.5;
}

function monteCarlo(levelIdx, runs, seedBase) {
  const stats = {
    totalQuestions: 0,
    firm: 0,
    predicted: [0, 0, 0],
    diffCounts: [0, 0, 0],
    withHard: 0,
    exhausted: 0,
    maxObservedLen: 0,
  };

  for (let i = 0; i < runs; i++) {
    const rng = lcg(seedBase + levelIdx * 100000 + i + 1);
    const rows = runSession(stochasticResponder(levelIdx, rng), rng);
    const last = rows.at(-1);

    stats.totalQuestions += rows.length;
    if (shouldStop(last.prior, rows.length)) stats.firm++;
    stats.predicted[bestLevel(last.prior)]++;
    rows.forEach(row => stats.diffCounts[row.diff]++);
    if (rows.some(row => row.diff === 2)) stats.withHard++;
    if (rows.length === QUESTIONS.length) stats.exhausted++;
    if (rows.length > stats.maxObservedLen) stats.maxObservedLen = rows.length;
  }

  return {
    mediaPreguntas: +(stats.totalQuestions / runs).toFixed(2),
    firmesPct: +(stats.firm / runs * 100).toFixed(1),
    prediccionPct: stats.predicted.map(n => +(n / runs * 100).toFixed(1)),
    preguntasPorDificultadPct: stats.diffCounts.map(n => +(n / stats.totalQuestions * 100).toFixed(1)),
    sesionesConDificilesPct: +(stats.withHard / runs * 100).toFixed(1),
    agotaronBanco: stats.exhausted,
    maxLongitudObservada: stats.maxObservedLen,
  };
}

function searchLongestObserved(runs, seedBase) {
  let longest = [];
  for (let i = 0; i < runs; i++) {
    const rng = lcg(seedBase + i + 1);
    const rows = runSession(randomResponder(rng), rng);
    if (rows.length > longest.length) longest = rows;
  }
  return longest;
}

const QUESTION_GROUPS = Object.values(QUESTIONS.reduce((groups, q) => {
  const key = `${q.diff}|${q.dificultad}|${q.opciones}`;
  if (!groups[key]) {
    groups[key] = {
      diff: q.diff,
      dificultad: q.dificultad,
      opciones: q.opciones,
      count: 0,
      cat: q.cat,
    };
  }
  groups[key].count++;
  return groups;
}, {}));

function computeMaxQ() {
  const cache = new Map();
  const EPS = 1e-9;

  function posteriorAfter(priorDist, questionGroup, isCorrect) {
    return updatePrior(priorDist, questionGroup, isCorrect);
  }

  function maxAdditional(priorDist, counts, answeredCount) {
    const pool = QUESTION_GROUPS.filter((_, i) => counts[i] > 0);
    if (
      answeredCount >= MAX_Q_HARD ||
      shouldStop(priorDist, answeredCount) ||
      shouldStopLowGain(priorDist, answeredCount, pool) ||
      counts.every(c => c === 0)
    ) return 0;

    const key = [
      answeredCount,
      counts.join(','),
      priorDist.map(p => p.toPrecision(12)).join(','),
    ].join('|');
    if (cache.has(key)) return cache.get(key);

    let bestGain = -Infinity;
    let bestGroupIndexes = [];
    for (let i = 0; i < QUESTION_GROUPS.length; i++) {
      if (counts[i] <= 0) continue;
      const gain = gananciaInformacion(priorDist, QUESTION_GROUPS[i]);
      if (gain > bestGain + EPS) {
        bestGain = gain;
        bestGroupIndexes = [i];
      } else if (gain >= bestGain - EPS) {
        bestGroupIndexes.push(i);
      }
    }

    let worst = 0;
    for (const groupIndex of bestGroupIndexes) {
      const nextCounts = [...counts];
      nextCounts[groupIndex]--;
      const question = QUESTION_GROUPS[groupIndex];
      for (const isCorrect of [true, false]) {
        const nextPrior = posteriorAfter(priorDist, question, isCorrect);
        worst = Math.max(worst, 1 + maxAdditional(nextPrior, nextCounts, answeredCount + 1));
      }
    }

    cache.set(key, worst);
    return worst;
  }

  const uniform = [1 / 3, 1 / 3, 1 / 3];
  const initialCounts = QUESTION_GROUPS.map(g => g.count);
  return maxAdditional(uniform, initialCounts, 0);
}

function longestTheoreticalPath() {
  const memo = new Map();

  function solve(prior, counts, answered, history) {
    const pool = QUESTION_GROUPS.filter((_, i) => counts[i] > 0);
    if (
      answered >= MAX_Q_HARD ||
      shouldStop(prior, answered) ||
      shouldStopLowGain(prior, answered, pool) ||
      counts.every(c => c === 0)
    ) {
      return { len: 0, path: [] };
    }

    const key = [
      answered,
      counts.join(','),
      prior.map(p => p.toPrecision(12)).join(','),
      history.join(','),
    ].join('|');
    if (memo.has(key)) return memo.get(key);

    const askedIds = new Set();
    const fakeHistory = history.map(cat => ({ cat }));
    const available = [];
    for (let i = 0; i < QUESTION_GROUPS.length; i++) {
      if (counts[i] > 0) {
        available.push({
          id: i,
          diff: QUESTION_GROUPS[i].diff,
          dificultad: QUESTION_GROUPS[i].dificultad,
          opciones: QUESTION_GROUPS[i].opciones,
          cat: QUESTION_GROUPS[i].cat,
        });
      }
    }

    const catCount = {};
    fakeHistory.forEach(h => {
      catCount[h.cat] = (catCount[h.cat] || 0) + 1;
    });

    const gains = available.map(q => gananciaInformacion(prior, q));
    const maxGain = Math.max(...gains);
    const candidates = available.filter((_, i) => gains[i] >= maxGain - 1e-9);
    const weights = candidates.map(q => 1 / (1 + (catCount[q.cat] || 0)));

    let choice = candidates[0];
    let weight = weights[0];
    for (let i = 1; i < candidates.length; i++) {
      if (weights[i] > weight || (weights[i] === weight && candidates[i].id < choice.id)) {
        choice = candidates[i];
        weight = weights[i];
      }
    }

    const best = { len: -1, path: [] };
    for (const isCorrect of [true, false]) {
      const nextPrior = updatePrior(prior, choice, isCorrect);
      const nextCounts = [...counts];
      nextCounts[choice.id]--;
      const tail = solve(nextPrior, nextCounts, answered + 1, [...history, choice.cat]);
      const step = {
        n: answered + 1,
        diff: choice.diff,
        cat: choice.cat,
        ok: isCorrect,
        nivel: LEVELS[bestLevel(nextPrior)],
        confianza: `${(Math.max(...nextPrior) * 100).toFixed(1)}%`,
        entropia: nextPrior ? entropy(nextPrior).toFixed(3) : '0.000',
      };
      const candidate = { len: 1 + tail.len, path: [step, ...tail.path] };
      if (candidate.len > best.len) {
        best.len = candidate.len;
        best.path = candidate.path;
      }
    }

    memo.set(key, best);
    return best;
  }

  return solve([1 / 3, 1 / 3, 1 / 3], QUESTION_GROUPS.map(g => g.count), 0, []);
}

function printSection(title) {
  console.log(`\n${title}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  printSection('Casos deterministas');
  const deterministicCases = {
    'todo correcto': () => true,
    'todo incorrecto': () => false,
    'alterno + -': (_q, _prior, history) => history.length % 2 === 0,
    'alterno - +': (_q, _prior, history) => history.length % 2 === 1,
    'falla 2 luego acierta': (_q, _prior, history) => history.length >= 2,
    'acierta 2 luego falla': (_q, _prior, history) => history.length < 2,
  };
  Object.entries(deterministicCases).forEach(([name, answerFn]) => {
    const rows = runSession(answerFn, lcg(options.seed));
    console.log(`${name}:`, summarize(rows));
  });

  printSection(`Monte Carlo (${options.runs} sesiones por nivel)`);
  LEVELS.forEach((level, i) => {
    console.log(`${level}:`, monteCarlo(i, options.runs, options.seed));
  });

  printSection('Peor caso teórico con la política actual');
  const longest = longestTheoreticalPath();
  console.log({
    maxQHard: MAX_Q_HARD,
    maxQTheoretical: computeMaxQ(),
    maxQPractical: Math.min(computeMaxQ(), MAX_Q_HARD),
    longitud: longest.len,
    primeros20: longest.path.slice(0, 20),
    ultimos10: longest.path.slice(-10),
  });

  printSection(`Camino largo observado (${options.observedRuns} respondedores aleatorios)`);
  const longestObserved = searchLongestObserved(options.observedRuns, options.seed + 999999);
  console.log(summarize(longestObserved));
  console.log({
    primeros25: longestObserved.slice(0, 25).map(r =>
      `${r.n}:${r.ok ? '+' : '-'}${r.diff}:${r.cat}:${Math.round(Math.max(...r.prior) * 100)}%`
    ),
    ultimos10: longestObserved.slice(-10).map(r =>
      `${r.n}:${r.ok ? '+' : '-'}${r.diff}:${r.cat}:${Math.round(Math.max(...r.prior) * 100)}%`
    ),
  });
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

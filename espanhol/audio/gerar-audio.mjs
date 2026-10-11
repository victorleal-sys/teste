#!/usr/bin/env node
// Gera o áudio das frases em espanhol com a voz de IA do Gemini (Google AI Studio).
//
// Uso:
//   GEMINI_API_KEY=... node espanhol/audio/gerar-audio.mjs <frases> [opções]
//
// <frases>: um arquivo JSON com uma lista de frases ({id, es}) ou uma pasta com um
// arquivo <id>.json por frase (formato do `ArtifactData` com `out_dir`).
//
// Opções:
//   --vozes Kore,Puck      vozes do Gemini; com mais de uma, gera um arquivo por voz (amostras)
//   --ids a1-001,a2-003    só estas frases
//   --limite 3             no máximo N frases
//   --modelo NOME          modelo de voz; sem ele, escolhe um modelo "tts" da lista da API
//   --instrucao "..."      texto antes da frase, que define sotaque e tom
//   --saida DIR            pasta dos arquivos (padrão: espanhol/audio/out)
//
// Saída: <saida>/<id>.mp3 (ou <id>__<voz>.mp3 com várias vozes) e <saida>/manifest.json.
// Sem ffmpeg, grava .wav.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const API = 'https://generativelanguage.googleapis.com/v1beta';
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const INSTRUCAO_PADRAO =
  'Leé en voz alta con acento rioplatense de Buenos Aires, tono natural y conversacional, velocidad normal, sin agregar nada:';

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) o[a.slice(2)] = argv[++i];
    else o._.push(a);
  }
  return o;
}

function lerFrases(origem) {
  const st = fs.statSync(origem);
  if (st.isDirectory()) {
    return fs.readdirSync(origem)
      .filter((n) => n.endsWith('.json'))
      .map((n) => ({ id: n.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(origem, n), 'utf8')) }));
  }
  const dados = JSON.parse(fs.readFileSync(origem, 'utf8'));
  if (!Array.isArray(dados)) throw new Error(`${origem} não contém uma lista de frases.`);
  return dados;
}

function temFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

function wav(pcm, taxa) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(taxa, 24); h.writeUInt32LE(taxa * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export function gravarAudio(pcm, taxa, destinoSemExt, usarFfmpeg) {
  if (usarFfmpeg) {
    const bruto = destinoSemExt + '.pcm';
    fs.writeFileSync(bruto, pcm);
    try {
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(taxa), '-ac', '1', '-i', bruto,
        '-codec:a', 'libmp3lame', '-b:a', '64k', destinoSemExt + '.mp3']);
    } finally {
      fs.rmSync(bruto, { force: true });
    }
    return destinoSemExt + '.mp3';
  }
  fs.writeFileSync(destinoSemExt + '.wav', wav(pcm, taxa));
  return destinoSemExt + '.wav';
}

async function chamar(url, chave, corpo) {
  for (let tentativa = 1; ; tentativa++) {
    const r = await fetch(url, {
      method: corpo ? 'POST' : 'GET',
      headers: { 'x-goog-api-key': chave, 'content-type': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined
    });
    if (r.ok) return r.json();
    const texto = await r.text();
    if ((r.status === 429 || r.status >= 500) && tentativa < 5) {
      const espera = 2000 * 2 ** (tentativa - 1);
      console.error(`  ${r.status}; nova tentativa em ${espera / 1000}s`);
      await new Promise((ok) => setTimeout(ok, espera));
      continue;
    }
    throw new Error(`HTTP ${r.status}: ${texto.slice(0, 400)}`);
  }
}

async function escolherModelo(chave) {
  const lista = await chamar(`${API}/models?pageSize=1000`, chave);
  const nomes = (lista.models || []).map((m) => m.name.replace(/^models\//, '')).filter((n) => /tts/i.test(n));
  if (!nomes.length) throw new Error('A API não listou nenhum modelo de voz (tts). Passe --modelo.');
  nomes.sort((a, b) => (/flash/.test(b) - /flash/.test(a)) || (/preview/.test(a) - /preview/.test(b)) || b.localeCompare(a));
  return nomes[0];
}

async function sintetizar(chave, modelo, voz, texto) {
  const r = await chamar(`${API}/models/${modelo}:generateContent`, chave, {
    contents: [{ parts: [{ text: texto }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } }
    }
  });
  const parte = r.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!parte) throw new Error(`Resposta sem áudio: ${JSON.stringify(r).slice(0, 300)}`);
  const taxa = Number((/rate=(\d+)/.exec(parte.inlineData.mimeType || '') || [])[1]) || 24000;
  return { pcm: Buffer.from(parte.inlineData.data, 'base64'), taxa };
}

async function main() {
  const o = args(process.argv.slice(2));
  const chave = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!o._[0]) throw new Error('Informe o arquivo ou a pasta de frases.');
  if (!chave) throw new Error('Defina GEMINI_API_KEY (chave do Google AI Studio).');

  let frases = lerFrases(o._[0]).filter((f) => f && f.id && typeof f.es === 'string');
  if (o.ids) { const ids = new Set(o.ids.split(',')); frases = frases.filter((f) => ids.has(f.id)); }
  if (o.limite) frases = frases.slice(0, Number(o.limite));
  const vozes = (o.vozes || 'Kore').split(',').map((v) => v.trim()).filter(Boolean);
  const saida = o.saida || path.join(AQUI, 'out');
  const instrucao = o.instrucao || INSTRUCAO_PADRAO;
  fs.mkdirSync(saida, { recursive: true });
  const usarFfmpeg = temFfmpeg();
  const modelo = o.modelo || await escolherModelo(chave);
  console.error(`Modelo: ${modelo} · vozes: ${vozes.join(', ')} · ${frases.length} frase(s) · ${usarFfmpeg ? 'mp3' : 'wav'}`);

  const manifestoPath = path.join(saida, 'manifest.json');
  const manifesto = fs.existsSync(manifestoPath) ? JSON.parse(fs.readFileSync(manifestoPath, 'utf8')) : [];
  const ja = new Set(manifesto.map((m) => m.arquivo));
  let feitas = 0, falhas = 0;
  for (const f of frases) {
    for (const voz of vozes) {
      const base = vozes.length > 1 ? `${f.id}__${voz}` : f.id;
      const existente = ['.mp3', '.wav'].map((e) => path.join(saida, base + e)).find((p) => fs.existsSync(p));
      if (existente && ja.has(path.basename(existente))) continue;
      try {
        const { pcm, taxa } = await sintetizar(chave, modelo, voz, `${instrucao} ${f.es}`);
        const arq = gravarAudio(pcm, taxa, path.join(saida, base), usarFfmpeg);
        manifesto.push({ id: f.id, es: f.es, voz, modelo, arquivo: path.basename(arq), segundos: Math.round((pcm.length / 2 / taxa) * 10) / 10 });
        fs.writeFileSync(manifestoPath, JSON.stringify(manifesto, null, 2));
        feitas++;
        console.error(`  ok ${base} (${manifesto[manifesto.length - 1].segundos}s)`);
      } catch (e) {
        falhas++;
        console.error(`  FALHOU ${base}: ${e.message}`);
      }
      await new Promise((ok) => setTimeout(ok, 400));
    }
  }
  console.error(`Pronto: ${feitas} gerado(s), ${falhas} falha(s). Manifesto: ${manifestoPath}`);
  if (falhas) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}

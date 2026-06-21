#!/usr/bin/env node
/**
 * Importa as perguntas de uma planilha do Google Sheets (publicada como CSV)
 * e grava em questions.json — roda automaticamente antes do build (prebuild).
 *
 * Configuração por variável de ambiente (use .env / .env.local):
 *   QUIZ_SHEET_CSV_URL  URL completa do CSV publicado, OU
 *   QUIZ_SHEET_ID       ID da planilha (+ QUIZ_SHEET_GID opcional, padrão 0)
 *
 * Como publicar: no Google Sheets, Arquivo > Compartilhar > Publicar na web
 * > escolha a aba > formato CSV. Cole a URL em QUIZ_SHEET_CSV_URL.
 *
 * Colunas esperadas (cabeçalho na 1ª linha; aceita PT ou EN, sem diferenciar
 * maiúsculas/acentos):
 *   category | question | optionA | optionB | optionC | optionD? | correct | funFact
 *   (aliases: categoria, pergunta, opcaoA..., correta/resposta/gabarito,
 *    curiosidade/fato)
 *   - correct: a LETRA da alternativa certa (A, B, C...), o número (1 = primeira)
 *     ou o texto exato da resposta.
 *
 * Filosofia: nunca quebra o build. Se a planilha não estiver configurada ou
 * falhar, mantém o questions.json existente como fallback.
 */

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, "..", "questions.json")

const LETTERS = ["A", "B", "C", "D", "E"]

function log(msg) {
  console.log(`[questions] ${msg}`)
}

/* ---- CSV parser (campos com aspas, vírgulas e quebras de linha) ---------- */
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (c !== "\r") {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/* normaliza cabeçalho: minúsculo, sem acento, sem espaços/_ */
function norm(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s_]+/g, "")
}

function buildHeaderIndex(headerRow) {
  const idx = {}
  headerRow.forEach((h, i) => {
    idx[norm(h)] = i
  })
  return idx
}

function pick(idx, row, keys) {
  for (const k of keys) {
    if (idx[k] !== undefined) {
      const v = row[idx[k]]
      if (v !== undefined && v.trim() !== "") return v.trim()
    }
  }
  return ""
}

function collectOptions(idx, row) {
  const options = []
  for (const L of LETTERS) {
    const l = L.toLowerCase()
    const val = pick(idx, row, [`option${l}`, `opcao${l}`, `alternativa${l}`, l])
    if (val) options.push(val)
  }
  return options
}

function resolveCorrect(raw, options) {
  const v = (raw || "").trim()
  if (!v) return -1
  // letra A-E
  if (/^[a-eA-E]$/.test(v)) {
    const i = v.toUpperCase().charCodeAt(0) - 65
    return i < options.length ? i : -1
  }
  // número (1 = primeira opção)
  if (/^\d+$/.test(v)) {
    const n = parseInt(v, 10)
    if (n >= 1 && n <= options.length) return n - 1
    if (n === 0 && options.length > 0) return 0
    return -1
  }
  // texto exato da resposta
  const match = options.findIndex((o) => norm(o) === norm(v))
  return match
}

function rowsToQuestions(rows) {
  if (rows.length < 2) return []
  const idx = buildHeaderIndex(rows[0])
  const questions = []
  let skipped = 0

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((c) => (c || "").trim() === "")) continue // linha vazia

    const category = pick(idx, row, ["category", "categoria", "tema"])
    const question = pick(idx, row, ["question", "pergunta"])
    const funFact = pick(idx, row, ["funfact", "curiosidade", "fato", "vocesabia"])
    const options = collectOptions(idx, row)
    const correctOption = resolveCorrect(
      pick(idx, row, ["correct", "correctoption", "correta", "resposta", "gabarito"]),
      options
    )

    if (!category || !question || !funFact || options.length < 2 || correctOption < 0) {
      skipped++
      continue
    }
    questions.push({ category, question, options, correctOption, funFact })
  }

  if (skipped) log(`${skipped} linha(s) ignorada(s) por estarem incompletas.`)
  return questions
}

function sheetUrl() {
  if (process.env.QUIZ_SHEET_CSV_URL) return process.env.QUIZ_SHEET_CSV_URL.trim()
  const id = process.env.QUIZ_SHEET_ID && process.env.QUIZ_SHEET_ID.trim()
  if (id) {
    const gid = (process.env.QUIZ_SHEET_GID || "0").trim()
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`
  }
  return null
}

async function main() {
  const url = sheetUrl()
  if (!url) {
    log("Nenhuma planilha configurada (QUIZ_SHEET_CSV_URL/QUIZ_SHEET_ID).")
    log("Mantendo o questions.json existente como fallback.")
    return
  }

  log(`Baixando planilha: ${url}`)
  let csv
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    csv = await res.text()
  } catch (err) {
    log(`AVISO: falha ao baixar a planilha (${err.message}).`)
    log("Mantendo o questions.json existente como fallback.")
    return
  }

  const questions = rowsToQuestions(parseCSV(csv))
  if (questions.length === 0) {
    log("AVISO: nenhuma pergunta válida na planilha. Mantendo o fallback.")
    return
  }

  // não sobrescreve se o resultado for idêntico (evita ruído no git)
  const next = JSON.stringify({ questions }, null, 2) + "\n"
  let current = ""
  try {
    current = readFileSync(OUT_PATH, "utf8")
  } catch {}
  if (current === next) {
    log(`Sem mudanças (${questions.length} perguntas).`)
    return
  }

  writeFileSync(OUT_PATH, next)
  log(`questions.json atualizado com ${questions.length} perguntas da planilha.`)
}

main().catch((err) => {
  // nunca quebra o build
  log(`AVISO: erro inesperado (${err.message}). Mantendo o fallback.`)
})

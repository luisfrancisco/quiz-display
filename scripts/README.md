# Perguntas via Google Sheets

O quiz lê de `questions.json` (estático, empacotado no build). Para editar as
perguntas numa planilha sem mexer no código, o script `fetch-questions.mjs`
baixa um Google Sheets publicado como CSV e regera o `questions.json` **antes
do build** (passo `prebuild`). O telão continua rodando offline no estande.

## 1. Montar a planilha

Primeira linha = cabeçalho. Colunas aceitas (PT ou EN, sem diferenciar
maiúsculas/acentos):

| Coluna | Aliases | Obrigatória |
|---|---|---|
| `category` | categoria, tema | sim |
| `question` | pergunta | sim |
| `optionA`, `optionB`, `optionC`, `optionD`, `optionE` | opcaoA…, alternativaA…, ou só `A`,`B`,`C`… | mín. 2 |
| `correct` | correta, resposta, gabarito | sim |
| `funFact` | curiosidade, fato, vocesabia | sim |

- `correct` pode ser a **letra** da alternativa (`A`, `B`, `C`…), o **número**
  (`1` = primeira) ou o **texto exato** da resposta.
- Linhas incompletas são ignoradas (não quebram o build).

## 2. Publicar como CSV

No Google Sheets: **Arquivo > Compartilhar > Publicar na web** > escolha a aba
> formato **CSV** > Publicar. Copie a URL.

## 3. Configurar

Em `.env.local` (veja `.env.example`):

```
QUIZ_SHEET_CSV_URL=<URL do CSV publicado>
```

Ou, alternativamente, `QUIZ_SHEET_ID` (+ `QUIZ_SHEET_GID`).

## 4. Usar

- `pnpm build` roda o `prebuild` automaticamente e atualiza o `questions.json`.
- `pnpm questions:fetch` roda só a importação (útil para testar/atualizar).

Se a planilha não estiver configurada ou falhar (sem internet, etc.), o
`questions.json` atual é mantido como fallback — o build nunca quebra.

# Modelos de registro e de saída

As colunas seguem a planilha `conferencia-decisoes-ia.xlsx` descrita na skill `analise-indicios-ia-decisoes`. Se a planilha anexada tiver outras colunas, use as dela.

## Aba Itens (uma linha por item)

| Coluna | Quem preenche | Conteúdo |
| --- | --- | --- |
| Decisão | agente | Número CNJ confirmado |
| Item | agente | D01-I001, D01-I002… |
| Grupo | agente | 1 (fonte externa), 2 (autos) ou 3 (vestígio) |
| Tipo de fonte | agente | Precedente, súmula, lei federal, lei estadual, ato do CNJ, doutrina, fato dos autos, vestígio |
| Trecho literal | agente | Copiado da decisão sem alteração |
| Localizador | agente | Página e parágrafo |
| Referência citada | agente | Como escrita na decisão, campo a campo (tribunal, classe, número, relator, turma, ano) |
| Conteúdo atribuído | agente | O que a decisão diz que a fonte diz |
| Extraído por | agente | IA |
| Lista conferida | analista | Sim / Não |
| Sinal | agente, conferido pelo analista | Código de `references/sinais.md` |
| Categoria prevista | fórmula | Pela aba "Sinais → categoria" |
| Resultado | analista | Um dos sete da escala |
| Teste 1 a Teste 4 | analista | Sim / Não / Não realizado |
| Motivo do "não realizado" | analista | Texto |
| IDs das consultas | analista | Ligação com a aba Consultas |
| Observações | ambos | "Outro — não conta", pré-triagem IA etc. |

Para o script `conclusao`, exporte esta aba em CSV. Colunas lidas: Decisão, Item, Grupo, Localizador (ou Página), Resultado, Teste 1 a Teste 4, IDs das consultas (opcional) e Data do ato (opcional). A data também pode vir da aba Decisões, com `--decisoes decisoes.csv`.

## Aba Consultas (uma linha por consulta)

| Coluna | Conteúdo |
| --- | --- |
| ID da consulta | C001… |
| Item | Item a que a consulta se refere |
| Passo | 1, 2 ou 3 do roteiro, ou teste 1 a 4 |
| Data e hora | Da consulta |
| Base | Nome da base |
| Endereço | URL efetivamente usada |
| Termo pesquisado | Literal, entre aspas quando for busca pelo teor |
| Resultado | O que a base devolveu |
| Captura | Nome do arquivo |
| Tentativa | 1 ou 2 (para base fora do ar, em dias diferentes) |
| Natureza | "Constatação" (analista) ou "pré-triagem IA — não é constatação" |

## Ficha de identificação (F1)

```
Processo: <número informado> → <número confirmado no PJe>
Dígito verificador: confere | não confere (candidatos: …; confirmado no PJe em <data>)
Ato analisado: <tipo> — ID <PJe> — data <dd/mm/aaaa>
Arquivo: <nome> — SHA-256 <hash> — extraído em <dd/mm/aaaa>
Regime: <saída de `conferencia.py regime`>
Ato do TJMG na data: <informado pelo analista | não verificado>
Pendências que bloqueiam: <nenhuma | lista>
```

## Roteiro de um item (F3)

```
Item D01-I003 — p. 4, § 2 — Precedente
Referência citada: tribunal=STJ; classe=REsp; numero=…; relator=…
Conteúdo atribuído: "…"

Passo 1 — Pesquisa de jurisprudência do STJ — termo: <número> 
Passo 2 — Consulta processual pelo número — termo: <número>; lista fechada: `variacao listar --numero …`
Passo 3 — Busca pelo teor — termo: "<frase exata>"
Teste 2 — Peças anteriores à decisão: <lista> — procurar: "<frase exata>"
Teste 3 — Decisões do juízo anteriores a 30/11/2022 — procurar: "<frase exata>" — sistema: <definido | não definido → Não realizado>
Teste 4 — Busca na web — termos: "<frase exata com o erro>"

Registro do analista (por passo): data e hora | endereço | resultado | captura | tentativa
```

## Relatório de auditoria (F5)

| Nº | Verificação | Situação | Evidência |
| --- | --- | --- | --- |
| 1 | Número conferido e confirmado no PJe | cumprida / não cumprida / não se aplica | aba e linha |

## Tabela consolidada (F6)

| Processo | Ato (ID) | Data | Regime | Conclusão | Achados |
| --- | --- | --- | --- | --- | --- |

| Conclusão | Decisões |
| --- | --- |

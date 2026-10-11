# Hablá Rioplatense

Página de treino de espanhol rio-platense publicada no claude.ai:
https://claude.ai/artifact/SpQRCvbhzAoxxgCm9LVPdp

A pasta guarda o código-fonte da página. O app Next.js do repositório não usa estes arquivos.

## Arquivos

- `index.html`: a página inteira (HTML, CSS e JS, sem build). É publicada com
  `capabilities: {db: {}, sample: {}}`.
- `frases-seed.json`: as 200 frases iniciais (40 por nível, de A1 a C1). Já estão gravadas no
  banco da página. O arquivo serve de referência e para recriar o banco, se preciso.

## Como funciona o treino

1. O cartão mostra a frase em português, com áudio em português e em espanhol (voz do aparelho,
   com prioridade para `es-AR`).
2. Você escreve ou dita a frase em espanhol. O campo mostra a resposta como guia, e a ajuda
   diminui conforme você domina a frase: frase inteira, depois só as iniciais, depois nada.
3. A correção compara palavra por palavra. Acento e pontuação não contam como erro.
4. Revisão espaçada em 5 caixas (1, 3, 7, 16 e 35 dias). Acerto sem pedir ajuda sobe uma caixa;
   erro volta para a caixa 1 e repete na mesma sessão. Caixa 4 ou 5 = frase dominada.
5. A aba "Mais frases" usa o Claude (no uso da conta de quem abre a página) para gerar frases
   novas do nível e para traduzir frases que você quer conseguir dizer.

## Banco de dados da página

| Caminho | Conteúdo |
|---|---|
| `frases/{id}` | `es, pt, nivel, tema, nota, origem (semente/gerada/pedida), criadaEm` |
| `tentativas/{AAAA-MM-DD}` | um documento por dia: `dia`, `itens[]` com `hora, sessao, fraseId, es, nivel, modo, primeiraNaSessao, repeticao, apoio, apoioSugerido, pediuAjuda, entrada, resposta, acerto, resultado, palavrasErradas, acentos, ouviuES, ouviuPT, duracaoMs, caixaAntes, caixaDepois` |
| `progresso/{fraseId}` | `nivel, caixa, proximaRevisao, acertos, erros, tentativas, ultima, ultimoResultado` |
| `config/perfil` | `nivel, novasPorSessao, vozES, vozPT` |

Se o documento do dia passar de ~200 KB, as tentativas seguintes vão para `AAAA-MM-DD-b`.

`entrada` vale `teclado`, `colado` ou `ditado provável` (estimado pelo tamanho do maior trecho
inserido de uma vez; o navegador não informa se o texto veio do ditado).

## Para o Claude, nas próximas conversas

- Ler o registro: `ArtifactData` `query` em `tentativas` (ordenar por `dia`) e em `progresso`.
- Adicionar frases direcionadas aos erros: `ArtifactData` `batch` em `frases`, com
  `origem: "gerada"` e `criadaEm` com o horário atual. Frases `pedida` e `gerada` entram antes das
  frases semente na fila de frases novas.
- Republicar a página: `Artifact` com o `url` acima e o arquivo `index.html`.

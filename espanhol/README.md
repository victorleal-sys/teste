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

## Áudio gravado com voz de IA

A página toca o áudio gravado quando o documento da frase tem `audioUrl` (ou `audioId`). Sem
ele, usa a voz do aparelho. "Devagar" toca o mesmo arquivo a 75% da velocidade.

O áudio sai do Gemini (Google AI Studio), porque o claude.ai não deixa a página chamar um serviço de
voz enquanto roda. Ele precisa ser gerado antes e guardado na página.

1. Chave: a variável de ambiente `GEMINI_API_KEY` do ambiente da sessão (cadastrada nas
   configurações do ambiente, nunca colada no chat). A chave só entra em sessões novas.
2. Amostras: `node espanhol/audio/gerar-audio.mjs espanhol/frases-seed.json --ids a1-001,a2-005,b1-038 --vozes Kore,Charon --saida /tmp/amostras`.
   Enviar os MP3 para a pessoa ouvir e escolher a voz.
3. Todas as frases: exportar `frases` com `ArtifactData` (`query`, `limit` 1000, `out_dir`), e rodar
   `node espanhol/audio/gerar-audio.mjs <pasta-exportada>/frases --vozes <voz escolhida>`.
   Os arquivos vão para `espanhol/audio/out/` (fora do git) com um `manifest.json`.
4. Subir os MP3 como assets da página (`Artifact`, `asset: true`, até 25 arquivos por chamada).
5. Gravar `audioId` e `audioUrl` (exatamente como o upload devolveu) em cada documento de
   `frases`, com `ArtifactData` `batch` e `op: "update"`.

Frases novas criadas na aba "Mais frases" ficam sem áudio gravado até repetir os passos 3 a 5
para elas (o programa pula as que já têm arquivo em `out/`).

## Para o Claude, nas próximas conversas

- Ler o registro: `ArtifactData` `query` em `tentativas` (ordenar por `dia`) e em `progresso`.
- Adicionar frases direcionadas aos erros: `ArtifactData` `batch` em `frases`, com
  `origem: "gerada"` e `criadaEm` com o horário atual. Frases `pedida` e `gerada` entram antes das
  frases semente na fila de frases novas.
- Republicar a página: `Artifact` com o `url` acima e o arquivo `index.html`.

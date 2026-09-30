---
name: verificacao-ia-decisoes
description: Agente de verificação que aplica a metodologia GEX-IA de indícios de uso inadequado de IA em decisões judiciais (Sindicância nº 0369364-41.2026.8.13.0000; Res. CNJ 615/2025). Identifica o documento, fixa o regime normativo pela data, extrai os itens verificáveis de cada decisão, monta o roteiro de conferência de cada item e dos quatro testes de explicação alternativa, aplica a escala de conclusão ao registro do analista, audita se o registro cumpre a metodologia e consolida a tabela das decisões para a Comissão. Acionar SEMPRE que o pedido for «verificar decisão», «extrair itens da decisão», «montar o roteiro de conferência», «conferir o dígito verificador», «teste de variação mínima», «qual a conclusão desta decisão», «auditar a planilha de conferência», «consolidar para a Comissão», ou quando entregarem texto de decisão de Montalvânia para análise de uso de IA. Versão de repositório da skill analise-indicios-ia-decisoes, com script de cálculo e auditoria do registro. FRONTEIRA: o agente não consulta bases como constatação, não classifica item sem registro do analista, não decide pendência, não afirma que houve uso de IA, não qualifica a conduta do magistrado e não redige o parecer.
---

# Verificação de indícios de uso inadequado de IA em decisões

Este agente aplica a metodologia de `references/metodologia.md` a cada decisão do alcance fixado. Leia esse arquivo inteiro antes do primeiro passo, e `references/sinais.md` antes de extrair itens. A regra foi fixada antes da leitura das decisões: o agente a aplica como está e não a ajusta depois de ver um resultado.

É a versão de repositório da skill `analise-indicios-ia-decisoes` (mesma metodologia e mesmas decisões P1 a P10), com três acréscimos: o script de cálculo, a auditoria do registro (F5) e a lista de pontos em que a regra não decide sozinha. Se as duas divergirem, vale a skill `analise-indicios-ia-decisoes` e o agente aponta a divergência.

## Divisão de trabalho

A seção "Uso de IA nesta análise" da metodologia diz: "A IA entra só para extrair a lista de itens de cada decisão e organizar a planilha. Toda consulta, toda classificação e todo teste são feitos pelo analista, na fonte, com registro. Nenhum resultado de IA entra no parecer como constatação." O agente é IA; por isso a divisão abaixo.

| O agente faz | Fica com o analista |
| --- | --- |
| Extrai os itens e marca cada um como "Extraído por: IA" | Confere a lista contra o texto e acrescenta o que faltar |
| Calcula o dígito verificador e lista candidatos (script) | Confirma o número no PJe e anota o ID do ato |
| Calcula o regime normativo pela data (script) | Confirma a data do ato no PJe |
| Monta o roteiro de cada consulta e de cada teste | Faz cada consulta, na fonte, com captura de tela |
| Compara a referência citada com a fonte real que o analista achou, pela lista fechada (script) | Confere se a fonte real diz o que a decisão lhe atribui |
| Confere se a classificação registrada é compatível com o registro das consultas | Classifica cada item |
| Aplica a escala ao registro e mostra a conclusão e os itens que a determinam (script) | Valida a conclusão na planilha |
| Audita o registro contra a metodologia | Corrige o registro |
| Monta a tabela consolidada e passa o filtro de linguagem (script) | Redige e assina o parecer |

O agente não consulta bases por iniciativa própria. Se o analista pedir uma consulta, o agente lembra a decisão P10 ("IA só extrai e organiza; conferência humana"), faz a consulta e registra o resultado como "pré-triagem IA — não é constatação". O item só recebe resultado depois que o analista refaz a consulta na fonte.

## Entradas

- Texto da decisão (PDF, DOCX ou TXT), com número do processo e, se houver, ID do ato no PJe e data.
- Peças que a decisão menciona e peças das partes e do MP anteriores a ela (grupo 2 e teste 2).
- Planilha `conferencia-decisoes-ia.xlsx`, se já existir. Leia os cabeçalhos e preencha nas colunas existentes; não crie coluna sem avisar. A aba "Sinais → categoria" dá o código S de cada tipo de item.
- Registro do analista: consultas, capturas, classificações e testes.

Se receber `.xlsx` e precisar do script `conclusao`, exporte a aba de itens para CSV (openpyxl, ou a skill de planilhas, se houver).

## Script

Todos os cálculos mecânicos passam por `scripts/conferencia.py` (Python 3, só biblioteca padrão). No Claude Code, o caminho é `${CLAUDE_SKILL_DIR}/scripts/conferencia.py`.

| Subcomando | O que faz |
| --- | --- |
| `cnj NUMERO [--sufixo 8.13.0427]` | Confere o dígito verificador (Res. CNJ 65/2008). Se não fecha, lista todos os candidatos da lista fechada que fecham. Se o formato está defeituoso, lista candidatos só para localizar o documento |
| `variacao comparar --citado '...' --real '...'` | Diz se a referência real é uma única variação da lista fechada da citada (teste 1) |
| `variacao listar --numero --ano --classe --tribunal` | Enumera as variantes da lista fechada, para a consulta processual pelo número |
| `regime DATA` | Regime normativo e declaração exigida pela data do ato |
| `conclusao itens.csv` | Aplica a escala a cada decisão; mostra itens determinantes, inconsistências e avisos |
| `linguagem arquivo.md` | Aponta formulações que a metodologia veda no texto consolidado |

Os 15 processos são da comarca de Montalvânia; a metodologia usa o sufixo `8.13.0427` para eles.

## Funções

Cada função corresponde a etapas da metodologia. Rode na ordem, uma decisão por vez.

### F1 — Identificar o documento e fixar o regime (etapas 1 e 2)

1. `conferencia.py cnj <número>`. Se o dígito não fecha, mostre todos os candidatos e pare: a escolha é do analista, no PJe. O script mostra que mais de um candidato pode fechar o dígito.
2. Registre o ID do ato (fornecido pelo analista), a data completa do ato, a data de extração e o hash: `sha256sum <arquivo>`.
3. `conferencia.py regime <data do ato>`. Anterior a 12/07/2025: registre a declaração da diferença normativa e marque "ato do TJMG: pendente" até o analista informar. Anterior a 30/11/2022: pare (ver Pendências).
4. Se o ato a analisar não estiver definido para o processo, pare e peça a definição. Não escolha o ato.

Saída: ficha de identificação (modelo em `references/modelos.md`).

### F2 — Extrair os itens (etapa 3)

É a única etapa em que o resultado do agente entra na planilha, e entra como lista a conferir.

1. Leia o texto integral, página por página, incluindo trechos transcritos, ementas e notas. Para PDF: `pdftotext -layout -f N -l N arquivo.pdf -` por página, e veja a página renderizada quando houver dúvida de leitura. Não resuma e não amostre.
2. Uma linha por item:
   - **Grupo 1 — fonte externa:** cada precedente, súmula, lei, dispositivo, ato normativo e obra de doutrina citados. Copie a referência exatamente como escrita e o conteúdo que a decisão atribui à fonte (trecho entre aspas, tese ou paráfrase).
   - **Grupo 2 — autos:** cada afirmação sobre partes, fatos, provas, pedidos, folhas ou IDs que possa ser conferida numa peça. Indique a peça que a decisão menciona, se mencionar.
   - **Grupo 3 — vestígio:** frase candidata a residual (texto dirigido a um interlocutor que não é parte nem juízo; oferta de ajuda ou de nova versão; referência a si como modelo ou assistente; marcador de lugar não preenchido; instrução ou comando); metadados do PDF (`pdfinfo`); texto presente na camada de texto e invisível na página renderizada; sinal de versão substituída.
3. Preencha as colunas da aba Itens (`references/modelos.md`): item, grupo, tipo de fonte, trecho literal, localizador (página e parágrafo), referência citada, conteúdo atribuído, sinal, "Extraído por: IA", "Lista conferida" em branco para o analista.
4. A categoria prevista usa só os rótulos da tabela de sinais, sempre como candidato: "Fabricação (candidato)", "Erro de referência (candidato)", "Vestígio que basta" etc. Nunca escreva "Fabricação" como resultado nesta etapa.
5. O sinal é o código de `references/sinais.md` que descreve o item, como candidato para o analista conferir. Se a aba "Sinais → categoria" da planilha divergir, vale a planilha. Nenhum código cabe: "Outro — não conta".
6. Menção expressa ao uso de IA na decisão: registre como uso declarado (S15/S16), que é fato de uso e não indício.
7. Estilo (S11, S13, S14) não vira item. Se o analista quiser registrar, entra como "Só registro". Fundamentação genérica que afirma fato específico dos autos gera item do grupo 2 (S10) para esse fato.
8. Feche com a contagem de itens por grupo e a lista de páginas sem nenhum item, para o analista procurar omissões.

### F3 — Montar o roteiro de conferência (preparação das etapas 4 e 6)

Para cada item, monte os passos da tabela "Conferência de cada item" conforme o tipo de fonte. Para cada passo: base, termo de busca exato (a frase entre aspas, para busca pelo teor) e, para lei federal, a redação vigente na data da decisão. Deixe em branco, para o analista, os campos de registro: data e hora, endereço, resultado, arquivo da captura, tentativa (1 ou 2).

Para cada item com categoria prevista de fabricação ou erro de referência, acrescente os testes:

| Teste | O que o roteiro traz |
| --- | --- |
| 1. Digitação | Primeiro a busca pelo teor. Se o analista achar a fonte real com outra referência, rode `variacao comparar`. Para a consulta processual pelo número, `variacao listar` dá a lista fechada |
| 2. Peça da parte | As peças anteriores à decisão a comparar e o trecho literal a procurar em cada uma |
| 3. Modelo aproveitado | O teor exato a buscar em decisões do mesmo juízo anteriores a 30/11/2022. Sem sistema definido para essa busca, o teste fica "Não realizado", com o motivo |
| 4. Fonte secundária | Os termos de busca na web pelo teor com o mesmo erro |

Itens do grupo 2 (fato dos autos) levam só os testes 2 e 3.

### F4 — Aplicar a regra (etapas 5 e 7)

1. Para cada item classificado pelo analista, confira se o registro sustenta o resultado:
   - "Correto": há consulta que acha a fonte e o conteúdo atribuído.
   - "Fabricação": há registro negativo na fonte citada, nas variações mínimas e na busca pelo teor.
   - "Erro de referência — digitação demonstrada": teste 1 = Sim, com a comparação da lista fechada.
   - "Erro de referência — origem não demonstrada": o conteúdo foi achado em alguma fonte e o teste 1 deu Não.
   - "Não conferível": duas tentativas em dias diferentes com a base fora do ar, ou doutrina sem exemplar acessível, ou documento ilegível ou sem acesso.
   - "Frase residual (S09)": trecho literal e página registrados.

   Onde o registro não sustenta o resultado, aponte a divergência com a linha da planilha. Não troque a classificação do analista.
2. Rode `conferencia.py conclusao itens.csv [--decisoes decisoes.csv]` (colunas em `references/modelos.md`). O script para em inconsistência (resultado fora da escala; teste 1 = Sim com fabricação ou erro de origem não demonstrada; digitação demonstrada sem teste 1 = Sim; resultado sem consulta registrada, quando a coluna de consultas existe) e em item sem resultado, marca como provisória a conclusão que depende de teste ainda sem registro e mostra os itens que determinam cada conclusão.
3. Transcreva a conclusão como o script a devolve, com as duas ressalvas e, se a decisão for anterior a 12/07/2025, a declaração do regime.

### F5 — Auditar o registro (verificação do procedimento)

Percorra a lista abaixo para cada decisão e devolva: verificação, situação (cumprida / não cumprida / não se aplica), evidência (aba e linha).

1. Número com dígito verificador conferido e confirmado no PJe; ID, data completa, data de extração e hash registrados.
2. Regime normativo registrado; declaração da diferença normativa quando anterior a 12/07/2025; situação do ato do TJMG registrada.
3. Lista de itens marcada, item a item, com quem extraiu e se foi conferida pelo analista.
4. Todos os itens com resultado; nenhum item fora dos sete resultados da escala.
5. Cada consulta com data e hora, base, endereço, termo, resultado e captura, inclusive as que confirmam o texto da decisão.
6. Cada "Não conferível" com duas tentativas em dias diferentes, ou com o motivo previsto (doutrina sem exemplar, ilegível, sem acesso).
7. Cada fabricação e cada erro de referência com os quatro testes registrados (grupo 2: testes 2 e 3), cada um como Sim, Não ou Não realizado; cada "Não realizado" com o motivo.
8. Nenhum "Não realizado" usado para afastar indício.
9. Sinal fora da tabela registrado como "outro" e fora da conclusão.
10. Estilo (S11, S13, S14), metadado (S12), comando oculto (S21) e versão substituída (S23) só registrados, sem peso na conclusão.
11. Nenhum uso de detector de IA (L01) e nenhum resultado de IA como constatação (T01).
12. Conclusão da planilha igual à do script `conclusao`.

### F6 — Consolidar para a Comissão (etapa 8)

1. Monte a tabela das decisões: processo, ID do ato, data, regime, conclusão, achados (item, resultado, página). Depois, a contagem por conclusão.
2. Acrescente, sem reescrever, as declarações que a metodologia exige: as duas ressalvas; que o parecer não afirma frequência anormal por falta de grupo de comparação; os limites da seção "Limites que o parecer declara"; o parágrafo sobre o uso de IA na análise, com o que o agente extraiu e se a lista foi conferida; os testes não realizados e o motivo.
3. Rode `conferencia.py linguagem <arquivo>` e corrija cada ocorrência que não seja declaração obrigatória. O filtro é mínimo: reler continua obrigatório.
4. A redação do parecer não é deste agente. Entregue a tabela e as declarações a quem redige.

## Regras que não mudam

1. Nenhuma frase afirma que houve uso de IA. O máximo é "há indício de uso inadequado de IA".
2. Nenhuma frase qualifica a conduta do magistrado; isso cabe à Comissão (Manifestação 27382608). Sem "negligência", "deliberada", "dolo" ou outra palavra que descreva intenção: o texto de uma decisão não revela intenção.
3. Sem "reiterado", "indiscriminado" ou qualificação de frequência.
4. Detector de IA não entra (L01). Estilo não prova uso (L02). Resultado de IA não é constatação (T01).
5. "Não realizado" não afasta o indício.
6. Uma fabricação sem origem em peça de parte ou do MP e sem origem humana demonstrada basta. Uma frase residual (S09) basta.
7. Sinal fora da tabela da metodologia é "outro" e não conta.
8. Toda afirmação do agente aponta a evidência: página e trecho literal da decisão, ou aba e linha da planilha.
9. Pendência não se resolve por dedução. O agente para, diz qual pendência bloqueia e o que falta.

## Pendências da metodologia e o que o agente faz com cada uma

| Pendência | O que o agente faz enquanto ela estiver aberta |
| --- | --- |
| Escopo (ACP 5000105-97.2021 e os outros seis processos fora da lista) | Analisa só os 15 processos do Despacho 27407908, item 4. Pedido fora deles: avisa que está fora do alcance fixado e pede confirmação |
| Números a confirmar no PJe | Roda `cnj`, mostra todos os candidatos e não segue sem o número confirmado |
| Ato a analisar | Para e pede a definição do ato de cada processo |
| Data de corte | Aplica 12/07/2025 e escreve "(a confirmar)" |
| Ato do TJMG | Registra "não verificado" até o analista informar |
| Decisão anterior a 30/11/2022 | Para; o script bloqueia a conclusão |
| Item não conferível | Aplica a regra da planilha (qualquer item não conferível leva a "inconclusivo — conferência impossível") e escreve "(a confirmar)" |
| Acesso para o teste 3 | Sem sistema definido, o teste 3 fica "Não realizado", com o motivo |

## Pontos em que a regra não decide sozinha

Achados ao transformar a metodologia em procedimento. O script aplica a leitura indicada, marca a conclusão como "depende de leitura a confirmar" e o agente os reporta. Não são resolvidos pelo agente.

1. **Fabricação vinda de peça de parte ou do MP (teste 2 = Sim).** A metodologia diz que não conta como indício de uso pelo magistrado, mas não diz em que conclusão a decisão fica. Leitura aplicada: o item não leva a nenhuma das conclusões de indício ou de inconclusivo.
2. **Erro de referência — origem não demonstrada, com teste 2, 3 ou 4 = Sim.** O rótulo diz "origem não demonstrada" e o teste demonstrou a origem. Leitura aplicada: erro com origem demonstrada, que não leva a "inconclusivo — explicação alternativa".
3. **Frase residual (S09) dentro de trecho transcrito de peça.** A metodologia não prevê teste de origem para S09. Leitura aplicada: conta como indício; o script avisa quando o teste 2 foi registrado como Sim.
4. **Decisão sem item verificável.** "Todos os itens conferidos" se cumpre com zero itens. O script avisa, e a conclusão deve declarar que cobre zero itens.

## Como reportar ao analista

- Comece pelo que bloqueia ou pelo resultado, depois a evidência, depois o que falta do analista.
- Cite página e trecho literal da decisão, ou aba e linha da planilha.
- Use os rótulos da metodologia, sem sinônimos. Termo que não esteja na metodologia é definido na mesma mensagem.
- Uma decisão pendente por mensagem, separada de relatório de progresso.

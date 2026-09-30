<!--
Texto da metodologia fixado antes da leitura das decisões (versão de 30/09/2026).
O agente aplica este texto e não o altera. Mudança na regra exige nova versão
datada deste arquivo, feita pelo autor, antes de qualquer nova aplicação.
-->

# Metodologia — indícios de uso inadequado de IA em decisões

Sep 30, 2026 · @Victor Moreira Mulin Leal

Cada decisão analisada recebe uma de quatro conclusões, por regra fixada antes da leitura: há indício de uso inadequado de IA, inconclusivo (por explicação alternativa ou por conferência impossível) ou não foi encontrado indício. A análise parte só do texto dos documentos, sem logs, e nunca afirma que houve uso de IA.

## Objeto e alcance

A Comissão da Sindicância nº 0369364-41.2026.8.13.0000 pede ao GEX-IA parecer sobre a conformidade do uso de IA pelo magistrado com a Res. CNJ 615/2025 (Despacho 27326199, item 1, e Despacho 27407908, item 4; SEI 0375415-68.2026.8.13.0000).

- **Pergunta do parecer:** em cada decisão analisada, há indício de uso inadequado de IA?
- **Alcance:** os 15 processos listados no Despacho 27407908, item 4, todos da comarca de Montalvânia.
- **Base:** só o texto das decisões e das peças dos autos. Não há acesso a logs.
- **Papel do parecer:** técnico. Não julga a conduta funcional do magistrado; essa qualificação cabe à Comissão (Manifestação 27382608).
- **Repositório de referência:** `repositorio-ia-judiciario.xlsx`, com 181 registros e 471 ocorrências de sinais, dos quais 24 casos envolvem juiz ou servidor.

## Definição e escala de conclusão

> Para este parecer, considera-se **indício de uso inadequado de IA** a presença, na decisão, de conteúdo inexistente (lei, dispositivo, precedente, trecho citado, doutrina ou fato dos autos) ou de frase residual de assistente de IA, desde que não explicados por erro humano demonstrado. Esse conteúdo indica ausência da verificação e da revisão exigidas pelo art. 19, § 3º, II, da Res. CNJ 615/2025, em vigor desde 12/07/2025. Para decisões anteriores a essa data, o parecer aplica o mesmo critério técnico e declara que não havia norma do CNJ que impusesse ao magistrado a conferência de conteúdo gerado por IA, pois a Res. CNJ 332/2020 exigia apenas que os sistemas permitissem a supervisão (art. 19, parágrafo único). O parecer também indica se havia ato do TJMG sobre o tema na data da decisão. A qualificação da conduta do magistrado não cabe ao parecer, e sim à Comissão.

Cada item conferido recebe um resultado:

| Resultado do item | Quando se aplica |
| --- | --- |
| Correto | A fonte existe e diz o que a decisão lhe atribui. |
| Erro de referência — digitação demonstrada | Uma variação mínima da referência leva a fonte real com o conteúdo citado. |
| Erro de referência — origem não demonstrada | O conteúdo existe em alguma fonte, mas nenhuma variação mínima explica a referência errada. |
| Fabricação | O conteúdo não existe na fonte citada, em nenhuma variação mínima dela, nem na busca pelo teor. |
| Frase residual (S09) | Frase típica de assistente de IA deixada no texto. |
| Não conferível | Base indisponível, documento ilegível ou sem acesso. |
| Só registro | Estilo, metadado ou outro sinal que não conta para a conclusão. |

A decisão recebe a primeira conclusão cuja condição se cumpre, nesta ordem:

| Conclusão | Condição |
| --- | --- |
| Há indício de uso inadequado de IA | Ao menos uma fabricação que não veio de peça de parte ou do MP e sem origem humana demonstrada; ou ao menos uma frase residual (S09). Uma basta. |
| Inconclusivo — explicação alternativa | Ao menos um erro de referência de origem não demonstrada. |
| Inconclusivo — conferência impossível | Ao menos um item não conferível. |
| Não foi encontrado indício | Todos os itens conferidos; todo erro com origem humana demonstrada. |

Duas ressalvas acompanham toda conclusão. A escala mede só o uso inadequado: uso de IA com a conferência devida não deixa marca e cai em "não foi encontrado indício". E "não foi encontrado indício" vale só para os itens examinados.

## O que se examina

Todos os itens de cada decisão são conferidos, sem amostragem.

| Grupo | O que entra | Sinais | Onde se confere |
| --- | --- | --- | --- |
| 1. Fonte externa | Precedente, súmula, lei, dispositivo e doutrina citados | S01–S08, S20, S25–S28 | Bases oficiais (roteiro abaixo) |
| 2. Autos | Partes, fatos, provas, pedidos e folhas que a decisão afirma | S10 | Peças que a própria decisão menciona e peças das partes anteriores a ela |
| 3. Vestígio | Frase residual, metadado, comando oculto, versão substituída | S09, S12, S21, S23 | Texto integral, propriedades do PDF e histórico do processo |

Padrão formal atípico (S13), fundamentação genérica (S11) e volume anômalo (S14) só se registram. São marcas de estilo, e o repositório (L02) registra que estilo, por si só, não prova uso de IA. Detectores de IA não são usados (L01).

## Etapas de aplicação

As etapas seguem esta ordem para cada decisão. Tudo se registra na planilha de conferência (`conferencia-decisoes-ia.xlsx`).

1. **Identificar o documento.** Confirmar o número do processo (dígito verificador, Res. CNJ 65/2008), localizar o ato no PJe, anotar o ID, a data completa, a data de extração e o hash SHA-256 do arquivo.
2. **Fixar o regime normativo.** Data do ato a partir de 12/07/2025: Res. CNJ 615/2025. Antes: mesmo critério técnico, com a diferença normativa declarada.
3. **Extrair os itens.** A IA pode listar as citações e afirmações verificáveis. O analista confere a lista contra o texto da decisão e acrescenta o que faltar.
4. **Conferir cada item** pelo roteiro de bases, registrando cada consulta com captura de tela.
5. **Classificar cada item** em um dos resultados da escala.
6. **Testar as explicações alternativas** para cada fabricação e cada erro de referência.
7. **Concluir sobre a decisão** pela regra da escala. Na planilha, a conclusão sai por fórmula.
8. **Consolidar a resposta à Comissão** em forma descritiva: tabela das 15 decisões, com conclusão e achados, e contagem por conclusão. O parecer não usa qualificações como "reiterado" ou "indiscriminado" e declara que não afirma frequência anormal, pois não há grupo de comparação.

## Conferência de cada item

Cada consulta registra data e hora, base, endereço, termo pesquisado, resultado e arquivo da captura. As consultas que confirmam o texto da decisão também se registram.

| Tipo de fonte | Passo 1 | Passo 2 | Passo 3 |
| --- | --- | --- | --- |
| Precedente (STF, STJ, TJMG, outros) | Pesquisa de jurisprudência do tribunal citado | Consulta processual pelo número | Busca pelo teor, frase exata, em buscadores de jurisprudência e na web |
| Súmula | Página oficial de súmulas | Busca pelo teor | — |
| Lei federal | Planalto, texto compilado, na redação vigente na data da decisão | Busca pelo teor | — |
| Lei estadual (MG) | Portal da ALMG | Busca pelo teor | — |
| Ato do CNJ | atos.cnj.jus.br | Busca pelo teor | — |
| Doutrina | Catálogo de biblioteca (autor, obra, edição) | Exemplar, na página indicada | Busca pelo teor |
| Fato dos autos | Peça que a decisão menciona | Peças das partes anteriores à decisão | — |
| Vestígio | Leitura integral do texto | Metadados do PDF | Histórico e versões no PJe |

Base fora do ar em duas tentativas, em dias diferentes, torna o item "não conferível". Obra de doutrina sem exemplar acessível também.

**Teste de variação mínima.** Separa erro de digitação de fabricação. As variações admitidas são fechadas:

- troca de um único dígito no número;
- inversão de dois dígitos vizinhos;
- classe trocada por classe próxima (REsp, AgInt no REsp, AREsp; RE, ARE, AgR);
- tribunal trocado (STF e STJ; TJMG e outro TJ);
- ano deslocado em uma unidade;
- relator ou turma trocados, mantidos número e classe.

O teste se aplicou à própria lista da Comissão: dos 15 números, 12 têm dígito verificador correto, e os outros três têm candidato por variação mínima, a confirmar no PJe (ver Pontos pendentes).

## Explicações alternativas

Toda fabricação e todo erro de referência passam por quatro testes. Cada teste registra "Sim", "Não" ou "Não realizado".

| Teste | Pergunta | Como se faz | Se "Sim" |
| --- | --- | --- | --- |
| 1. Digitação | Uma variação mínima leva a fonte real com o conteúdo citado? | Lista fechada de variações (seção anterior) | Erro de referência — digitação demonstrada |
| 2. Peça da parte | O trecho veio de peça de parte ou do MP? | Comparar com as peças anteriores à decisão | Não conta como indício de uso pelo magistrado (S24; casos R012 e R022 do repositório) |
| 3. Modelo aproveitado | A mesma citação aparece em decisão do mesmo juízo anterior a 30/11/2022, data do lançamento público do ChatGPT? | Busca pelo teor exato nas decisões antigas do juízo | Origem humana demonstrada |
| 4. Fonte secundária | O mesmo erro aparece em site, artigo ou repositório de jurisprudência de onde o texto pode ter sido copiado? | Busca pelo teor na web | Origem humana demonstrada |

"Não realizado" não afasta o indício. A definição exige erro humano **demonstrado**; um teste que não pôde ser feito não demonstra nada. O parecer registra quais testes não foram feitos e por quê.

## Sinais do repositório e sua categoria

A tabela abaixo foi fixada antes da leitura. Sinal que não esteja nela se registra como "outro" e não conta. A correspondência completa, código a código, está na aba "Sinais → categoria" da planilha.

| Categoria prevista | Códigos | Tratamento |
| --- | --- | --- |
| Fabricação (candidato) | S01, S02, S05, S06, S07, S08, S25, S26, S28 | Roteiro de bases e testes 2 a 4 |
| Fabricação de fato (candidato) | S10 | Conferência nas peças; testes 2 e 3 |
| Erro de referência (candidato) | S03, S04, S20 | Teste 1; sem variante real e sem o teor em lugar algum, vira fabricação |
| Não conferível ou fabricação | S27 | Localizador impossível: fabricação (candidato). Dados insuficientes e teor não localizado: não conferível |
| Vestígio que basta | S09 | Registrar trecho literal e página |
| Só registro | S11, S12, S13, S14, S21, S23 | Não conta. S12 prova o aplicativo, não a IA (R096). S23: examinar as duas versões |
| Uso declarado | S15, S16 | Registrar. É fato de uso, não indício; a inadequação segue a regra geral |
| Teste de origem | S24 | Usado no teste 2 |
| Fora do alcance do texto | S17, S18, S22, S29 | Cabem à Comissão |
| Não se aplica | S19 | O art. 19, § 6º, da Res. 615 faculta a menção ao uso no corpo da decisão |
| Excluído como prova | L01, L02 | Detector e estilo não provam uso |
| Não usado | T01 | Resultado de IA não entra como constatação |

## Enquadramento normativo

O conteúdo inexistente numa decisão indica falta da verificação que o art. 19, § 3º, II, da Res. CNJ 615/2025 exige. A norma não pede prova de intenção.

| Dispositivo | Texto ou conteúdo | Uso no parecer |
| --- | --- | --- |
| Res. 615, art. 19, § 3º, II | "vedada a utilização como instrumento autônomo de tomada de decisões judiciais sem a devida orientação, interpretação, verificação e revisão por parte do magistrado, que permanecerá integralmente responsável pelas decisões tomadas e pelas informações nelas contidas" | Base da palavra "inadequado" |
| Res. 615, art. 47 | Vigência após 120 dias da publicação (DJe/CNJ nº 54, de 14/03/2025) | Data de corte: 12/07/2025, pela contagem da LC 95/1998 (a confirmar) |
| Res. 615, art. 46 | Revoga a Res. 332/2020 a partir da vigência | O site do CNJ ainda exibe a Res. 332 como "Vigente" |
| Res. 332, art. 19, parágrafo único, e art. 17, II | Os sistemas devem permitir a supervisão e a revisão | Não impõem ao magistrado o dever de conferir conteúdo gerado; por isso a diferença se declara |
| Res. 615, art. 19, § 3º, IV | Veda IA generativa privada ou externa para processar documentos sigilosos | Não verificável pelo texto; registrado como limite |
| Res. 615, art. 19, § 6º | Menção ao uso na decisão é facultativa; o registro automático no sistema do tribunal é devido | A ausência de menção não é sinal |
| Res. 615, art. 40 | O uso em desacordo "será monitorado, sem caráter disciplinar", pelo Comitê Nacional de IA do Judiciário | Transcrito para conhecimento da Comissão, sem interpretação |

## Uso de IA nesta análise

A IA entra só para extrair a lista de itens de cada decisão e organizar a planilha. Toda consulta, toda classificação e todo teste são feitos pelo analista, na fonte, com registro. Nenhum resultado de IA entra no parecer como constatação.

- O analista confere a lista extraída contra o texto da decisão, para achar itens omitidos. A planilha marca, item a item, quem extraiu e se a lista foi conferida.
- O parecer declara esse uso num parágrafo próprio.

## Limites que o parecer declara

- Sem logs, nenhuma conclusão passa de "indício". O registro automático de uso previsto no art. 19, § 6º, da Res. 615 não foi consultado.
- O uso de IA com conferência adequada não deixa marca no texto e não é detectado.
- "Não foi encontrado indício" cobre só os itens examinados.
- Sem grupo de comparação, o parecer não afirma se a taxa de erro é anormal para o magistrado.
- Fatos são conferidos só contra as peças que a decisão menciona e as peças das partes.
- Não são verificáveis pelo texto: uso de ferramenta externa com dados sigilosos, delegação da decisão à IA e atuação de assessor sem supervisão.
- O repositório de referência reúne só casos em que o problema foi constatado. Ele informa quais sinais existem, mas não mede quanto cada um distingue IA de erro humano. Por isso a separação se apoia no modo como o erro se forma, e não em estatística.

## Pontos pendentes antes da aplicação

- [ ] **Escopo.** A ACP 5000105-97.2021, único processo com vício concreto já descrito nos autos (RE 598.099 e "REsp 1.772.345/MG"), não está entre os 15. Os outros seis processos da lista da Dra. Marixa também não. O Despacho 27407908 diz "em complemento ao Despacho 27326199".
- [ ] **Números a confirmar no PJe.** 50001353-30.2023 tem 8 dígitos; só 5001353-30.2023.8.13.0427 fecha o dígito verificador. 5001137-06.2023 não fecha; com o ano 2022, fecha (5001137-06.2022.8.13.0427). 5001611-4.2023 tem dígito incompleto; o correto é 40 (5001611-40.2023.8.13.0427).
- [ ] **Ato a analisar.** Oito processos indicam "Despacho de dd/mm", sem ano. Sete não indicam ato. Falta definir qual decisão se analisa em cada um.
- [ ] **Data de corte.** Confirmar 12/07/2025 como início de vigência da Res. 615.
- [ ] **Ato do TJMG.** Verificar se havia ato do TJMG sobre IA generativa antes de 12/07/2025.
- [ ] **Decisão anterior a 30/11/2022.** Se alguma das decisões for anterior ao lançamento público do ChatGPT, definir o tratamento.
- [ ] **Item não conferível.** A planilha adota que qualquer item não conferível leva a "inconclusivo — conferência impossível". Confirmar.
- [ ] **Acesso para o teste 3.** Definir em quais sistemas se buscam decisões do juízo anteriores a 30/11/2022.

## Fontes

- [Res. CNJ 615/2025](https://atos.cnj.jus.br/atos/detalhar/6001), arts. 19, 40, 46 e 47 (consultada em 30/09/2026)
- [Res. CNJ 332/2020](https://atos.cnj.jus.br/atos/detalhar/3429), arts. 17 e 19 (consultada em 30/09/2026)
- SEI 0375415-68.2026.8.13.0000: Requerimentos 27350502 e 27412385; Manifestação 27382608
- Repositório `repositorio-ia-judiciario.xlsx` (versão de 30/09/2026): abas Registros e Sinais
- Planilha de aplicação: `conferencia-decisoes-ia.xlsx`

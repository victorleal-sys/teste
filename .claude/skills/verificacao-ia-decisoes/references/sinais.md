# Sinais do repositório → categoria

Tabela fixada antes da leitura (decisão P4). Reproduz a da skill `analise-indicios-ia-decisoes`, cuja fonte é `repositorio-ia-judiciario.xlsx`, abas Registros e Sinais (181 registros, 471 ocorrências, 24 casos de juiz ou servidor). Se a aba "Sinais → categoria" da planilha de conferência divergir desta tabela, vale a planilha, e o agente aponta a divergência.

Sinal que não esteja na tabela entra como "Outro — não conta" e fica registrado em Observações.

| Código | Sinal | Categoria prevista | Tratamento |
|---|---|---|---|
| S01 | Precedente citado não existe | Fabricação (candidato) | Roteiro + testes 2 a 4 |
| S02 | Precedente existe, trecho ou tese atribuída não existe | Fabricação (candidato) | Idem |
| S03 | Atribuição trocada (relator, turma, órgão, tribunal, tipo) | Erro de referência (candidato) | Teste 1 |
| S04 | Número real que remete a assunto diferente | Erro de referência (candidato) | Teste 1; sem variante e sem teor, vira fabricação |
| S05 | Julgador inexistente ou fora de exercício | Fabricação (candidato) | Roteiro + testes 2 a 4 |
| S06 | Anacronismo | Fabricação (candidato) | Idem |
| S07 | Dispositivo inexistente ou redação falsa de norma | Fabricação (candidato) | Redação vigente na data da decisão |
| S08 | Doutrina, obra ou trecho inexistente | Fabricação (candidato) | Sem exemplar: não conferível |
| S09 | Frase residual de assistente de IA | Vestígio que basta | Trecho literal e página |
| S10 | Partes, fatos ou provas estranhos aos autos | Fabricação de fato (candidato) | Peças; testes 2 e 3 |
| S11 | Fundamentação genérica ou incoerente | Só registro (L02) | Fato específico errado vira S10 |
| S12 | Marca d'água ou metadado de ferramenta | Só registro | Prova o aplicativo, não a IA (R096) |
| S13 | Padrão formal atípico | Só registro (L02) | Não conta |
| S14 | Volume anômalo | Só registro (L02) | Não conta |
| S15 | Uso de IA admitido ou declarado | Uso declarado | Fato de uso, não indício; inadequação pela regra geral |
| S16 | Prova, laudo ou cálculo por IA sem validação | Uso declarado | Só visível se a decisão declarar |
| S17 | Delegação do juízo decisório à IA | Fora do alcance do texto | Cabe à Comissão |
| S18 | Dados sigilosos em ferramenta externa | Fora do alcance do texto | Res. 615, art. 19, § 3º, IV — limite declarado |
| S19 | Ausência de declaração de uso | Não se aplica | Res. 615, art. 19, § 6º, faculta a menção |
| S20 | Números com padrão artificial ou máscara | Erro de referência (candidato) | Teste 1; sem variante, vira fabricação |
| S21 | Comando oculto dirigido a IA | Só registro | Registrar |
| S22 | Explicação evasiva quando chamado | Fora do alcance do texto | Cabe à Comissão |
| S23 | Rascunho publicado e depois substituído | Só registro | Examinar as duas versões |
| S24 | Incorporação sem conferência de texto da parte ou do MP | Teste 2 | Se confirmado, não conta |
| S25 | Precedente "sob medida" | Fabricação (candidato) | Roteiro + testes 2 a 4 |
| S26 | Citação falsa atribuída a julgador real ou à decisão recorrida | Fabricação (candidato) | Idem |
| S27 | Citação sem dados verificáveis ou com localizador impossível | Não conferível ou fabricação | Localizador impossível: fabricação (candidato); dados insuficientes e teor não localizado: não conferível |
| S28 | Precedente que nenhuma parte citou e não localizável | Fabricação (candidato) | Teste 2 já negativo |
| S29 | Uso por assessor sem supervisão | Fora do alcance do texto | Cabe à Comissão |
| L01 | Detector ou chatbot não prova uso | Excluído | Não usar |
| L02 | Estilo genérico não prova uso | Excluído | Não conta |
| T01 | Repetir a consulta na IA | Não usado (P10) | Resultado de IA não é constatação |

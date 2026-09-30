#!/usr/bin/env python3
"""Cálculos mecânicos da metodologia de indícios de uso inadequado de IA em decisões.

Nenhum subcomando consulta base externa nem classifica item. Cada um aplica, de
forma reprodutível, uma regra que a metodologia (references/metodologia.md) já
fixou:

  cnj        dígito verificador do número único (Res. CNJ 65/2008) e candidatos
  variacao   teste de variação mínima pela lista fechada da metodologia
  regime     regime normativo pela data do ato
  conclusao  conclusão de cada decisão pela ordem da escala, a partir do registro
             do analista
  linguagem  filtro mínimo de formulações vedadas no texto consolidado

Uso: python3 conferencia.py <subcomando> --help
"""

import argparse
import csv
import re
import sys
import unicodedata
from datetime import date, datetime

# ---------------------------------------------------------------------------
# Constantes fixadas pela metodologia (não alterar durante a aplicação)
# ---------------------------------------------------------------------------

CORTE_RES_615 = date(2025, 7, 12)  # art. 47 + LC 95/1998 (a confirmar)
LANCAMENTO_CHATGPT = date(2022, 11, 30)

# "classe trocada por classe próxima (REsp, AgInt no REsp, AREsp; RE, ARE, AgR)"
# As formas "RE AgR" e "ARE AgR" são a grafia usual do AgR no STF.
GRUPOS_DE_CLASSE = [
    ["REsp", "AgInt no REsp", "AREsp"],
    ["RE", "ARE", "AgR", "RE AgR", "ARE AgR"],
]

# "tribunal trocado (STF e STJ; TJMG e outro TJ)"
TJ_RE = re.compile(r"^tj[a-z]{2,3}$")


def norm(txt):
    """Minúsculas, sem acento, sem pontuação redundante, espaços simples."""
    if txt is None:
        return ""
    t = unicodedata.normalize("NFKD", str(txt))
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.lower().replace("—", " ").replace("–", " ").replace("-", " ")
    t = re.sub(r"[.,;:/()]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def digitos(txt):
    return re.sub(r"\D", "", txt or "")


def ler_data(txt):
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(txt.strip(), fmt).date()
        except ValueError:
            pass
    raise ValueError(f"data inválida: {txt!r} (use AAAA-MM-DD ou DD/MM/AAAA)")


# ---------------------------------------------------------------------------
# cnj — número único (Res. CNJ 65/2008): NNNNNNN-DD.AAAA.J.TR.OOOO
# ---------------------------------------------------------------------------

CNJ_RE = re.compile(r"^\s*(\d+)-(\d*)\.(\d{4})(?:\.(\d)\.(\d{2})\.(\d{4}))?\s*$")


def dv_cnj(n7, ano, j, tr, orig):
    return 98 - int(f"{n7}{ano}{j}{tr}{orig}00") % 97


def fmt_cnj(n7, dd, ano, j, tr, orig):
    return f"{n7}-{dd}.{ano}.{j}.{tr}.{orig}"


def fecha(n7, dd, ano, j, tr, orig):
    return len(n7) == 7 and len(dd) == 2 and f"{dv_cnj(n7, ano, j, tr, orig):02d}" == dd


def variacoes_lista_fechada(n7, dd, ano):
    """Troca de um dígito, inversão de vizinhos (dentro do mesmo campo) e ano ±1."""
    campos = {"número sequencial": n7, "dígito verificador": dd, "ano": ano}
    for nome, valor in campos.items():
        for i, c in enumerate(valor):
            for d in "0123456789":
                if d != c:
                    novo = valor[:i] + d + valor[i + 1:]
                    yield nome, novo, f"troca de um dígito ({nome}, posição {i + 1}: {c}→{d})"
        for i in range(len(valor) - 1):
            if valor[i] != valor[i + 1]:
                novo = valor[:i] + valor[i + 1] + valor[i] + valor[i + 2:]
                yield nome, novo, f"inversão de vizinhos ({nome}, posições {i + 1}–{i + 2})"
    for delta in (-1, 1):
        yield "ano", str(int(ano) + delta), f"ano deslocado em uma unidade ({ano}→{int(ano) + delta})"


def cmd_cnj(args):
    m = CNJ_RE.match(args.numero)
    if not m:
        sys.exit("Formato não reconhecido. Use NNNNNNN-DD.AAAA.J.TR.OOOO "
                 "ou NNNNNNN-DD.AAAA com --sufixo J.TR.OOOO.")
    n7, dd, ano, j, tr, orig = m.groups()
    if j is None:
        if not args.sufixo:
            sys.exit("Número sem J.TR.OOOO. Informe --sufixo (ex.: 8.13.0427).")
        j, tr, orig = args.sufixo.split(".")
    print(f"Número informado: {args.numero.strip()}")

    if len(n7) == 7 and len(dd) == 2:
        esperado = dv_cnj(n7, ano, j, tr, orig)
        if f"{esperado:02d}" == dd:
            print(f"Dígito verificador: CONFERE ({fmt_cnj(n7, dd, ano, j, tr, orig)})")
            return
        print(f"Dígito verificador: NÃO CONFERE (informado {dd}; o cálculo com os demais "
              f"campos dá {esperado:02d})")
        cands = {}
        for campo, novo, desc in variacoes_lista_fechada(n7, dd, ano):
            c = {"número sequencial": (novo, dd, ano),
                 "dígito verificador": (n7, novo, ano),
                 "ano": (n7, dd, novo)}[campo]
            if fecha(c[0], c[1], c[2], j, tr, orig):
                cands.setdefault(fmt_cnj(c[0], c[1], c[2], j, tr, orig), []).append(desc)
        print(f"\nCandidatos pela lista fechada de variações mínimas: {len(cands)}")
        for num, descs in cands.items():
            print(f"  {num}  ← {'; '.join(descs)}")
        print("\nNenhum candidato é o número certo por cálculo: mais de um pode fechar o "
              "dígito. Confirmar no PJe (ID do ato) antes de seguir.")
        return

    # Formato defeituoso (quantidade de dígitos errada): fora da lista fechada.
    print("Formato defeituoso: número sequencial com "
          f"{len(n7)} dígito(s), dígito verificador com {len(dd)} dígito(s).")
    print("Os candidatos abaixo servem só para localizar o documento (etapa 1). "
          "Não valem para o teste 1, cuja lista de variações é fechada.")
    cands = {}
    seqs = [n7]
    if len(n7) == 8:
        seqs = sorted({n7[:i] + n7[i + 1:] for i in range(8)})
    elif len(n7) < 7:
        seqs = [n7.zfill(7)]
    for s in seqs:
        if len(dd) == 2:
            dds = [dd]
        elif len(dd) == 1:
            dds = sorted({dd + d for d in "0123456789"} | {d + dd for d in "0123456789"})
        else:
            dds = [f"{x:02d}" for x in range(100)]
        for d2 in dds:
            if fecha(s, d2, ano, j, tr, orig):
                cands.setdefault(fmt_cnj(s, d2, ano, j, tr, orig), True)
    print(f"\nCandidatos que fecham o dígito verificador: {len(cands)}")
    for num in cands:
        print(f"  {num}")
    print("\nConfirmar no PJe antes de seguir.")


# ---------------------------------------------------------------------------
# variacao — teste de variação mínima (teste 1)
# ---------------------------------------------------------------------------

CAMPOS_PREVISTOS = {"tribunal", "classe", "numero", "ano", "relator", "turma"}


def ler_referencia(txt):
    ref = {}
    for parte in txt.split(";"):
        if not parte.strip():
            continue
        if "=" not in parte:
            sys.exit(f"Campo sem '=': {parte!r}. Use 'campo=valor; campo=valor'.")
        k, v = parte.split("=", 1)
        ref[norm(k).replace(" ", "_")] = v.strip()
    return ref


def grupo_da_classe(classe):
    return next((g for g in GRUPOS_DE_CLASSE if norm(classe) in {norm(c) for c in g}), None)


def mesma_classe_proxima(a, b):
    g = grupo_da_classe(a)
    return g is not None and g is grupo_da_classe(b)


def tribunal_trocado(a, b):
    a, b = norm(a).replace(" ", ""), norm(b).replace(" ", "")
    if {a, b} == {"stf", "stj"}:
        return True
    return "tjmg" in (a, b) and all(TJ_RE.match(x) for x in (a, b))


def variacao_de_numero(a, b):
    a, b = digitos(a), digitos(b)
    if len(a) != len(b) or a == b:
        return None
    dif = [i for i in range(len(a)) if a[i] != b[i]]
    if len(dif) == 1:
        extra = ""
        if len(a) == 20 and 9 <= dif[0] <= 12 and abs(int(a[9:13]) - int(b[9:13])) == 1:
            extra = f"; é também ano deslocado em uma unidade ({a[9:13]}→{b[9:13]})"
        return f"troca de um único dígito (posição {dif[0] + 1}: {a[dif[0]]}→{b[dif[0]]}){extra}"
    if len(dif) == 2 and dif[1] == dif[0] + 1 and a[dif[0]] == b[dif[1]] and a[dif[1]] == b[dif[0]]:
        return f"inversão de dois dígitos vizinhos (posições {dif[0] + 1}–{dif[1] + 1})"
    if len(a) == 20:  # número único CNJ: ano nas posições 10–13
        fora_do_ano = [i for i in dif if not 9 <= i <= 12]
        if not fora_do_ano and abs(int(a[9:13]) - int(b[9:13])) == 1:
            return f"ano deslocado em uma unidade ({a[9:13]}→{b[9:13]})"
    return None


def cmd_variacao_comparar(args):
    cit, real = ler_referencia(args.citado), ler_referencia(args.real)
    comuns = sorted(set(cit) & set(real))
    dif = [k for k in comuns if norm(cit[k]) != norm(real[k])]
    print("Campos comparados: " + (", ".join(comuns) or "nenhum"))
    so_um = sorted(set(cit) ^ set(real))
    if so_um:
        print("Campos presentes em só uma referência (não comparados): " + ", ".join(so_um))
    if not dif:
        print("\nResultado: os campos comparados coincidem. Não há erro de referência "
              "nesses campos.")
        return
    print("Campos divergentes: " + ", ".join(f"{k} ({cit[k]} ≠ {real[k]})" for k in dif))

    explicacao, motivo = None, None
    fora = [k for k in dif if k not in CAMPOS_PREVISTOS]
    if fora:
        motivo = "divergência em campo que a lista fechada não prevê: " + ", ".join(fora)
    elif set(dif) <= {"relator", "turma"}:
        if all(k in comuns for k in ("numero", "classe")):
            explicacao = "relator ou turma trocados, mantidos número e classe"
        else:
            motivo = ("relator ou turma divergem, mas número e classe não estão nas duas "
                      "referências; não dá para afirmar que se mantiveram")
    elif len(dif) > 1:
        motivo = "mais de uma variação ao mesmo tempo; a lista admite uma"
    elif dif == ["numero"]:
        explicacao = variacao_de_numero(cit["numero"], real["numero"])
        motivo = None if explicacao else "a diferença no número não é troca de um dígito, " \
            "inversão de vizinhos nem ano ±1"
    elif dif == ["classe"]:
        if mesma_classe_proxima(cit["classe"], real["classe"]):
            explicacao = "classe trocada por classe próxima"
        else:
            motivo = "as classes não pertencem ao mesmo grupo da lista fechada"
    elif dif == ["tribunal"]:
        if tribunal_trocado(cit["tribunal"], real["tribunal"]):
            explicacao = "tribunal trocado"
        else:
            motivo = "a troca de tribunal não é STF↔STJ nem TJMG↔outro TJ"
    elif dif == ["ano"]:
        try:
            if abs(int(digitos(cit["ano"])) - int(digitos(real["ano"]))) == 1:
                explicacao = "ano deslocado em uma unidade"
            else:
                motivo = "o ano difere em mais de uma unidade"
        except ValueError:
            motivo = "ano não numérico"

    if explicacao:
        print(f"\nResultado: explicada pela lista fechada — {explicacao}.")
        print("Se a fonte real diz o que a decisão lhe atribui, o teste 1 é \"Sim\" e o item é "
              "\"Erro de referência — digitação demonstrada\". A conferência do conteúdo é do "
              "analista.")
    else:
        print(f"\nResultado: NÃO explicada pela lista fechada — {motivo}.")
        print("Teste 1 = \"Não\" para esta fonte real.")


def cmd_variacao_listar(args):
    total = 0
    if args.numero:
        n = digitos(args.numero)
        vistos = set()
        print(f"Número {args.numero} — troca de um dígito e inversão de vizinhos:")
        for i, c in enumerate(n):
            for d in "0123456789":
                if d != c:
                    v = n[:i] + d + n[i + 1:]
                    if v not in vistos:
                        vistos.add(v)
                        print(f"  {v}  (troca, posição {i + 1})")
        for i in range(len(n) - 1):
            if n[i] != n[i + 1]:
                v = n[:i] + n[i + 1] + n[i] + n[i + 2:]
                if v not in vistos:
                    vistos.add(v)
                    print(f"  {v}  (inversão, posições {i + 1}–{i + 2})")
        total += len(vistos)
    if args.ano:
        a = int(digitos(args.ano))
        print(f"Ano {args.ano}: {a - 1}, {a + 1}")
        total += 2
    if args.classe:
        grupo = grupo_da_classe(args.classe)
        alt = [c for c in grupo if norm(c) != norm(args.classe)] if grupo else []
        print(f"Classe {args.classe}: " + (", ".join(alt) if alt else "fora dos grupos da lista"))
        total += len(alt)
    if args.tribunal:
        t = norm(args.tribunal).replace(" ", "")
        alt = {"stf": "STJ", "stj": "STF"}.get(t) or ("outro TJ (qualquer)" if t == "tjmg"
                                                     else "TJMG" if TJ_RE.match(t) else None)
        print(f"Tribunal {args.tribunal}: {alt or 'fora da lista'}")
    print(f"\nTotal de variantes enumeradas: {total}")


# ---------------------------------------------------------------------------
# regime — regime normativo pela data do ato
# ---------------------------------------------------------------------------

def regime_de(d):
    if d >= CORTE_RES_615:
        return ("Res. CNJ 615/2025",
                "Art. 19, § 3º, II, em vigor na data do ato (vigência em 12/07/2025, "
                "a confirmar).")
    texto = ("Anterior a 12/07/2025: mesmo critério técnico; declarar que não havia norma do "
             "CNJ que impusesse ao magistrado a conferência de conteúdo gerado por IA (Res. CNJ "
             "332/2020, art. 19, parágrafo único) e indicar se havia ato do TJMG na data "
             "(pendente).")
    if d < LANCAMENTO_CHATGPT:
        texto += (" Anterior a 30/11/2022: o tratamento não está definido (Pontos pendentes). "
                  "Parar e pedir definição antes de concluir.")
    return "Anterior à Res. CNJ 615/2025", texto


def cmd_regime(args):
    d = ler_data(args.data)
    nome, texto = regime_de(d)
    print(f"Data do ato: {d.strftime('%d/%m/%Y')}")
    print(f"Regime: {nome}")
    print(texto)


# ---------------------------------------------------------------------------
# conclusao — regra da escala aplicada ao registro do analista
# ---------------------------------------------------------------------------

ROTULO = {
    "OK": "Correto",
    "ERD": "Erro de referência — digitação demonstrada",
    "ERO": "Erro de referência — origem não demonstrada",
    "FAB": "Fabricação",
    "S09": "Frase residual (S09)",
    "NC": "Não conferível",
    "REG": "Só registro",
    "PENDENTE": "sem resultado",
    "DESCONHECIDO": "resultado fora da escala",
}

RESSALVAS = [
    "A escala mede só o uso inadequado: uso de IA com a conferência devida não deixa marca "
    "e cai em \"não foi encontrado indício\".",
    "\"Não foi encontrado indício\" vale só para os itens examinados.",
]


def classe_resultado(v):
    t = norm(v)
    if not t:
        return "PENDENTE"
    if "digitacao" in t:
        return "ERD"
    if "origem nao demonstrada" in t:
        return "ERO"
    if "fabricacao" in t:
        return "FAB"
    if "residual" in t or "s09" in t:
        return "S09"
    if "nao conferivel" in t:
        return "NC"
    if t in ("so registro", "registro"):
        return "REG"
    if t == "correto":
        return "OK"
    return "DESCONHECIDO"


def classe_teste(v):
    t = norm(v)
    if not t:
        return ""
    if t == "sim":
        return "Sim"
    if t == "nao":
        return "Não"
    if t.startswith("nao realizado"):
        return "Não realizado"
    return "?"


def primeiro(lin, *nomes):
    for n in nomes:
        if lin.get(n):
            return lin[n]
    return ""


def ler_csv(caminho):
    for enc in ("utf-8-sig", "latin-1"):
        try:
            with open(caminho, newline="", encoding=enc) as f:
                amostra = f.read(4096)
                f.seek(0)
                delim = ";" if amostra.count(";") > amostra.count(",") else ","
                linhas = list(csv.DictReader(f, delimiter=delim))
            break
        except UnicodeDecodeError:
            continue
    return linhas


def ler_itens(caminho):
    linhas = ler_csv(caminho)
    itens = []
    for n, lin in enumerate(linhas, start=2):
        colunas = {norm(k).replace(" ", "_") for k in lin if k}
        lin = {norm(k).replace(" ", "_"): (v or "").strip() for k, v in lin.items() if k}
        testes = {}
        for i in (1, 2, 3, 4):
            testes[i] = classe_teste(lin.get(f"teste{i}", lin.get(f"teste_{i}", "")))
        itens.append({
            "linha": n,
            "decisao": lin.get("decisao", ""),
            "item": primeiro(lin, "item_id", "item", "id") or f"linha {n}",
            "grupo": digitos(lin.get("grupo", ""))[:1],
            "pagina": primeiro(lin, "pagina", "localizador"),
            # None quando a planilha não tem a coluna; "" quando a célula está vazia.
            "consultas": (primeiro(lin, "ids_das_consultas", "consultas", "id_das_consultas")
                          if colunas & {"ids_das_consultas", "consultas", "id_das_consultas"}
                          else None),
            "resultado": classe_resultado(lin.get("resultado", "")),
            "resultado_txt": lin.get("resultado", ""),
            "testes": testes,
            "data_ato": primeiro(lin, "data_ato", "data_do_ato", "data"),
        })
    if itens and not any(i["decisao"] for i in itens):
        sys.exit("CSV sem a coluna 'decisao'. Colunas mínimas: decisao, item_id, resultado.")
    return itens


def testes_exigidos(item):
    # S10 (fato dos autos, grupo 2): testes 2 e 3. Demais: os quatro testes.
    return (2, 3) if item["grupo"] == "2" else (1, 2, 3, 4)


def desc(item):
    pag = item["pagina"]
    pag = (f", p. {pag}" if pag[:1].isdigit() else f", {pag}") if pag else ""
    return f"{item['item']} ({ROTULO[item['resultado']]}{pag})"


def concluir(itens):
    avisos, inconsist = [], []
    for it in itens:
        r, t = it["resultado"], it["testes"]
        if r == "DESCONHECIDO":
            inconsist.append(f"{it['item']}: resultado \"{it['resultado_txt']}\" não é um dos "
                             "sete da escala.")
        if "?" in t.values():
            inconsist.append(f"{it['item']}: teste com valor fora de Sim / Não / Não realizado.")
        if r in ("FAB", "ERO") and t[1] == "Sim":
            inconsist.append(f"{it['item']}: teste 1 = Sim, mas o resultado é "
                             f"{ROTULO[r]}; pela escala, o item é erro de referência — "
                             "digitação demonstrada.")
        if r == "ERD" and t[1] != "Sim":
            inconsist.append(f"{it['item']}: digitação demonstrada exige teste 1 = Sim.")
        if it["consultas"] == "" and r not in ("PENDENTE", "DESCONHECIDO"):
            inconsist.append(f"{it['item']}: resultado registrado sem consulta registrada.")
        if r == "S09" and t[2] == "Sim":
            avisos.append(f"{it['item']}: frase residual com teste 2 = Sim. A metodologia não "
                          "prevê teste de origem para S09; o item foi contado como indício.")

    def sim_em(it, nums):
        return any(it["testes"][n] == "Sim" for n in nums)

    def em_branco(it):
        return [n for n in testes_exigidos(it) if it["testes"][n] == ""]

    fab = [i for i in itens if i["resultado"] == "FAB"]
    ero = [i for i in itens if i["resultado"] == "ERO"]
    indicio_fab = [i for i in fab if not sim_em(i, (2, 3, 4))]
    s09 = [i for i in itens if i["resultado"] == "S09"]
    nc = [i for i in itens if i["resultado"] == "NC"]
    pend = [i for i in itens if i["resultado"] == "PENDENTE"]
    ero_aberto = [i for i in ero if not sim_em(i, (2, 3, 4))]

    for i in fab:
        if i["testes"][2] == "Sim":
            avisos.append(f"{i['item']}: fabricação vinda de peça de parte ou do MP (teste 2). "
                          "Não conta como indício de uso pelo magistrado; a metodologia não diz "
                          "expressamente em que conclusão o item deixa a decisão.")
    for i in ero:
        if sim_em(i, (2, 3, 4)):
            avisos.append(f"{i['item']}: erro de referência — origem não demonstrada com teste "
                          "2, 3 ou 4 = Sim. Tratado como erro com origem demonstrada (não leva a "
                          "\"inconclusivo — explicação alternativa\"). Leitura a confirmar.")
    for i in fab + ero:
        falta = em_branco(i)
        if falta:
            avisos.append(f"{i['item']}: teste(s) {', '.join(map(str, falta))} sem registro. "
                          "Registrar Sim, Não ou Não realizado (com o motivo).")
        nr = [n for n in testes_exigidos(i) if i["testes"][n] == "Não realizado"]
        if nr:
            avisos.append(f"{i['item']}: teste(s) {', '.join(map(str, nr))} não realizado(s). "
                          "Não afasta o indício; o parecer declara o motivo.")

    contaveis = [i for i in itens if i["resultado"] != "REG"]
    if not contaveis:
        avisos.append("Nenhum item além de \"só registro\". Se a conclusão for \"não foi "
                      "encontrado indício\", ela cobre zero itens conferidos; declarar.")

    fab_parte = [i for i in fab if i["testes"][2] == "Sim"]
    ero_explicado = [i for i in ero if sim_em(i, (2, 3, 4))]

    if inconsist:
        return "Não calculada — corrigir inconsistência", "bloqueada", "", [], avisos, inconsist
    if indicio_fab or s09:
        final = bool(s09) or any(not em_branco(i) for i in indicio_fab)
        sit = "final" if final else "provisória: testes sem registro nos itens determinantes"
        return ("Há indício de uso inadequado de IA", sit, "Itens que determinam a conclusão",
                s09 + indicio_fab, avisos, inconsist)
    if pend:
        return ("Não calculada — há item sem resultado", "pendente", "Itens sem resultado",
                pend, avisos, inconsist)
    if ero_aberto:
        final = any(not em_branco(i) for i in ero_aberto)
        sit = "final" if final else "provisória: testes sem registro nos itens determinantes"
        concl, det = "Inconclusivo — explicação alternativa", ero_aberto
    elif nc:
        concl, sit, det = "Inconclusivo — conferência impossível", "final", nc
    else:
        concl, sit, det = "Não foi encontrado indício", "final", []
    leituras = []
    if fab_parte:
        leituras.append("fabricação vinda de peça de parte ou do MP")
    if ero_explicado and concl != "Inconclusivo — explicação alternativa":
        leituras.append("erro de referência com origem demonstrada por teste")
    if leituras:
        sit += "; depende de leitura a confirmar (" + "; ".join(leituras) + ")"
    return concl, sit, "Itens que determinam a conclusão", det, avisos, inconsist


def cmd_conclusao(args):
    itens = ler_itens(args.csv)
    if args.decisoes:
        datas = {}
        for lin in ler_csv(args.decisoes):
            lin = {norm(k).replace(" ", "_"): (v or "").strip() for k, v in lin.items() if k}
            datas[lin.get("decisao", "")] = primeiro(lin, "data_ato", "data_do_ato", "data")
        for it in itens:
            it["data_ato"] = it["data_ato"] or datas.get(it["decisao"], "")
    ordem, por_decisao = [], {}
    for it in itens:
        if it["decisao"] not in por_decisao:
            ordem.append(it["decisao"])
            por_decisao[it["decisao"]] = []
        por_decisao[it["decisao"]].append(it)

    resumo = []
    for dec in ordem:
        grupo = por_decisao[dec]
        concl, sit, titulo_det, determinantes, avisos, inconsist = concluir(grupo)
        print(f"## {dec}\n")
        data = next((i["data_ato"] for i in grupo if i["data_ato"]), "")
        if data:
            try:
                d = ler_data(data)
                nome, texto = regime_de(d)
                print(f"Regime: {nome}. {texto}\n")
                if d < LANCAMENTO_CHATGPT:
                    concl = "Não calculada — decisão anterior a 30/11/2022"
                    sit = "bloqueada: tratamento não definido (Pontos pendentes)"
            except ValueError as e:
                print(f"Regime: não calculado ({e}).\n")
        else:
            avisos.append("Sem data_ato: regime normativo não calculado.")
        resumo.append((dec, concl, sit))
        print(f"Conclusão: {concl}")
        print(f"Situação: {sit}")
        cont = {}
        for i in grupo:
            cont[ROTULO[i["resultado"]]] = cont.get(ROTULO[i["resultado"]], 0) + 1
        print(f"Itens: {len(grupo)} — " + "; ".join(f"{k}: {v}" for k, v in cont.items()))
        if determinantes:
            print(f"{titulo_det}:")
            for i in determinantes:
                print(f"  - {desc(i)}")
        for titulo, lista in (("Inconsistências", inconsist), ("Avisos", avisos)):
            if lista:
                print(f"{titulo}:")
                for a in lista:
                    print(f"  - {a}")
        print()

    print("## Resumo\n")
    print("| Decisão | Conclusão | Situação |")
    print("| --- | --- | --- |")
    for dec, concl, sit in resumo:
        print(f"| {dec} | {concl} | {sit} |")
    contagem = {}
    for _, concl, _ in resumo:
        chave = "Não calculada" if concl.startswith("Não calculada") else concl
        contagem[chave] = contagem.get(chave, 0) + 1
    print("\n| Conclusão | Decisões |")
    print("| --- | --- |")
    for concl, n in contagem.items():
        print(f"| {concl} | {n} |")
    print("\nRessalvas que acompanham toda conclusão:")
    for r in RESSALVAS:
        print(f"- {r}")


# ---------------------------------------------------------------------------
# linguagem — filtro mínimo de formulações vedadas
# ---------------------------------------------------------------------------

VEDADAS = [
    (r"\breiterad\w*", "qualificação vedada (\"reiterado\")"),
    (r"\bindiscriminad\w*", "qualificação vedada (\"indiscriminado\")"),
    (r"\b(sistem[aá]tic|habitual|recorrent|contumaz)\w*",
     "qualificação de frequência; sem grupo de comparação, o parecer não a sustenta"),
    (r"\b(frequ[eê]ncia|taxa)( de erros?)? (anormal|elevad|excessiv|acima)\w*",
     "afirmação de frequência anormal; não há grupo de comparação"),
    (r"\bhouve (o )?uso (inadequado )?de (IA|intelig[eê]ncia artificial)",
     "afirma uso de IA; o parecer só afirma indício"),
    (r"\b(o magistrado|o juiz|o ju[ií]zo|o assessor)\s+(usou|utilizou|empregou|valeu-se)\b",
     "afirma uso de IA; o parecer só afirma indício"),
    (r"\b(gerad|redigid|produzid|elaborad)[oa]s?\s+(pela|por|com)\s+"
     r"(IA|intelig[eê]ncia artificial|ChatGPT|ferramenta de IA)",
     "afirma autoria por IA; o parecer só afirma indício"),
    (r"\b(comprova|demonstra|prova)(-se| que)?\s+(o )?uso\b",
     "afirma prova de uso; o parecer só afirma indício"),
    (r"\b(infra[cç][aã]o|falta funcional|neglig[eê]n\w*|des[ií]dia|m[aá]-f[eé]|dolo\w*|culpa\w*)\b",
     "qualificação de conduta; cabe à Comissão"),
    (r"\b(deliberad|intencional|proposital|consciente)\w*",
     "descreve intenção; o texto de uma decisão não revela intenção"),
    (r"\b(detector|GPTZero|ZeroGPT|Turnitin|Originality)\b",
     "detector de IA não é usado (L01)"),
]


# Negação expressa na mesma frase: provável declaração obrigatória ("não afirma
# frequência anormal", "detectores de IA não são usados"). Sai marcada, não some.
NEGACAO = re.compile(r"\bn[aã]o\b", flags=re.IGNORECASE)


def cmd_linguagem(args):
    with open(args.arquivo, encoding="utf-8") as f:
        linhas = f.read().splitlines()
    achados = 0
    for n, linha in enumerate(linhas, start=1):
        for padrao, motivo in VEDADAS:
            for m in re.finditer(padrao, linha, flags=re.IGNORECASE):
                achados += 1
                ini = linha.rfind(".", 0, m.start()) + 1
                fim = linha.find(".", m.end())
                frase = linha[ini:fim if fim != -1 else len(linha)]
                nota = " (há negação na frase: conferir se é declaração obrigatória)" \
                    if NEGACAO.search(frase) else ""
                print(f"{args.arquivo}:{n}:{m.start() + 1}: \"{m.group(0)}\" — {motivo}{nota}")
    print(f"\n{achados} ocorrência(s). Filtro mínimo: ausência de ocorrência não prova que o "
          "texto cumpre a metodologia; a releitura continua obrigatória.")


# ---------------------------------------------------------------------------

def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("cnj", help="confere o dígito verificador e lista candidatos")
    s.add_argument("numero", help="NNNNNNN-DD.AAAA.J.TR.OOOO ou NNNNNNN-DD.AAAA")
    s.add_argument("--sufixo", help="J.TR.OOOO quando o número vier sem ele (ex.: 8.13.0427)")
    s.set_defaults(func=cmd_cnj)

    s = sub.add_parser("variacao", help="teste de variação mínima (teste 1)")
    vs = s.add_subparsers(dest="modo", required=True)
    c = vs.add_parser("comparar", help="a referência real é variação mínima da citada?")
    c.add_argument("--citado", required=True,
                   help="'tribunal=STJ; classe=REsp; numero=1.772.345; relator=...'")
    c.add_argument("--real", required=True, help="mesmos campos, da fonte encontrada")
    c.set_defaults(func=cmd_variacao_comparar)
    li = vs.add_parser("listar", help="enumera as variantes da lista fechada")
    li.add_argument("--numero")
    li.add_argument("--ano")
    li.add_argument("--classe")
    li.add_argument("--tribunal")
    li.set_defaults(func=cmd_variacao_listar)

    s = sub.add_parser("regime", help="regime normativo pela data do ato")
    s.add_argument("data", help="AAAA-MM-DD ou DD/MM/AAAA")
    s.set_defaults(func=cmd_regime)

    s = sub.add_parser("conclusao", help="aplica a escala ao registro do analista (CSV)")
    s.add_argument("csv", help="aba Itens em CSV: decisao, item_id, grupo, pagina ou "
                               "localizador, resultado, teste 1..teste 4, ids das consultas "
                               "(opcional), data_ato (opcional)")
    s.add_argument("--decisoes", help="aba Decisões em CSV (decisao, data do ato), "
                                      "se a data não estiver na aba Itens")
    s.set_defaults(func=cmd_conclusao)

    s = sub.add_parser("linguagem", help="filtro mínimo de formulações vedadas")
    s.add_argument("arquivo")
    s.set_defaults(func=cmd_linguagem)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

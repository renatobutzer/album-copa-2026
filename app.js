/* ============================================================================
   ÁLBUM COPA 2026 — lógica do app
   - Estado salvo em localStorage (só neste aparelho).
   - owned[code] = nº de cópias (0 = falta, 1 = tenho, 2+ = tenho + repetidas).
   - names[code] = nome personalizado (sobrepõe o da checklist).
============================================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "figurinhas2026:v1";
  var A = window.ALBUM;

  // ----------------------------- Estado ------------------------------------
  var state = { owned: {}, names: {}, legends: {}, layout: "figurinha", shareName: "", lang: null, locked: false };

  // ----- i18n -----
  var L = (window.I18N && window.I18N.pt) || {};   // dicionário ativo (default pt)
  function detectLang() {
    var sys = (navigator.language || "pt").toLowerCase();
    return sys.indexOf("en") === 0 ? "en" : "pt";
  }
  function t(key, vars) {
    var s = (L && L[key] != null) ? L[key] : key;
    if (vars) for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        state.owned = p.owned || {};
        state.names = p.names || {};
        state.legends = p.legends || {};
        // migração: temas antigos -> novos layouts
        state.layout = p.layout || mapOldTheme(p.theme) || "figurinha";
        state.shareName = p.shareName || "";
        state.lang = p.lang || null;   // null = ainda não escolheu (usa o do sistema)
        state.locked = !!p.locked;
      }
    } catch (e) { /* ignora */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast(t("t_saved_err")); }
  }

  // ----------------------------- Helpers -----------------------------------
  function count(code) { return state.owned[code] | 0; }
  function setCount(code, n) {
    n = Math.max(0, n | 0);
    if (n === 0) delete state.owned[code]; else state.owned[code] = n;
    save();
  }
  function have(code) { return count(code) >= 1; }
  function dupes(code) { return Math.max(0, count(code) - 1); }
  function cellState(code) { var c = count(code); return c === 0 ? "falta" : (c >= 2 ? "dup" : "have"); }

  function nameOf(s) {
    if (state.names[s.code]) return state.names[s.code];
    if (s.name) return s.name;
    if (s.type === "player") return "";          // jogador sem nome ainda
    return s.name || "";
  }
  function nameOrPlaceholder(s) {
    var n = nameOf(s);
    if (n) return n;
    if (s.type === "player") return t("player_ph", { n: s.pos });
    return s.code;
  }

  // Lista única de todas as figurinhas (na ordem do álbum).
  var ALL = A.allCodes.map(function (c) { return A.byCode[c]; });

  // Cores das seleções [cor, cor do texto sobre ela] — identidade visual (sem imagens).
  var TEAM_COLORS = {
    MEX:["#006847","#fff"], RSA:["#E8B500","#1f2937"], KOR:["#C8102E","#fff"], CZE:["#11457E","#fff"],
    CAN:["#D52B1E","#fff"], BIH:["#002F6C","#fff"], QAT:["#8A1538","#fff"], SUI:["#DA291C","#fff"],
    BRA:["#FFDF00","#14532d"], MAR:["#C1272D","#fff"], HAI:["#00209F","#fff"], SCO:["#0065BD","#fff"],
    USA:["#0A3161","#fff"], PAR:["#D52B1E","#fff"], AUS:["#00843D","#fff"], TUR:["#E30A17","#fff"],
    GER:["#1a1a1a","#fff"], CUW:["#002B7F","#fff"], CIV:["#FF8200","#1f2937"], ECU:["#FFD100","#1f2937"],
    NED:["#EC6608","#1f2937"], JPN:["#BC002D","#fff"], SWE:["#006AA7","#fff"], TUN:["#E70013","#fff"],
    BEL:["#E30613","#fff"], EGY:["#CE1126","#fff"], IRN:["#239F40","#fff"], NZL:["#1a1a1a","#fff"],
    ESP:["#AA151B","#fff"], CPV:["#003893","#fff"], KSA:["#006C35","#fff"], URU:["#5CBFEB","#1f2937"],
    FRA:["#002395","#fff"], SEN:["#00853F","#fff"], IRQ:["#007A3D","#fff"], NOR:["#BA0C2F","#fff"],
    ARG:["#75AADB","#1f2937"], ALG:["#006233","#fff"], AUT:["#ED2939","#fff"], JOR:["#117A37","#fff"],
    POR:["#C8102E","#fff"], COD:["#007FFF","#fff"], UZB:["#0099B5","#fff"], COL:["#FCD116","#1f2937"],
    ENG:["#002366","#fff"], CRO:["#ED1C24","#fff"], GHA:["#006B3F","#fff"], PAN:["#005293","#fff"],
    fwc:["#C9A227","#1f2937"], coke:["#E61A27","#fff"]
  };
  function teamColor(code) { return TEAM_COLORS[code] || ["#1d4ed8", "#fff"]; }

  // ----- Legends (Extra Stickers): 20 craques × 4 níveis, contador por nível -----
  var LEGEND_TIERS = [
    { key: "roxo",   label: "Roxo (base)", color: "#7e3ff2" },
    { key: "bronze", label: "Bronze",      color: "#b87333" },
    { key: "prata",  label: "Prata",       color: "#9aa3ad" },
    { key: "ouro",   label: "Ouro",        color: "#d4af37" }
  ];
  function legendCount(id, tier) { return (state.legends[id] && state.legends[id][tier]) || 0; }
  function setLegendCount(id, tier, n) {
    n = Math.max(0, n | 0);
    if (!state.legends[id]) state.legends[id] = {};
    if (n === 0) delete state.legends[id][tier]; else state.legends[id][tier] = n;
    if (Object.keys(state.legends[id]).length === 0) delete state.legends[id];
    save();
  }

  // --------------------------- Estatísticas ---------------------------------
  function stats() {
    var have = 0, rep = 0, foilHave = 0, foilTotal = 0;
    for (var i = 0; i < ALL.length; i++) {
      var s = ALL[i], c = count(s.code);
      if (s.foil) foilTotal++;
      if (c >= 1) { have++; if (s.foil) foilHave++; }
      if (c >= 2) rep += (c - 1);
    }
    return { have: have, rep: rep, miss: ALL.length - have, total: ALL.length, foilHave: foilHave, foilTotal: foilTotal };
  }

  // ------------------------- Filtro / busca ---------------------------------
  var filter = "all";
  var search = "";
  var markMode = "have";   // "have" = toque marca tenho/não · "dup" = toque soma repetida
  var openSet = {};   // accordions abertos (por id)

  function normalize(t) {
    return (t || "").toString().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");  // remove acentos p/ busca
  }
  function passes(s) {
    var c = count(s.code);
    if (filter === "falta" && c > 0) return false;
    if (filter === "have" && c < 1) return false;
    if (filter === "dup" && c < 2) return false;
    if (filter === "foil" && !s.foil) return false;
    if (search) {
      var q = normalize(search);
      var hay = normalize(s.code + " " + s.pos + " " + nameOf(s) + " " + (s.teamName || ""));
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
  var filtering = function () { return filter !== "all" || search !== ""; };

  // =========================================================================
  //  RENDER — ÁLBUM
  // =========================================================================
  // Badge mostrado nos cabeçalhos: código de 3 letras p/ seleções, emoji p/ seções.
  function teamBadge(code) { return '<span class="flag code3">' + code + '</span>'; }
  // ícones de linha (badges das seções especiais) — combinam com as abas
  var SVGICON = {
    trophy: '<svg viewBox="0 0 24 24"><path d="M8 21h8M12 17.5V21M6.5 4h11v4.5a5.5 5.5 0 0 1-11 0V4Z"/><path d="M6.5 6.5H4V8a3 3 0 0 0 3 3M17.5 6.5H20V8a3 3 0 0 1-3 3"/></svg>',
    cup:    '<svg viewBox="0 0 24 24"><path d="M6 4h12l-1 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 4Z"/><path d="M5 9h14"/></svg>',
    star:   '<svg viewBox="0 0 24 24"><path d="M12 3c.4 3.4 2.6 5.6 6 6-3.4.4-5.6 2.6-6 6-.4-3.4-2.6-5.6-6-6 3.4-.4 5.6-2.6 6-6Z"/></svg>'
  };
  function svgFlag(name, cls) { return '<span class="flag svgflag' + (cls ? " " + cls : "") + '">' + SVGICON[name] + '</span>'; }

  function cellHTML(s) {
    var c = count(s.code), st = cellState(s.code), d = dupes(s.code);
    var cls = "cell " + (st === "have" ? "have" : st === "dup" ? "dup have" : "");
    if (s.foil) cls += " foil";
    var nm = nameOrPlaceholder(s);
    var tag = s.type === "logo" ? t("tag_crest") : s.type === "photo" ? t("tag_photo") : "";
    return '<div class="' + cls + '" data-code="' + s.code + '">' +
      (d > 0 ? '<span class="dupbadge" data-act="minus">×' + d + '</span>' : '') +
      '<span class="num">' + s.pos + '</span>' +
      (nm ? '<span class="nm">' + esc(nm) + '</span>' : '') +
      (tag ? '<span class="tag">' + tag + '</span>' : '') +
      '<button class="plus" data-act="plus" aria-label="Adicionar repetida">+</button>' +
      '</div>';
  }

  function gridHTML(stickers) {
    var vis = stickers.filter(passes);
    if (!vis.length) return null;
    var h = '<div class="grid">';
    for (var i = 0; i < vis.length; i++) h += cellHTML(vis[i]);
    return h + "</div>";
  }

  function accHTML(id, badge, title, sub, stickers) {
    var total = stickers.length;
    var got = stickers.reduce(function (a, s) { return a + (have(s.code) ? 1 : 0); }, 0);
    var grid = gridHTML(stickers);
    if (grid === null) return "";   // filtro escondeu tudo
    var isOpen = openSet[id] || filtering();
    var teamCode = id.indexOf("team-") === 0 ? id.slice(5) : id;
    var col = teamColor(teamCode);
    var prog = total ? Math.round((got / total) * 100) : 0;   // cada figurinha ~5% (20 por time)
    var done = total > 0 && got === total;
    // sigla-fantasma (só para seleções; seções fwc/coke usam emoji)
    var ghost = (id.indexOf("team-") === 0) ? '<span class="ghost" aria-hidden="true">' + teamCode + '</span>' : '';
    return '<div class="acc' + (isOpen ? " open" : "") + (done ? " done" : "") + '" data-acc="' + id +
      '" style="--team:' + col[0] + ';--team-ink:' + col[1] + ';--progress:' + prog + '%">' +
      ghost +
      '<button class="acc-head" data-acctoggle="' + id + '">' +
        badge +
        '<span class="ttl">' + esc(title) + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span>' +
        '<span class="mini-prog">' + (done ? '🏆 ' : '') + '<b>' + got + '</b>/' + total + '</span>' +
        (markMode === "bulk" ? '<span class="markall" data-markall="' + id + '" role="button">' + (done ? t("mark_clear") : t("mark_all")) + '</span>' : '') +
        '<span class="chev">▶</span>' +
      '</button>' +
      '<div class="acc-body">' + (isOpen ? grid : "") + '</div>' +
    '</div>';
  }

  function renderAlbum() {
    var el = document.getElementById("album");
    var html = "";

    // Abertura & FIFA Museum
    html += '<div class="section">' +
      accHTML(A.abertura.id, svgFlag("trophy"), t("sec_opening"), t("sec_opening_sub"), A.abertura.stickers) +
      '</div>';

    // Grupos A–L
    for (var g = 0; g < A.grupos.length; g++) {
      var grp = A.grupos[g];
      var teamsHTML = "";
      for (var ti = 0; ti < grp.teams.length; ti++) {
        var tm = grp.teams[ti];
        teamsHTML += accHTML("team-" + tm.code, teamBadge(tm.code), tm.name, t("team_sub"), tm.stickers);
      }
      if (teamsHTML) {
        html += '<div class="section"><div class="group-label">' + t("group", { x: grp.id }) + '</div>' + teamsHTML + '</div>';
      }
    }

    // Coca-Cola
    html += '<div class="section">' +
      accHTML(A.coke.id, svgFlag("cup"), t("sec_coke"), t("sec_coke_sub"), A.coke.stickers) +
      '</div>';

    // Legends (Extra Stickers) — só no modo "Tudo" (fora dos filtros de figurinha)
    if (A.legends && !filtering()) html += renderLegends();

    if (!html.replace(/<div class="section">\s*<\/div>/g, "").trim()) {
      html = '<div class="empty"><div class="big">🔍</div>Nada encontrado com esse filtro/busca.</div>';
    }
    el.innerHTML = html;
  }

  // ----- Render da seção Legends -----
  function legendsStats() {
    var total = A.legends.length * LEGEND_TIERS.length; // 80
    var got = 0;
    A.legends.forEach(function (L) {
      LEGEND_TIERS.forEach(function (t) { if (legendCount(L.id, t.key) > 0) got++; });
    });
    return { got: got, total: total };
  }
  var TIER_KEY = { roxo: "tier_base", bronze: "tier_bronze", prata: "tier_silver", ouro: "tier_gold" };
  function tierLabel(key) { return t(TIER_KEY[key] || key); }
  function tiersHTML(id) {
    var h = '<div class="tiers">';
    LEGEND_TIERS.forEach(function (tr) {
      var n = legendCount(id, tr.key);
      h += '<div class="tier' + (n > 0 ? " has" : "") + '">' +
        '<span class="tier-dot" style="background:' + tr.color + '"></span>' +
        '<span class="tier-name">' + tierLabel(tr.key) + '</span>' +
        '<span class="tier-ctrl">' +
          '<button class="step-btn sm" data-lg="' + id + '" data-tier="' + tr.key + '" data-lgact="dec">−</button>' +
          '<span class="tier-n">' + n + '</span>' +
          '<button class="step-btn sm" data-lg="' + id + '" data-tier="' + tr.key + '" data-lgact="inc">+</button>' +
        '</span>' +
      '</div>';
    });
    return h + '</div>';
  }
  function renderLegends() {
    var st = legendsStats();
    var prog = st.total ? Math.round((st.got / st.total) * 100) : 0;
    var done = st.got === st.total && st.total > 0;
    var open = !!openSet["legends"];
    var body = "";
    if (open) {
      A.legends.forEach(function (L) {
        var col = teamColor(L.id);
        var pOpen = !!openSet["lg-" + L.id];
        var ownedT = LEGEND_TIERS.filter(function (tr) { return legendCount(L.id, tr.key) > 0; });
        var sum = ownedT.length ? ownedT.map(function (tr) { return tierLabel(tr.key).replace(/\s*\(.*\)/, ""); }).join(" · ") : "—";
        body += '<div class="lg' + (pOpen ? " open" : "") + '" style="--team:' + col[0] + ';--team-ink:' + col[1] + '">' +
          '<button class="lg-head" data-lgtoggle="' + L.id + '">' +
            '<span class="flag code3">' + L.id + '</span>' +
            '<span class="ttl">' + esc(L.name) + '<span>' + esc(L.country) + '</span></span>' +
            '<span class="lg-sum">' + esc(sum) + '</span>' +
            '<span class="chev">▶</span>' +
          '</button>' +
          '<div class="lg-body">' + (pOpen ? tiersHTML(L.id) : "") + '</div>' +
        '</div>';
      });
    }
    return '<div class="section"><div class="acc' + (open ? " open" : "") + (done ? " done" : "") +
      '" data-acc="legends" style="--team:#7e3ff2;--team-ink:#fff;--progress:' + prog + '%">' +
      '<button class="acc-head" data-acctoggle="legends">' +
        svgFlag("star") +
        '<span class="ttl">' + t("sec_legends") + '<span>' + t("sec_legends_sub") + '</span></span>' +
        '<span class="mini-prog">' + (done ? "🏆 " : "") + '<b>' + st.got + '</b>/' + st.total + '</span>' +
        '<span class="chev">▶</span>' +
      '</button>' +
      '<div class="acc-body">' + body + '</div>' +
    '</div></div>';
  }

  // =========================================================================
  //  RENDER — FALTAM
  // =========================================================================
  function pillHTML(s, showX) {
    var d = dupes(s.code);
    var nm = nameOf(s);
    return '<span class="pill' + (s.foil ? " foil" : "") + '" data-code="' + s.code + '">' +
      '<span class="code">' + s.code + (s.foil ? " ✨" : "") + '</span>' +
      (nm ? '<span class="nm">' + esc(nm) + '</span>' : '') +
      (showX && d > 0 ? '<span class="x">×' + d + '</span>' : '') +
      '</span>';
  }

  // Agrupa figurinhas por seção/seleção, na ordem do álbum.
  function groupByTeam(predicate) {
    var groups = [];
    function pushGroup(key, label, badge, stickers) {
      var sel = stickers.filter(predicate);
      if (sel.length) groups.push({ key: key, label: label, badge: badge, items: sel });
    }
    pushGroup("fwc", t("sec_opening"), svgFlag("trophy"), A.abertura.stickers);
    A.grupos.forEach(function (grp) {
      grp.teams.forEach(function (tm) {
        pushGroup("team-" + tm.code, tm.name + " (" + t("group", { x: grp.id }) + ")", teamBadge(tm.code), tm.stickers);
      });
    });
    pushGroup("coke", t("sec_coke"), svgFlag("cup"), A.coke.stickers);
    return groups;
  }

  function renderFaltam() {
    var groups = groupByTeam(function (s) { return !have(s.code); });
    var st = stats();
    document.getElementById("faltamHead").innerHTML =
      t("missing_head", { n: "<b>" + st.miss + "</b>", total: st.total }) +
      (st.foilTotal ? t("missing_foil", { n: (st.foilTotal - st.foilHave) }) : "");
    var el = document.getElementById("faltamList");
    if (!groups.length) {
      el.innerHTML = '<div class="empty"><div class="big">🏆</div>' + esc(t("missing_done")) + '</div>';
      return;
    }
    var h = "";
    groups.forEach(function (g) {
      var col = teamColor(g.key.indexOf("team-") === 0 ? g.key.slice(5) : g.key);
      h += '<div class="list-group" style="--team:' + col[0] + ';--team-ink:' + col[1] + '"><h3>' + g.badge + " " + esc(g.label) +
        ' <span class="cnt">— ' + t("missing_group", { n: g.items.length }) + '</span></h3><div class="pillrow">';
      g.items.forEach(function (s) { h += pillHTML(s, false); });
      h += "</div></div>";
    });
    el.innerHTML = h;
  }

  // =========================================================================
  //  RENDER — REPETIDAS
  // =========================================================================
  function renderRep() {
    var groups = groupByTeam(function (s) { return dupes(s.code) > 0; });
    var st = stats();
    document.getElementById("repHead").innerHTML = t("swaps_head", { n: "<b>" + st.rep + "</b>" });
    var el = document.getElementById("repList");
    if (!groups.length) {
      el.innerHTML = '<div class="empty"><div class="big">🔄</div>' + esc(t("swaps_empty")).replace(/\n/g, "<br>") + '</div>';
      return;
    }
    var h = "";
    groups.forEach(function (g) {
      var tot = g.items.reduce(function (a, s) { return a + dupes(s.code); }, 0);
      var col = teamColor(g.key.indexOf("team-") === 0 ? g.key.slice(5) : g.key);
      h += '<div class="list-group" style="--team:' + col[0] + ';--team-ink:' + col[1] + '"><h3>' + g.badge + " " + esc(g.label) +
        ' <span class="cnt">— ' + t("swaps_group", { n: tot }) + '</span></h3><div class="pillrow">';
      g.items.forEach(function (s) { h += pillHTML(s, true); });
      h += "</div></div>";
    });
    el.innerHTML = h;
  }

  // =========================================================================
  //  RENDER — TROCAR / COMPARTILHAR
  // =========================================================================
  function buildRepText() {
    var parts = [];
    ALL.forEach(function (s) {
      var d = dupes(s.code);
      if (d > 0) parts.push(s.code + (d > 1 ? "(" + d + "x)" : ""));
    });
    return parts.join(", ");
  }
  function buildMissText() {
    var parts = [];
    ALL.forEach(function (s) {
      if (!have(s.code)) parts.push(s.code + (s.foil ? "✨" : ""));
    });
    return parts.join(", ");
  }
  function buildFullText() {
    var st = stats();
    var rep = buildRepText();
    var miss = buildMissText();
    var out = [];
    out.push(t("txt_title"));
    out.push(t("txt_have", { n: st.have, total: st.total, pct: pct(st.have, st.total) }));
    out.push("");
    out.push(t("txt_swaps", { n: st.rep }));
    out.push(rep || "—");
    out.push("");
    out.push(t("txt_missing", { n: st.miss }));
    out.push(miss || t("txt_done"));
    out.push("");
    out.push(t("txt_foil_note"));
    return out.join("\n");
  }

  function renderShare() {
    var st = stats();
    document.getElementById("stHave").textContent = st.have;
    document.getElementById("stRep").textContent = st.rep;
    document.getElementById("stMiss").textContent = st.miss;
    document.getElementById("sharePreview").value = buildFullText();
    document.getElementById("shareName").value = state.shareName || "";
  }

  // =========================================================================
  //  COMPARTILHAR COLEÇÃO POR LINK (sem servidor)
  //  Codifica os counts em string posicional base36 (ordem de ALL) e, se a
  //  lib LZString existir, comprime; tudo vai no #hash do link.
  // =========================================================================
  function encodeCounts() {
    var s = "";
    for (var i = 0; i < ALL.length; i++) {
      var c = count(ALL[i].code); if (c > 35) c = 35;
      s += c.toString(36);
    }
    return s;
  }
  function buildShareData() {
    var raw = encodeCounts();
    if (typeof LZString !== "undefined" && LZString.compressToEncodedURIComponent)
      return "L" + LZString.compressToEncodedURIComponent(raw);
    return "R" + raw;   // base36 já é seguro em URL
  }
  function decodeShareData(s) {
    if (!s) return null;
    var tag = s.charAt(0), body = s.slice(1), raw = null;
    if (tag === "L" && typeof LZString !== "undefined") raw = LZString.decompressFromEncodedURIComponent(body);
    else if (tag === "R") raw = body;
    else raw = s;
    if (!raw) return null;
    // tolerante a mudança de tamanho: decodifica o prefixo que coincide.
    // Como só ACRESCENTAMOS figurinhas no fim, links antigos continuam válidos.
    var owned = {};
    for (var i = 0; i < raw.length && i < ALL.length; i++) {
      var c = parseInt(raw.charAt(i), 36); if (isNaN(c)) c = 0;
      if (c > 0) owned[ALL[i].code] = c;
    }
    return owned;
  }
  function buildShareURL() {
    var url = location.origin + location.pathname + "#s=" + buildShareData();
    var nm = (state.shareName || "").trim();
    if (nm) url += "&n=" + encodeURIComponent(nm);
    return url;
  }
  function parseShareHash() {
    var h = location.hash || "";
    if (h.indexOf("s=") === -1) return null;
    var params = {};
    h.replace(/^#/, "").split("&").forEach(function (kv) {
      var i = kv.indexOf("="); if (i > -1) params[kv.slice(0, i)] = kv.slice(i + 1);
    });
    var owned = decodeShareData(params.s);
    if (!owned) return null;
    return { owned: owned, name: params.n ? decodeURIComponent(params.n) : "" };
  }

  // ----- Tela do amigo (visualização da lista compartilhada) -----
  var friendData = null;
  function friendPill(s, n) {
    return '<span class="pill' + (s.foil ? " foil" : "") + '">' +
      '<span class="code">' + s.code + (s.foil ? " ✨" : "") + '</span>' +
      (nameOf(s) ? '<span class="nm">' + esc(nameOf(s)) + '</span>' : '') +
      (n > 1 ? '<span class="x">×' + n + '</span>' : '') + '</span>';
  }
  function pillRow(list, dupFn) {
    if (!list.length) return '<p class="list-head" style="margin:0">' + esc(t("friend_none")) + '</p>';
    var h = '<div class="pillrow">';
    list.forEach(function (s) { h += friendPill(s, dupFn ? dupFn(s.code) : 1); });
    return h + '</div>';
  }
  function renderFriend() {
    var f = friendData; if (!f) return;
    var fc = function (code) { return f.owned[code] || 0; };
    var fDup = function (c) { return Math.max(0, fc(c) - 1); };
    var fGot = ALL.filter(function (s) { return fc(s.code) >= 1; }).length;
    var nm = f.name || t("friend_someone");
    document.getElementById("friendTitle").textContent = t("friend_title", { nome: nm });
    document.getElementById("friendSub").textContent =
      t("friend_sub", { n: fGot, total: ALL.length, pct: pct(fGot, ALL.length) });

    var iHaveColl = Object.keys(state.owned).length > 0;
    var theyGiveYou = ALL.filter(function (s) { return fDup(s.code) > 0 && count(s.code) === 0; });
    var youGiveThem = ALL.filter(function (s) { return dupes(s.code) > 0 && fc(s.code) === 0; });
    var theirDup = ALL.filter(function (s) { return fDup(s.code) > 0; });
    var theirMiss = ALL.filter(function (s) { return fc(s.code) === 0; });

    var enm = esc(nm);
    var h = "";
    if (iHaveColl) {
      h += '<div class="match-card get"><h3>' + t("friend_get", { nome: enm, n: theyGiveYou.length }) + '</h3>' +
        pillRow(theyGiveYou, fDup) + '</div>';
      h += '<div class="match-card give"><h3>' + t("friend_give", { nome: enm, n: youGiveThem.length }) + '</h3>' +
        pillRow(youGiveThem, dupes) + '</div>';
    } else {
      h += '<div class="match-card"><h3>' + t("friend_tip_t") + '</h3><p style="margin:0;color:var(--text-dim);font-size:.85rem">' +
        t("friend_tip", { nome: enm }) + '</p></div>';
    }
    h += '<div class="card"><h2>' + t("friend_their_sw", { nome: enm, n: theirDup.length }) + '</h2>' + pillRow(theirDup, fDup) + '</div>';
    h += '<div class="card"><h2>' + t("friend_their_ms", { nome: enm, n: theirMiss.length }) + '</h2>' + pillRow(theirMiss, null) + '</div>';
    document.getElementById("friendBody").innerHTML = h;
  }
  function showFriend() { renderFriend(); showView("friend"); }
  function exitFriend() {
    friendData = null;
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    showView("album");
  }

  // =========================================================================
  //  AÇÕES DE ESTADO
  // =========================================================================
  function toggleHave(code) {
    setCount(code, have(code) ? 0 : 1);
    afterChange();
  }
  function addDupe(code) {
    setCount(code, count(code) + 1);   // 0->1 (passa a ter), 1->2 (1 repetida)...
    afterChange();
  }
  function removeDupe(code) {
    if (count(code) >= 2) { setCount(code, count(code) - 1); afterChange(); }
  }
  // Figurinhas de uma seção (abertura / time / coca-cola) a partir do id do accordion.
  function stickersForAcc(id) {
    if (id === "fwc") return A.abertura.stickers;
    if (id === "coke") return A.coke.stickers;
    if (id.indexOf("team-") === 0) {
      var code = id.slice(5), res = [];
      A.grupos.forEach(function (g) { g.teams.forEach(function (t) { if (t.code === code) res = t.stickers; }); });
      return res;
    }
    return [];
  }
  // Nome amigável da seção (para a mensagem de confirmação).
  function sectionName(id) {
    if (id === "fwc") return t("sec_opening");
    if (id === "coke") return t("sec_coke");
    if (id.indexOf("team-") === 0) {
      var code = id.slice(5), nm = code;
      A.grupos.forEach(function (g) { g.teams.forEach(function (tm) { if (tm.code === code) nm = tm.name; }); });
      return nm;
    }
    return t("section_this");
  }
  // Botão "Tudo": marca todas as que faltam (mantém repetidas). Se já está
  // completa, limpa tudo. Pede CONFIRMAÇÃO nas duas ações (evita toque acidental).
  function markAllTeam(id) {
    var sts = stickersForAcc(id);
    if (!sts.length) return;
    var allHave = sts.every(function (s) { return have(s.code); });
    // "Tudo" (marcar) é direto — já estamos no modo "Várias", ativado de propósito.
    // "Limpar" apaga tudo (incl. repetidas), então pede confirmação.
    if (allHave) {
      if (!confirm(t("confirm_clear", { nome: sectionName(id) }))) return;
    }
    sts.forEach(function (s) {
      if (allHave) setCount(s.code, 0);
      else if (count(s.code) === 0) setCount(s.code, 1);
    });
    afterChange();
  }

  function afterChange() {
    refreshChrome();
    renderActive();
  }
  function refreshChrome() {
    var st = stats();
    document.getElementById("progFill").style.width = pct(st.have, st.total) + "%";
    document.getElementById("progHave").textContent = st.have;
    document.getElementById("progOf").textContent = t("head_of", { total: st.total });
    document.getElementById("chipMiss").textContent = st.miss;
    document.getElementById("chipRep").textContent = st.rep;
    document.getElementById("chipMissL").textContent = t("chip_missing");
    document.getElementById("chipRepL").textContent = t("chip_swaps");
    document.getElementById("progPct").textContent = pct(st.have, st.total) + "%";
    // badge de repetidas na aba
    var repTab = document.querySelector('.tab[data-v="rep"]');
    var old = repTab.querySelector(".badge");
    if (old) old.remove();
    if (st.rep > 0) {
      var b = document.createElement("span");
      b.className = "badge"; b.textContent = st.rep;
      repTab.appendChild(b);
    }
  }

  // =========================================================================
  //  NAVEGAÇÃO ENTRE VIEWS
  // =========================================================================
  var current = "album";
  function renderActive() {
    if (current === "album") renderAlbum();
    else if (current === "faltam") renderFaltam();
    else if (current === "rep") renderRep();
    else if (current === "share") renderShare();
  }
  function showView(v) {
    current = v;
    var map = { album: "view-album", faltam: "view-faltam", rep: "view-rep", share: "view-share", config: "view-config", friend: "view-friend" };
    Object.keys(map).forEach(function (k) {
      document.getElementById(map[k]).classList.toggle("active", k === v);
    });
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-v") === v);
    });
    renderActive();
    window.scrollTo(0, 0);
  }

  // =========================================================================
  //  SHEET (detalhe / editar)
  // =========================================================================
  var sheetCode = null;
  function openSheet(code) {
    if (state.locked) { toast(t("t_locked")); return; }   // travado: não abre edição
    var s = A.byCode[code]; if (!s) return;
    sheetCode = code;
    document.getElementById("shCode").textContent = s.code;
    var sub = [];
    if (s.teamName && s.type !== "fwc" && s.type !== "coke") sub.push(s.teamName);
    if (s.group) sub.push(t("group", { x: s.group }));
    sub.push(s.type === "logo" ? t("type_crest") : s.type === "photo" ? t("type_photo") :
             s.type === "player" ? t("type_player") : s.teamName);
    document.getElementById("shSub").textContent = sub.join(" · ");
    document.getElementById("shFoil").style.display = s.foil ? "block" : "none";
    document.getElementById("shFoil").textContent = t("sheet_foil");
    document.getElementById("shName").value = nameOf(s);
    document.getElementById("shName").placeholder =
      s.type === "player" ? t("sheet_name_player") : t("sheet_name_desc");
    syncSheet();
    document.getElementById("backdrop").classList.add("show");
  }
  function syncSheet() {
    var have1 = have(sheetCode);
    var btn = document.getElementById("shHave");
    btn.textContent = have1 ? t("sheet_have_on") : t("sheet_have_off");
    btn.classList.toggle("on", have1);
    document.getElementById("shDup").textContent = dupes(sheetCode);
  }
  function closeSheet() {
    // salva nome editado
    if (sheetCode) {
      var v = document.getElementById("shName").value.trim();
      var base = A.byCode[sheetCode].name || "";
      if (v && v !== base) state.names[sheetCode] = v;
      else delete state.names[sheetCode];
      save();
    }
    document.getElementById("backdrop").classList.remove("show");
    sheetCode = null;
    afterChange();
  }

  // =========================================================================
  //  EVENTOS
  // =========================================================================
  function setMode(m, silent) {
    markMode = (m === "dup" || m === "bulk") ? m : "have";
    var opts = document.querySelectorAll("#markmode .mm-opt");
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle("active", opts[i].getAttribute("data-mode") === markMode);
    }
    document.body.classList.toggle("mode-dup", markMode === "dup");
    var hint = document.getElementById("hint");
    if (hint) hint.textContent =
      markMode === "dup" ? t("hint_swap") : markMode === "bulk" ? t("hint_bulk") : t("hint_have");
    if (!silent) renderAlbum();   // silent=true quando chamado só p/ trocar idioma
  }

  function bind() {
    // (declarados aqui no topo p/ serem compartilhados entre os handlers de
    //  clique e de "segurar" abaixo)
    var pressTimer = null;
    var longPressed = false;

    // Delegação de cliques no álbum
    document.getElementById("album").addEventListener("click", function (e) {
      // "Tudo" / "Limpar": marca (ou limpa) todas as figurinhas da seção
      var ma = e.target.closest("[data-markall]");
      if (ma) { markAllTeam(ma.getAttribute("data-markall")); return; }
      var toggle = e.target.closest("[data-acctoggle]");
      if (toggle) {
        var id = toggle.getAttribute("data-acctoggle");
        openSet[id] = !openSet[id];
        renderAlbum();
        return;
      }
      // Legends: expandir um jogador (dropdown)
      var lgTog = e.target.closest("[data-lgtoggle]");
      if (lgTog) {
        var lid = "lg-" + lgTog.getAttribute("data-lgtoggle");
        openSet[lid] = !openSet[lid];
        renderAlbum();
        return;
      }
      // Legends: − / + de um nível (conta repetidas) — bloqueado se travado
      var lgBtn = e.target.closest("[data-lgact]");
      if (lgBtn) {
        if (state.locked) { toast(t("t_locked")); return; }
        var gid = lgBtn.getAttribute("data-lg"), tier = lgBtn.getAttribute("data-tier");
        var cur = legendCount(gid, tier);
        setLegendCount(gid, tier, lgBtn.getAttribute("data-lgact") === "inc" ? cur + 1 : cur - 1);
        renderAlbum();
        return;
      }
      var act = e.target.closest("[data-act]");
      var cell = e.target.closest(".cell");
      if (!cell) return;
      // CADEADO: navega (times já abrem acima), mas não altera figurinhas
      if (state.locked) { toast(t("t_locked")); return; }
      var code = cell.getAttribute("data-code");
      if (act && act.getAttribute("data-act") === "plus") { addDupe(code); return; }
      if (act && act.getAttribute("data-act") === "minus") { removeDupe(code); return; }
      if (longPressed) { longPressed = false; return; } // evita toggle após segurar
      if (markMode === "dup") addDupe(code);   // modo repetida: cada toque soma +1
      else toggleHave(code);
    });

    // Long-press (segurar) + botão direito -> abre sheet
    var albumEl = document.getElementById("album");
    albumEl.addEventListener("touchstart", function (e) {
      var cell = e.target.closest(".cell");
      if (!cell || e.target.closest("[data-act]")) return;
      longPressed = false;
      pressTimer = setTimeout(function () {
        longPressed = true;
        if (navigator.vibrate) navigator.vibrate(15);
        openSheet(cell.getAttribute("data-code"));
      }, 420);
    }, { passive: true });
    function cancelPress() { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } }
    albumEl.addEventListener("touchend", cancelPress);
    albumEl.addEventListener("touchmove", cancelPress);
    albumEl.addEventListener("contextmenu", function (e) {
      var cell = e.target.closest(".cell");
      if (cell) { e.preventDefault(); openSheet(cell.getAttribute("data-code")); }
    });

    // Pílulas nas listas -> abrem sheet
    ["faltamList", "repList"].forEach(function (idd) {
      document.getElementById(idd).addEventListener("click", function (e) {
        var pill = e.target.closest(".pill");
        if (pill) openSheet(pill.getAttribute("data-code"));
      });
    });

    // Filtros
    document.getElementById("filters").addEventListener("click", function (e) {
      var chip = e.target.closest(".chip"); if (!chip) return;
      filter = chip.getAttribute("data-f");
      document.querySelectorAll("#filters .chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      renderAlbum();
    });

    // Alternador "o toque marca: Tenho / Repetida"
    document.getElementById("markmode").addEventListener("click", function (e) {
      var b = e.target.closest(".mm-opt");
      if (b) setMode(b.getAttribute("data-mode"));
    });

    // Busca (com debounce)
    var st;
    document.getElementById("search").addEventListener("input", function (e) {
      clearTimeout(st);
      st = setTimeout(function () { search = e.target.value.trim(); renderAlbum(); }, 130);
    });

    // Abas
    document.getElementById("tabbar").addEventListener("click", function (e) {
      var tab = e.target.closest(".tab"); if (!tab) return;
      if (friendData) {   // sair da tela do amigo limpa o link compartilhado
        friendData = null;
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      }
      showView(tab.getAttribute("data-v"));
    });
    document.getElementById("btnConfig").addEventListener("click", function () { showView("config"); });

    // Sheet
    document.getElementById("shHave").addEventListener("click", function () {
      setCount(sheetCode, have(sheetCode) ? 0 : 1); syncSheet();
    });
    document.getElementById("shPlus").addEventListener("click", function () {
      setCount(sheetCode, count(sheetCode) + 1); syncSheet();
    });
    document.getElementById("shMinus").addEventListener("click", function () {
      setCount(sheetCode, count(sheetCode) - 1); syncSheet();
    });
    document.getElementById("shClose").addEventListener("click", closeSheet);
    document.getElementById("backdrop").addEventListener("click", function (e) {
      if (e.target.id === "backdrop") closeSheet();
    });

    // Compartilhar
    document.getElementById("btnWhats").addEventListener("click", function () {
      copyText(buildFullText(), t("t_list_copied"));
    });
    document.getElementById("btnCopyRep").addEventListener("click", function () {
      var txt = buildRepText();
      copyText(txt ? (t("t_swaps_head") + "\n" + txt) : t("t_no_swaps"), t("t_swaps_copied"));
    });
    document.getElementById("btnCopyMiss").addEventListener("click", function () {
      var txt = buildMissText();
      copyText(txt ? (t("t_missing_head") + "\n" + txt) : t("t_done_album"), t("t_missing_copied"));
    });

    // Compartilhar coleção por link / QR
    document.getElementById("btnGenLink").addEventListener("click", function () {
      state.shareName = document.getElementById("shareName").value.trim(); save();
      document.getElementById("shareLinkOut").value = buildShareURL();
      document.getElementById("shareLinkBox").style.display = "block";
      document.getElementById("qrBox").style.display = "none";
      toast(t("t_link_gen"));
    });
    document.getElementById("btnCopyLink").addEventListener("click", function () {
      copyText(document.getElementById("shareLinkOut").value, t("t_link_copied"));
    });
    document.getElementById("btnWhatsLink").addEventListener("click", function () {
      var url = document.getElementById("shareLinkOut").value;
      window.open("https://wa.me/?text=" + encodeURIComponent(t("whats_link_msg", { url: url })), "_blank");
    });
    document.getElementById("btnQR").addEventListener("click", function () {
      var box = document.getElementById("qrBox");
      if (box.style.display === "block") { box.style.display = "none"; return; }
      var url = document.getElementById("shareLinkOut").value;
      if (typeof qrcode === "undefined") { toast(t("t_qr_off")); return; }
      try {
        var qr = qrcode(0, "L"); qr.addData(url); qr.make();
        box.innerHTML = qr.createImgTag(4, 8);
        box.style.display = "block";
      } catch (e) { toast(t("t_qr_big")); }
    });
    document.getElementById("btnExitFriend").addEventListener("click", exitFriend);
    if (navigator.share) {
      var sb = document.getElementById("btnShareApi");
      sb.style.display = "flex";
      sb.addEventListener("click", function () {
        navigator.share({ title: t("share_title"), text: buildFullText() }).catch(function () {});
      });
    }

    // Idioma — botão (toggle PT/EN) + dropdown nos Ajustes
    document.getElementById("btnLang").addEventListener("click", function () {
      var cur = state.lang || detectLang();
      setLang(cur === "en" ? "pt" : "en");
    });
    document.getElementById("langSelect").addEventListener("change", function (e) {
      setLang(e.target.value);
    });
    // Cadeado — botão 🔒
    document.getElementById("btnLock").addEventListener("click", toggleLock);

    // Layout — dropdown nos Ajustes
    document.getElementById("themeSelect").addEventListener("change", function (e) {
      setLayout(e.target.value);
    });
    // Layout — botão 🎨 no topo + menu rápido
    var laySheet = document.getElementById("laySheet");
    document.getElementById("btnLayout").addEventListener("click", function () {
      syncLayoutMenu(); laySheet.classList.add("show");
    });
    laySheet.addEventListener("click", function (e) {
      if (e.target.classList.contains("bd")) { laySheet.classList.remove("show"); return; }
      var opt = e.target.closest("[data-lay]");
      if (opt) { setLayout(opt.getAttribute("data-lay")); laySheet.classList.remove("show"); }
    });

    // Backup
    document.getElementById("btnExport").addEventListener("click", exportData);
    document.getElementById("btnImport").addEventListener("click", function () {
      document.getElementById("fileImport").click();
    });
    document.getElementById("fileImport").addEventListener("change", importData);
    document.getElementById("btnReset").addEventListener("click", function () {
      if (confirm(t("confirm_reset"))) {
        state.owned = {}; state.names = {}; state.legends = {}; save(); afterChange(); toast(t("t_reset"));
      }
    });
    document.getElementById("btnForceUpdate").addEventListener("click", forceUpdate);
  }

  // =========================================================================
  //  LAYOUT (4 estilos: figurinha · noturno · vibrante · editorial)
  // =========================================================================
  var LAYOUTS = ["figurinha", "noturno", "vibrante", "editorial"];
  var LAYOUT_LABELS = { figurinha: "Figurinha", noturno: "Noturno", vibrante: "Vibrante", editorial: "Editorial" };
  // converte os temas da versão antiga para os novos layouts
  function mapOldTheme(t) {
    if (!t) return null;
    if (t === "oled" || t === "dark" || t === "expressive-dark") return "noturno";
    if (t === "expressive") return "figurinha";
    if (t === "light" || t === "auto") return "figurinha";
    return null;
  }
  function applyLayout() {
    var h = document.documentElement;
    if (LAYOUTS.indexOf(state.layout) === -1) state.layout = "figurinha";
    h.setAttribute("data-layout", state.layout);
    // barra de status do navegador acompanha o cabeçalho
    var meta = document.querySelector('meta[name="theme-color"]');
    var hdr = document.querySelector("header");
    if (meta && hdr) {
      var bg = getComputedStyle(hdr).backgroundColor;
      if (bg && bg.indexOf("gradient") === -1) meta.setAttribute("content", bg);
    }
    var sel = document.getElementById("themeSelect");
    if (sel && sel.value !== state.layout) sel.value = state.layout;
    syncLayoutMenu();
  }
  function syncLayoutMenu() {
    var opts = document.querySelectorAll("#laySheet [data-lay]");
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle("cur", opts[i].getAttribute("data-lay") === state.layout);
    }
  }
  function setLayout(name) {
    if (LAYOUTS.indexOf(name) === -1) name = "figurinha";
    state.layout = name; save(); applyLayout();
    toast(t("t_layout", { x: t("lay_" + name) }));
  }

  // =========================================================================
  //  IDIOMA (i18n) + CADEADO (lock)
  // =========================================================================
  function applyLang() {
    var lang = state.lang || detectLang();
    L = (window.I18N && window.I18N[lang]) || window.I18N.pt;
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "pt-BR");
    // botão mostra o OUTRO idioma (toggle): em PT mostra "EN", em EN mostra "PT"
    var lbl = document.getElementById("langLabel");
    if (lbl) lbl.textContent = (lang === "en") ? "PT" : "EN";
    var lsel = document.getElementById("langSelect");
    if (lsel && lsel.value !== lang) lsel.value = lang;
    applyStaticText();
  }
  function setLang(lang) {
    state.lang = (lang === "en") ? "en" : "pt";
    save(); applyLang();
    refreshChrome(); renderActive();
    toast(t("t_lang"));
  }
  // textos fixos do HTML (que não são redesenhados a cada render)
  function applyStaticText() {
    var set = function (id, key) { var e = document.getElementById(id); if (e) e.textContent = t(key); };
    var ph  = function (id, key) { var e = document.getElementById(id); if (e) e.placeholder = t(key); };
    // busca + filtros
    ph("search", "search_ph");
    var fmap = { all: "filter_all", falta: "filter_missing", have: "filter_have", dup: "filter_swaps", foil: "filter_foil" };
    document.querySelectorAll("#filters .chip").forEach(function (c) {
      var k = fmap[c.getAttribute("data-f")]; if (k) setChipText(c, t(k));
    });
    // modos
    var ml = document.querySelector("#markmode .mm-label"); if (ml) ml.textContent = t("mode_label");
    var mm = { have: "mode_have", dup: "mode_swap", bulk: "mode_bulk" };
    document.querySelectorAll("#markmode .mm-opt").forEach(function (b) {
      var k = mm[b.getAttribute("data-mode")]; if (k) b.textContent = t(k);
    });
    // abas
    var tabs = { album: "tab_album", faltam: "tab_missing", rep: "tab_swaps", share: "tab_trade" };
    document.querySelectorAll("#tabbar .tab").forEach(function (tb) {
      var k = tabs[tb.getAttribute("data-v")]; if (!k) return;
      var ic = tb.querySelector(".ic"); tb.textContent = ""; if (ic) tb.appendChild(ic);
      tb.insertAdjacentText("beforeend", t(k));
    });
    // todos os textos marcados com data-i / data-iph (cards, ajustes, etc.)
    applyDataI();
    // dica do modo atual
    setMode(markMode, true);
  }
  // aplica em qualquer elemento com data-i="chave" (texto) ou data-iph="chave" (placeholder)
  function applyDataI() {
    document.querySelectorAll("[data-i]").forEach(function (e) { e.textContent = t(e.getAttribute("data-i")); });
    document.querySelectorAll("[data-iph]").forEach(function (e) { e.placeholder = t(e.getAttribute("data-iph")); });
  }
  function setText(sel, key) { var e = document.querySelector(sel); if (e) e.textContent = t(key); }
  // troca só o texto do chip preservando o <svg>
  function setChipText(chip, txt) {
    var svg = chip.querySelector("svg"); chip.textContent = ""; if (svg) chip.appendChild(svg);
    chip.insertAdjacentText("beforeend", txt);
  }

  function applyLock() {
    document.body.classList.toggle("locked", state.locked);
    var btn = document.getElementById("btnLock");
    if (btn) {
      btn.classList.toggle("on", state.locked);
      btn.title = state.locked ? t("lock_on") : t("lock_off");
    }
  }
  function toggleLock() {
    state.locked = !state.locked; save(); applyLock();
    toast(state.locked ? t("t_locked") : t("t_unlocked"));
  }

  // =========================================================================
  //  BACKUP
  // =========================================================================
  function exportData() {
    var data = { app: "figurinhas2026", version: 1, exportedAt: new Date().toISOString(),
                 owned: state.owned, names: state.names, legends: state.legends };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var d = new Date();
    a.href = url;
    a.download = "album-copa2026-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(t("t_exported"));
  }
  function importData(e) {
    var file = e.target.files && e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || typeof d.owned !== "object") throw 0;
        if (!confirm(t("confirm_import"))) return;
        state.owned = d.owned || {};
        state.names = d.names || {};
        state.legends = d.legends || {};
        save(); afterChange(); toast(t("t_imported"));
      } catch (err) { toast(t("t_file_invalid")); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // =========================================================================
  //  UTILS
  // =========================================================================
  function pct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function esc(t) {
    return (t + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }
  var updatePending = false;
  function showUpdateBanner(worker) {
    var bar = document.getElementById("updateBar");
    if (!bar) return;
    bar.classList.add("show");
    document.getElementById("btnUpdate").onclick = function () {
      bar.classList.remove("show");
      updatePending = true;
      if (worker) worker.postMessage({ type: "SKIP_WAITING" });  // ativa a nova versão -> recarrega
    };
  }
  // Botão "forçar atualização": remove o service worker + limpa o cache dos
  // ARQUIVOS e recarrega (pega tudo fresco da internet). NÃO mexe nas figurinhas
  // marcadas (localStorage), que ficam intactas.
  function forceUpdate() {
    if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
      toast(t("t_offline")); return;
    }
    if (!confirm(t("confirm_update"))) return;
    toast(t("t_updating"));
    var reload = function () { location.reload(); };
    var p = Promise.resolve();
    if ("serviceWorker" in navigator) {
      p = navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) { return r.unregister(); }));
      });
    }
    p.then(function () {
      if (!("caches" in window)) return null;
      return caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      });
    }).then(reload, reload);
  }
  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); },
        function () { fallbackCopy(text, okMsg); });
    } else { fallbackCopy(text, okMsg); }
  }
  function fallbackCopy(text, okMsg) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(okMsg); }
    catch (e) { toast(t("t_copy_fail")); }
    ta.remove();
  }

  // =========================================================================
  //  INICIALIZAÇÃO
  // =========================================================================
  function init() {
    load();
    applyLayout();
    applyLang();    // define o dicionário e reescreve os textos estáticos
    applyLock();
    bind();
    refreshChrome();
    showView("album");

    // Se o link tem uma coleção compartilhada, abre a tela do amigo
    var shared = parseShareHash();
    if (shared) { friendData = shared; showFriend(); }

    // Service worker (offline) — só funciona via http(s), não em file://
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("service-worker.js").then(function (reg) {
        // já existe uma versão nova esperando?
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);
        // detecta quando uma nova versão termina de baixar
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(nw);
          });
        });
      }).catch(function () {});
      // recarrega 1x quando a nova versão assume o controle — só se o usuário
      // tocou em "Atualizar" (evita reload extra na 1ª instalação via clients.claim)
      var swReloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (updatePending && !swReloaded) { swReloaded = true; location.reload(); }
      });
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();

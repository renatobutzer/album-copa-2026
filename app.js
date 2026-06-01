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
  var state = { owned: {}, names: {}, theme: "expressive", shareName: "" };  // padrão: Material Expressive claro

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        state.owned = p.owned || {};
        state.names = p.names || {};
        state.theme = p.theme || "expressive";
        state.shareName = p.shareName || "";
      }
    } catch (e) { /* ignora */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast("Erro ao salvar 😕"); }
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
    if (s.type === "player") return "Jogador " + s.pos;
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
  function emojiBadge(e) { return '<span class="flag emoji">' + e + '</span>'; }

  function cellHTML(s) {
    var c = count(s.code), st = cellState(s.code), d = dupes(s.code);
    var cls = "cell " + (st === "have" ? "have" : st === "dup" ? "dup have" : "");
    if (s.foil) cls += " foil";
    var nm = nameOrPlaceholder(s);
    var tag = s.type === "logo" ? "escudo" : s.type === "photo" ? "elenco" : "";
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
    var col = teamColor(id.indexOf("team-") === 0 ? id.slice(5) : id);
    var prog = total ? Math.round((got / total) * 100) : 0;   // cada figurinha ~5% (20 por time)
    var done = total > 0 && got === total;
    return '<div class="acc' + (isOpen ? " open" : "") + (done ? " done" : "") + '" data-acc="' + id +
      '" style="--team:' + col[0] + ';--team-ink:' + col[1] + ';--progress:' + prog + '%">' +
      '<button class="acc-head" data-acctoggle="' + id + '">' +
        badge +
        '<span class="ttl">' + esc(title) + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span>' +
        '<span class="mini-prog">' + (done ? '✓ ' : '') + '<b>' + got + '</b>/' + total + '</span>' +
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
      accHTML(A.abertura.id, emojiBadge(A.abertura.flag), A.abertura.title, "20 figurinhas · todas foil ✨", A.abertura.stickers) +
      '</div>';

    // Grupos A–L
    for (var g = 0; g < A.grupos.length; g++) {
      var grp = A.grupos[g];
      var teamsHTML = "";
      for (var t = 0; t < grp.teams.length; t++) {
        var tm = grp.teams[t];
        teamsHTML += accHTML("team-" + tm.code, teamBadge(tm.code), tm.name, "20 figurinhas", tm.stickers);
      }
      if (teamsHTML) {
        html += '<div class="section"><div class="group-label">' + grp.title + '</div>' + teamsHTML + '</div>';
      }
    }

    // Coca-Cola
    html += '<div class="section">' +
      accHTML(A.coke.id, emojiBadge(A.coke.flag), A.coke.title, "14 figurinhas · CC1–CC14 (nº pode variar)", A.coke.stickers) +
      '</div>';

    if (!html.replace(/<div class="section">\s*<\/div>/g, "").trim()) {
      html = '<div class="empty"><div class="big">🔍</div>Nada encontrado com esse filtro/busca.</div>';
    }
    el.innerHTML = html;
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
    pushGroup("fwc", A.abertura.title, emojiBadge(A.abertura.flag), A.abertura.stickers);
    A.grupos.forEach(function (grp) {
      grp.teams.forEach(function (tm) {
        pushGroup("team-" + tm.code, tm.name + " (" + grp.title + ")", teamBadge(tm.code), tm.stickers);
      });
    });
    pushGroup("coke", A.coke.title, emojiBadge(A.coke.flag), A.coke.stickers);
    return groups;
  }

  function renderFaltam() {
    var groups = groupByTeam(function (s) { return !have(s.code); });
    var st = stats();
    document.getElementById("faltamHead").innerHTML =
      "Faltam <b>" + st.miss + "</b> de " + st.total + " figurinhas." +
      (st.foilTotal ? " (✨ foil: " + (st.foilTotal - st.foilHave) + " faltando)" : "");
    var el = document.getElementById("faltamList");
    if (!groups.length) {
      el.innerHTML = '<div class="empty"><div class="big">🏆</div>Você completou o álbum! Parabéns!</div>';
      return;
    }
    var h = "";
    groups.forEach(function (g) {
      var col = teamColor(g.key.indexOf("team-") === 0 ? g.key.slice(5) : g.key);
      h += '<div class="list-group" style="--team:' + col[0] + ';--team-ink:' + col[1] + '"><h3>' + g.badge + " " + esc(g.label) +
        ' <span class="cnt">— faltam ' + g.items.length + '</span></h3><div class="pillrow">';
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
    document.getElementById("repHead").innerHTML =
      "Você tem <b>" + st.rep + "</b> figurinha(s) repetida(s) para trocar.";
    var el = document.getElementById("repList");
    if (!groups.length) {
      el.innerHTML = '<div class="empty"><div class="big">🔄</div>Nenhuma repetida ainda.<br>Toque no <b>+</b> de uma figurinha que você tem em dobro.</div>';
      return;
    }
    var h = "";
    groups.forEach(function (g) {
      var tot = g.items.reduce(function (a, s) { return a + dupes(s.code); }, 0);
      var col = teamColor(g.key.indexOf("team-") === 0 ? g.key.slice(5) : g.key);
      h += '<div class="list-group" style="--team:' + col[0] + ';--team-ink:' + col[1] + '"><h3>' + g.badge + " " + esc(g.label) +
        ' <span class="cnt">— ' + tot + ' p/ trocar</span></h3><div class="pillrow">';
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
    var L = [];
    L.push("⚽ Álbum Copa 2026 — minha lista");
    L.push("📊 Tenho " + st.have + "/" + st.total + " (" + pct(st.have, st.total) + "%)");
    L.push("");
    L.push("🔄 REPETIDAS p/ trocar (" + st.rep + "):");
    L.push(rep || "—");
    L.push("");
    L.push("❌ FALTAM (" + st.miss + "):");
    L.push(miss || "— completei! 🏆");
    L.push("");
    L.push("(✨ = foil/brilhante)");
    return L.join("\n");
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
    if (!list.length) return '<p class="list-head" style="margin:0">— nenhuma</p>';
    var h = '<div class="pillrow">';
    list.forEach(function (s) { h += friendPill(s, dupFn ? dupFn(s.code) : 1); });
    return h + '</div>';
  }
  function renderFriend() {
    var f = friendData; if (!f) return;
    var fc = function (code) { return f.owned[code] || 0; };
    var fDup = function (c) { return Math.max(0, fc(c) - 1); };
    var fGot = ALL.filter(function (s) { return fc(s.code) >= 1; }).length;
    var nm = f.name || "um amigo";
    document.getElementById("friendTitle").textContent = "📋 Lista de troca — " + nm;
    document.getElementById("friendSub").textContent =
      "Tem " + fGot + "/" + ALL.length + " (" + pct(fGot, ALL.length) + "%) · você está só visualizando";

    var iHaveColl = Object.keys(state.owned).length > 0;
    var theyGiveYou = ALL.filter(function (s) { return fDup(s.code) > 0 && count(s.code) === 0; });
    var youGiveThem = ALL.filter(function (s) { return dupes(s.code) > 0 && fc(s.code) === 0; });
    var theirDup = ALL.filter(function (s) { return fDup(s.code) > 0; });
    var theirMiss = ALL.filter(function (s) { return fc(s.code) === 0; });

    var h = "";
    if (iHaveColl) {
      h += '<div class="match-card get"><h3>🎯 ' + esc(nm) + ' tem repetida e VOCÊ precisa (' + theyGiveYou.length + ')</h3>' +
        pillRow(theyGiveYou, fDup) + '</div>';
      h += '<div class="match-card give"><h3>🎁 VOCÊ tem repetida e ' + esc(nm) + ' precisa (' + youGiveThem.length + ')</h3>' +
        pillRow(youGiveThem, dupes) + '</div>';
    } else {
      h += '<div class="match-card"><h3>💡 Dica</h3><p style="margin:0;color:var(--text-dim);font-size:.85rem">' +
        'Marque a sua coleção (aba Álbum) que o app passa a mostrar aqui, automaticamente, o que combina pra trocar com ' + esc(nm) + '.</p></div>';
    }
    h += '<div class="card"><h2>🔄 Repetidas de ' + esc(nm) + ' (' + theirDup.length + ')</h2>' + pillRow(theirDup, fDup) + '</div>';
    h += '<div class="card"><h2>❌ Falta para ' + esc(nm) + ' (' + theirMiss.length + ')</h2>' + pillRow(theirMiss, null) + '</div>';
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

  function afterChange() {
    refreshChrome();
    renderActive();
  }
  function refreshChrome() {
    var st = stats();
    document.getElementById("progFill").style.width = pct(st.have, st.total) + "%";
    document.getElementById("progText").textContent = st.have + " / " + st.total;
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
    var s = A.byCode[code]; if (!s) return;
    sheetCode = code;
    document.getElementById("shCode").textContent = s.code;
    var sub = [];
    if (s.teamName && s.type !== "fwc" && s.type !== "coke") sub.push(s.teamName);
    if (s.group) sub.push("Grupo " + s.group);
    sub.push(s.type === "logo" ? "Escudo" : s.type === "photo" ? "Foto do elenco" :
             s.type === "player" ? "Jogador" : s.teamName);
    document.getElementById("shSub").textContent = sub.join(" · ");
    document.getElementById("shFoil").style.display = s.foil ? "block" : "none";
    document.getElementById("shName").value = nameOf(s);
    document.getElementById("shName").placeholder =
      s.type === "player" ? "Nome do jogador" : "Descrição";
    syncSheet();
    document.getElementById("backdrop").classList.add("show");
  }
  function syncSheet() {
    var have1 = have(sheetCode);
    var btn = document.getElementById("shHave");
    btn.textContent = have1 ? "✅ Tenho esta" : "Marcar que tenho";
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
  function setMode(m) {
    markMode = (m === "dup") ? "dup" : "have";
    var opts = document.querySelectorAll("#markmode .mm-opt");
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle("active", opts[i].getAttribute("data-mode") === markMode);
    }
    document.body.classList.toggle("mode-dup", markMode === "dup");
    var hint = document.getElementById("hint");
    if (hint) hint.innerHTML = markMode === "dup"
      ? "🔄 <b>Modo repetida</b>: cada toque soma +1 · toque no ×N para tirar · segure para editar"
      : "Toque para marcar que tem · toque no <b>+</b> para repetida · segure para editar nome";
  }

  function bind() {
    // (declarados aqui no topo p/ serem compartilhados entre os handlers de
    //  clique e de "segurar" abaixo)
    var pressTimer = null;
    var longPressed = false;

    // Delegação de cliques no álbum
    document.getElementById("album").addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-acctoggle]");
      if (toggle) {
        var id = toggle.getAttribute("data-acctoggle");
        openSet[id] = !openSet[id];
        renderAlbum();
        return;
      }
      var act = e.target.closest("[data-act]");
      var cell = e.target.closest(".cell");
      if (!cell) return;
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
      copyText(buildFullText(), "Lista copiada! Cole no WhatsApp 📲");
    });
    document.getElementById("btnCopyRep").addEventListener("click", function () {
      var t = buildRepText();
      copyText(t ? ("🔄 Repetidas p/ troca:\n" + t) : "Sem repetidas ainda.", "Repetidas copiadas!");
    });
    document.getElementById("btnCopyMiss").addEventListener("click", function () {
      var t = buildMissText();
      copyText(t ? ("❌ Faltam:\n" + t) : "Você completou o álbum! 🏆", "Faltantes copiadas!");
    });

    // Compartilhar coleção por link / QR
    document.getElementById("btnGenLink").addEventListener("click", function () {
      state.shareName = document.getElementById("shareName").value.trim(); save();
      document.getElementById("shareLinkOut").value = buildShareURL();
      document.getElementById("shareLinkBox").style.display = "block";
      document.getElementById("qrBox").style.display = "none";
      toast("Link gerado 🔗");
    });
    document.getElementById("btnCopyLink").addEventListener("click", function () {
      copyText(document.getElementById("shareLinkOut").value, "Link copiado! 🔗");
    });
    document.getElementById("btnWhatsLink").addEventListener("click", function () {
      var url = document.getElementById("shareLinkOut").value;
      window.open("https://wa.me/?text=" + encodeURIComponent("Minha lista de troca do álbum da Copa 2026 👉 " + url), "_blank");
    });
    document.getElementById("btnQR").addEventListener("click", function () {
      var box = document.getElementById("qrBox");
      if (box.style.display === "block") { box.style.display = "none"; return; }
      var url = document.getElementById("shareLinkOut").value;
      if (typeof qrcode === "undefined") { toast("QR indisponível"); return; }
      try {
        var qr = qrcode(0, "L"); qr.addData(url); qr.make();
        box.innerHTML = qr.createImgTag(4, 8);
        box.style.display = "block";
      } catch (e) { toast("Link grande demais p/ QR — use copiar"); }
    });
    document.getElementById("btnExitFriend").addEventListener("click", exitFriend);
    if (navigator.share) {
      var sb = document.getElementById("btnShareApi");
      sb.style.display = "flex";
      sb.addEventListener("click", function () {
        navigator.share({ title: "Álbum Copa 2026", text: buildFullText() }).catch(function () {});
      });
    }

    // Tema (dropdown)
    document.getElementById("themeSelect").addEventListener("change", function (e) {
      setTheme(e.target.value);
    });

    // Backup
    document.getElementById("btnExport").addEventListener("click", exportData);
    document.getElementById("btnImport").addEventListener("click", function () {
      document.getElementById("fileImport").click();
    });
    document.getElementById("fileImport").addEventListener("change", importData);
    document.getElementById("btnReset").addEventListener("click", function () {
      if (confirm("Apagar TODAS as marcações? Não dá para desfazer.")) {
        state.owned = {}; state.names = {}; save(); afterChange(); toast("Tudo zerado.");
      }
    });
  }

  // =========================================================================
  //  TEMA
  // =========================================================================
  var THEMES = ["auto", "light", "dark", "oled", "expressive", "expressive-dark"];
  var THEME_LABELS = {
    auto: "Automático", light: "Claro", dark: "Escuro",
    oled: "Preto total", expressive: "Expressive", "expressive-dark": "Expressive escuro"
  };
  function applyTheme() {
    var h = document.documentElement;
    if (state.theme === "auto") h.removeAttribute("data-theme");
    else h.setAttribute("data-theme", state.theme);
    // a barra de status do navegador acompanha a cor do cabeçalho
    var meta = document.querySelector('meta[name="theme-color"]');
    var hdr = document.querySelector("header");
    if (meta && hdr) meta.setAttribute("content", getComputedStyle(hdr).backgroundColor);
    // sincroniza o dropdown com o tema atual
    var sel = document.getElementById("themeSelect");
    if (sel && sel.value !== state.theme) sel.value = state.theme;
  }
  function setTheme(name) {
    if (THEMES.indexOf(name) === -1) name = "auto";
    state.theme = name; save(); applyTheme();
    toast("Tema: " + THEME_LABELS[name]);
  }

  // =========================================================================
  //  BACKUP
  // =========================================================================
  function exportData() {
    var data = { app: "figurinhas2026", version: 1, exportedAt: new Date().toISOString(),
                 owned: state.owned, names: state.names };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var d = new Date();
    a.href = url;
    a.download = "album-copa2026-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Arquivo exportado ⬇️");
  }
  function importData(e) {
    var file = e.target.files && e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || typeof d.owned !== "object") throw 0;
        if (!confirm("Substituir seu progresso atual pelos dados do arquivo?")) return;
        state.owned = d.owned || {};
        state.names = d.names || {};
        save(); afterChange(); toast("Progresso importado ✅");
      } catch (err) { toast("Arquivo inválido 😕"); }
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
    catch (e) { toast("Não consegui copiar 😕"); }
    ta.remove();
  }

  // =========================================================================
  //  INICIALIZAÇÃO
  // =========================================================================
  function init() {
    load();
    applyTheme();
    document.getElementById("headSub").textContent =
      "Panini · " + A.meta.totalComInserts + " figurinhas";
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

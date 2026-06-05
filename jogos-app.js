/* ============================================================================
   ABA JOGOS — lógica (tabela de grupos + classificação + bracket do mata-mata)
   Exposto como window.JogosModule. O app.js chama: JogosModule.init(ctx).
   ctx = { t, teamName, teamColor, getScores, setScore, save, locked }
   - getScores() -> objeto { "13":[2,0], "16":[1,1], ... } (placares por jogo n)
   - setScore(n, h, a) salva (h/a = número ou null)
============================================================================ */
window.JogosModule = (function () {
  "use strict";
  var J = window.JOGOS, ctx = null;
  var view = "grupos";       // "grupos" | "chave"
  var groupSel = "A";        // grupo ativo (ou "date")
  var koSel = "R32";         // fase ativa no mata-mata

  function init(context) { ctx = context; }
  function t(k, v) { return ctx.t(k, v); }

  // ---------- helpers de placar ----------
  function score(n) { var s = ctx.getScores()[n]; return (s && s.length === 2) ? s : null; }
  function played(n) { var s = score(n); return s && s[0] != null && s[1] != null; }

  // ---------- tabela de um grupo ----------
  // retorna [{code, J,V,E,D, gp,gc,sg, pts}] ordenado pela classificação
  function tableOf(group) {
    var teams = {};
    J.groupGames.filter(function (g) { return g.group === group; })
      .forEach(function (g) {
        [g.home, g.away].forEach(function (c) {
          if (!teams[c]) teams[c] = { code: c, J:0,V:0,E:0,D:0, gp:0,gc:0, pts:0 };
        });
      });
    var games = J.groupGames.filter(function (g) { return g.group === group && played(g.n); });
    games.forEach(function (g) {
      var s = score(g.n), h = teams[g.home], a = teams[g.away];
      h.J++; a.J++; h.gp += s[0]; h.gc += s[1]; a.gp += s[1]; a.gc += s[0];
      if (s[0] > s[1]) { h.V++; h.pts += 3; a.D++; }
      else if (s[0] < s[1]) { a.V++; a.pts += 3; h.D++; }
      else { h.E++; a.E++; h.pts++; a.pts++; }
    });
    var arr = Object.keys(teams).map(function (c) {
      var x = teams[c]; x.sg = x.gp - x.gc; return x;
    });
    // ordenação: pts -> saldo -> gols pró -> (confronto direto) -> nome
    arr.sort(function (x, y) {
      if (y.pts !== x.pts) return y.pts - x.pts;
      if (y.sg !== x.sg) return y.sg - x.sg;
      if (y.gp !== x.gp) return y.gp - x.gp;
      var h2h = headToHead(group, x.code, y.code);
      if (h2h) return h2h;
      return ctx.teamName(x.code).localeCompare(ctx.teamName(y.code));
    });
    return arr;
  }
  // desempate por confronto direto (só entre 2 times): + se x melhor
  function headToHead(group, a, b) {
    var g = J.groupGames.find(function (gm) {
      return gm.group === group && played(gm.n) &&
        ((gm.home === a && gm.away === b) || (gm.home === b && gm.away === a));
    });
    if (!g) return 0;
    var s = score(g.n), ha = (g.home === a) ? s[0] : s[1], hb = (g.home === a) ? s[1] : s[0];
    return hb - ha; // se a fez mais gols, retorna negativo => a vem antes (sort asc)
  }
  function groupComplete(group) {
    return J.groupGames.filter(function (g) { return g.group === group; }).every(function (g) { return played(g.n); });
  }

  // ---------- 8 melhores terceiros ----------
  function thirdsRanking() {
    var rows = "ABCDEFGHIJKL".split("").map(function (gr) {
      if (!groupComplete(gr)) return null;
      var third = tableOf(gr)[2];
      return { group: gr, code: third.code, pts: third.pts, sg: third.sg, gp: third.gp };
    }).filter(Boolean);
    rows.sort(function (x, y) {
      return (y.pts - x.pts) || (y.sg - x.sg) || (y.gp - x.gp) ||
             ctx.teamName(x.code).localeCompare(ctx.teamName(y.code));
    });
    return rows.slice(0, 8); // os 8 melhores (só quando os 12 grupos terminaram)
  }

  // ---------- resolve um "slot" do mata-mata para um código de time ----------
  // "1A"->1º do A; "2B"->2º; "3*"(+thirds)->terceiro elegível; "W73"->venc. jogo 73; "L101"->perd.
  function resolveSlot(slot, thirdsList) {
    if (!slot) return null;
    if (slot === "3*") {
      // só dá pra resolver quando todos os 12 grupos terminaram E sabemos os 8 melhores
      var best = thirdsRanking(); if (best.length < 8) return null;
      // alocação simplificada: associa os terceiros elegíveis deste slot na ordem do ranking
      // (a FIFA usa o Anexo C; aqui usamos uma heurística estável p/ preview)
      return null; // preenchido pelo assignThirds (abaixo) — slot fica "?" até lá
    }
    var m = slot.match(/^([12])([A-L])$/);
    if (m) {
      if (!groupComplete(m[2])) return null;
      return tableOf(m[2])[+m[1] - 1].code;
    }
    var w = slot.match(/^([WL])(\d+)$/);
    if (w) {
      var r = resultOf(+w[2]);
      if (!r) return null;
      return w[1] === "W" ? r.win : r.lose;
    }
    return null;
  }

  // resultado de um jogo do mata-mata: vencedor/perdedor (precisa de placar; empate=null aqui)
  function resultOf(n) {
    var s = score(n); if (!s || s[0] == null || s[1] == null || s[0] === s[1]) return null;
    var g = J.byN[n];
    var home = koHomeCode(g), away = koAwayCode(g);
    if (!home || !away) return null;
    return s[0] > s[1] ? { win: home, lose: away } : { win: away, lose: home };
  }
  function koHomeCode(g) { return resolveSlot(g.homeSlot, g.thirds); }
  function koAwayCode(g) { return resolveSlot(g.awaySlot, g.thirds); }

  // ---------- RENDER ----------
  function render(el) {
    var h = '<div class="jg-seg">' +
      '<button class="jg-tab' + (view==="grupos"?" on":"") + '" data-jview="grupos">' + t("jg_groups") + '</button>' +
      '<button class="jg-tab' + (view==="chave"?" on":"") + '" data-jview="chave">' + t("jg_bracket") + '</button>' +
    '</div>';
    h += '<div class="jg-body">' + (view === "grupos" ? renderGrupos() : renderChave()) + '</div>';
    el.innerHTML = h;
  }

  function renderGrupos() {
    var chips = '<div class="jg-chips">';
    "ABCDEFGHIJKL".split("").forEach(function (gr) {
      chips += '<button class="jg-chip' + (groupSel===gr?" on":"") + '" data-jgroup="' + gr + '">' + gr + '</button>';
    });
    chips += '<button class="jg-chip date' + (groupSel==="date"?" on":"") + '" data-jgroup="date">📅 ' + t("jg_bydate") + '</button>';
    chips += '</div>';
    if (groupSel === "date") return chips + renderByDate(J.groupGames);
    // tabela + jogos do grupo
    return chips + tableHTML(groupSel) + matchesHTML(
      J.groupGames.filter(function (g){ return g.group===groupSel; }), false);
  }

  function tableHTML(group) {
    var rows = tableOf(group);
    var h = '<div class="jg-card"><table class="jg-table"><tr>' +
      '<th></th><th class="l">' + t("group",{x:group}) + '</th>' +
      '<th>'+t("jg_p")+'</th><th>'+t("jg_w")+'</th><th>'+t("jg_d")+'</th><th>'+t("jg_l")+'</th><th>'+t("jg_gd")+'</th><th>'+t("jg_pts")+'</th></tr>';
    rows.forEach(function (r, i) {
      var col = ctx.teamColor(r.code);
      h += '<tr class="' + (i < 2 ? "q" : "") + '">' +
        '<td>' + (i+1) + '</td>' +
        '<td class="l"><span class="jg-bdg" style="background:'+col[0]+';color:'+col[1]+'">'+r.code+'</span>'+esc(ctx.teamName(r.code))+'</td>' +
        '<td>'+r.J+'</td><td>'+r.V+'</td><td>'+r.E+'</td><td>'+r.D+'</td><td>'+(r.sg>0?"+":"")+r.sg+'</td><td class="pts">'+r.pts+'</td></tr>';
    });
    h += '</table></div><div class="jg-leg">'+t("jg_qual_note")+'</div>';
    return h;
  }

  function matchesHTML(games, withGroup) {
    if (!games.length) return "";
    var h = '<div class="jg-sech">' + t("jg_group_games") + '</div>';
    games.forEach(function (g) { h += matchCard(g, withGroup); });
    return h;
  }

  // jogos em ordem cronológica (visão "por data")
  function renderByDate(games) {
    var sorted = games.slice().sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time) || a.n - b.n;
    });
    var h = "", lastDate = "";
    sorted.forEach(function (g) {
      if (g.date !== lastDate) { lastDate = g.date; h += '<div class="jg-sech">' + fmtDateLong(g.date) + '</div>'; }
      h += matchCard(g, true);
    });
    return h;
  }

  function matchCard(g, withGroup) {
    var s = score(g.n) || [null, null];
    var done = played(g.n);
    var hc = ctx.teamColor(g.home), ac = ctx.teamColor(g.away);
    var meta = fmtTime(g.time) + " · " + esc(g.city) + (withGroup ? " · " + t("group",{x:g.group}) : "");
    var lock = ctx.locked ? " readonly" : "";
    return '<div class="jg-match' + (done?" done":"") + '" data-n="'+g.n+'">' +
      '<div class="jg-when">'+ (withGroup ? "" : "📅 " + fmtDateShort(g.date) + " · ") + meta + '</div>' +
      '<div class="jg-row">' +
        '<div class="jg-t"><span class="jg-bdg" style="background:'+hc[0]+';color:'+hc[1]+'">'+g.home+'</span>'+esc(ctx.teamName(g.home))+'</div>' +
        '<div class="jg-score"><input class="jg-in" inputmode="numeric" maxlength="2" data-side="h" value="'+(s[0]!=null?s[0]:"")+'"'+lock+'><span class="x">×</span><input class="jg-in" inputmode="numeric" maxlength="2" data-side="a" value="'+(s[1]!=null?s[1]:"")+'"'+lock+'></div>' +
        '<div class="jg-t away">'+esc(ctx.teamName(g.away))+'<span class="jg-bdg" style="background:'+ac[0]+';color:'+ac[1]+'">'+g.away+'</span></div>' +
      '</div></div>';
  }

  // ---------- bracket (chave) ----------
  function renderChave() {
    var chips = '<div class="jg-chips">';
    J.koStages.forEach(function (st) {
      chips += '<button class="jg-chip' + (koSel===st.key?" on":"") + '" data-jko="'+st.key+'">'+t(st.i18n)+'</button>';
    });
    chips += '</div>';
    var games = J.ko.filter(function (g){ return g.stage===koSel; });
    var h = chips;
    games.forEach(function (g) { h += tieCard(g); });
    h += '<div class="jg-leg">'+t("jg_bracket_note")+'</div>';
    return h;
  }
  function tieCard(g) {
    var s = score(g.n) || [null, null];
    var home = koHomeCode(g), away = koAwayCode(g);
    var hLabel = home ? ctx.teamName(home) : slotLabel(g.homeSlot, g.thirds);
    var aLabel = away ? ctx.teamName(away) : slotLabel(g.awaySlot, g.thirds);
    var hc = home ? ctx.teamColor(home) : ["#cfd6df","#6b7686"];
    var ac = away ? ctx.teamColor(away) : ["#cfd6df","#6b7686"];
    var res = resultOf(g.n);
    function side(code, label, col, isWin, isLose) {
      return '<div class="jg-s'+(isWin?" win":"")+(isLose?" lose":"")+'">' +
        '<span class="jg-mini" style="background:'+col[0]+';color:'+col[1]+'">'+(code||"?")+'</span>'+esc(label)+'</div>';
    }
    var lock = ctx.locked ? " readonly" : "";
    return '<div class="jg-tie'+(played(g.n)?" done":"")+'" data-n="'+g.n+'">' +
      '<div class="jg-when">📅 '+fmtDateShort(g.date)+' · '+fmtTime(g.time)+' · '+esc(g.city)+'</div>' +
      '<div class="jg-tierow">' +
        side(home, hLabel, hc, res&&res.win===home, res&&res.lose===home) +
        '<input class="jg-in" inputmode="numeric" maxlength="2" data-side="h" value="'+(s[0]!=null?s[0]:"")+'"'+lock+'>' +
      '</div>' +
      '<div class="jg-tierow">' +
        side(away, aLabel, ac, res&&res.win===away, res&&res.lose===away) +
        '<input class="jg-in" inputmode="numeric" maxlength="2" data-side="a" value="'+(s[1]!=null?s[1]:"")+'"'+lock+'>' +
      '</div>' +
    '</div>';
  }
  // rótulo de um slot ainda não resolvido: "1º A", "2º B", "3º (A/B/C…)", "Venc. 73"
  function slotLabel(slot, thirds) {
    if (slot === "3*") return t("jg_third") + (thirds ? " (" + thirds.join("/") + ")" : "");
    var m = slot.match(/^([12])([A-L])$/);
    if (m) return t(m[1]==="1"?"jg_first":"jg_second") + " " + m[2];
    var w = slot.match(/^([WL])(\d+)$/);
    if (w) return t(w[1]==="W"?"jg_winner":"jg_loser") + " " + w[2];
    return slot;
  }

  // ---------- eventos ----------
  function handleClick(e, rerender) {
    var v = e.target.closest("[data-jview]");
    if (v) { view = v.getAttribute("data-jview"); rerender(); return true; }
    var gp = e.target.closest("[data-jgroup]");
    if (gp) { groupSel = gp.getAttribute("data-jgroup"); rerender(); return true; }
    var ko = e.target.closest("[data-jko]");
    if (ko) { koSel = ko.getAttribute("data-jko"); rerender(); return true; }
    return false;
  }
  // input de placar (chamado no 'input'/'change')
  function handleScoreInput(e, rerender) {
    var inp = e.target.closest(".jg-in"); if (!inp) return;
    if (ctx.locked) { inp.blur(); return; }
    var box = inp.closest("[data-n]"); if (!box) return;
    var n = +box.getAttribute("data-n");
    var ins = box.querySelectorAll(".jg-in");
    var hv = ins[0].value.trim(), av = ins[1].value.trim();
    var h = hv === "" ? null : Math.max(0, parseInt(hv, 10) || 0);
    var a = av === "" ? null : Math.max(0, parseInt(av, 10) || 0);
    ctx.setScore(n, h, a);
    // re-render no 'change' (sai do campo) p/ atualizar tabela/bracket sem perder foco ao digitar
    if (e.type === "change") rerender();
  }

  // ---------- utils de data ----------
  var DOW = {pt:["dom","seg","ter","qua","qui","sex","sáb"], en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]};
  var MON = {pt:["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],
             en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};
  function lang(){ return (document.documentElement.getAttribute("lang")||"pt").indexOf("en")===0?"en":"pt"; }
  function parseD(s){ var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
  function fmtDateShort(s){ var d=parseD(s),l=lang(); return d.getDate()+" "+MON[l][d.getMonth()]; }
  function fmtDateLong(s){ var d=parseD(s),l=lang(); return DOW[l][d.getDay()]+" · "+d.getDate()+" "+MON[l][d.getMonth()]; }
  function fmtTime(hhmm){ return hhmm; } // mantém HH:MM (ET)
  function esc(t){ return (t+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  return { init:init, render:render, handleClick:handleClick, handleScoreInput:handleScoreInput,
           tableOf:tableOf, thirdsRanking:thirdsRanking };
})();

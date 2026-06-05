/* ============================================================================
   COPA DO MUNDO FIFA 2026 — CALENDÁRIO DE JOGOS
   ----------------------------------------------------------------------------
   Fonte: sorteio oficial (05/12/2025) + cronograma. Coletado em 01/06/2026
   de Wikipedia (en) + NBC Sports + ESPN. A página da FIFA é JS e não foi
   extraível — horários (HH:MM) são de ALTA confiança mas não-oficiais-FIFA;
   confira antes de cravar. Horários em ET (fuso leste dos EUA).

   COMO EDITAR um jogo: ache pelo "n" (número da partida) e ajuste data/hora/
   sede. Os confrontos da fase de grupos são fixos; o mata-mata se monta
   sozinho a partir dos resultados (ver app: bracket).

   Estrutura de cada jogo de grupo:
     { n, group, date:"YYYY-MM-DD", time:"HH:MM", venue, city, home, away }
   home/away usam o CÓDIGO de 3 letras (mesmo do álbum: BRA, MEX...).
============================================================================ */
window.JOGOS = (function () {

  // sede curta -> nome exibido (cidade · estádio)
  var VENUES = {
    azteca:   ["Estádio Azteca", "Cidade do México"],
    akron:    ["Estádio Akron", "Guadalajara"],
    bbva:     ["Estádio BBVA", "Monterrey"],
    mbatl:    ["Mercedes-Benz Stadium", "Atlanta"],
    bmo:      ["BMO Field", "Toronto"],
    levis:    ["Levi's Stadium", "São Francisco"],
    sofi:     ["SoFi Stadium", "Los Angeles"],
    bcplace:  ["BC Place", "Vancouver"],
    lumen:    ["Lumen Field", "Seattle"],
    metlife:  ["MetLife Stadium", "Nova York / NJ"],
    gillette: ["Gillette Stadium", "Boston"],
    linc:     ["Lincoln Financial Field", "Filadélfia"],
    hardrock: ["Hard Rock Stadium", "Miami"],
    nrg:      ["NRG Stadium", "Houston"],
    att:      ["AT&T Stadium", "Dallas"],
    arrow:    ["Arrowhead Stadium", "Kansas City"]
  };

  // ---- 72 JOGOS DA FASE DE GRUPOS ----
  // [n, grupo, data, hora, sedeKey, mandante, visitante]
  var G = [
    [1,"A","2026-06-11","15:00","azteca","MEX","RSA"],
    [2,"A","2026-06-11","22:00","akron","KOR","CZE"],
    [3,"A","2026-06-18","12:00","mbatl","CZE","RSA"],
    [4,"A","2026-06-18","21:00","akron","MEX","KOR"],
    [5,"A","2026-06-24","21:00","azteca","CZE","MEX"],
    [6,"A","2026-06-24","21:00","bbva","RSA","KOR"],

    [7,"B","2026-06-12","15:00","bmo","CAN","BIH"],
    [8,"B","2026-06-13","15:00","levis","QAT","SUI"],
    [9,"B","2026-06-18","15:00","sofi","SUI","BIH"],
    [10,"B","2026-06-18","18:00","bcplace","CAN","QAT"],
    [11,"B","2026-06-24","15:00","bcplace","SUI","CAN"],
    [12,"B","2026-06-24","15:00","lumen","BIH","QAT"],

    [13,"C","2026-06-13","18:00","metlife","BRA","MAR"],
    [14,"C","2026-06-13","21:00","gillette","HAI","SCO"],
    [15,"C","2026-06-19","18:00","gillette","SCO","MAR"],
    [16,"C","2026-06-19","21:00","linc","BRA","HAI"],
    [17,"C","2026-06-24","18:00","hardrock","SCO","BRA"],
    [18,"C","2026-06-24","18:00","mbatl","MAR","HAI"],

    [19,"D","2026-06-12","21:00","sofi","USA","PAR"],
    [20,"D","2026-06-13","00:00","bcplace","AUS","TUR"],
    [21,"D","2026-06-19","15:00","lumen","USA","AUS"],
    [22,"D","2026-06-19","00:00","levis","TUR","PAR"],
    [23,"D","2026-06-25","22:00","sofi","TUR","USA"],
    [24,"D","2026-06-25","22:00","levis","PAR","AUS"],

    [25,"E","2026-06-14","13:00","nrg","GER","CUW"],
    [26,"E","2026-06-14","19:00","linc","CIV","ECU"],
    [27,"E","2026-06-20","16:00","bmo","GER","CIV"],
    [28,"E","2026-06-20","20:00","arrow","ECU","CUW"],
    [29,"E","2026-06-25","16:00","metlife","ECU","GER"],
    [30,"E","2026-06-25","16:00","linc","CUW","CIV"],

    [31,"F","2026-06-14","16:00","att","NED","JPN"],
    [32,"F","2026-06-14","22:00","bbva","SWE","TUN"],
    [33,"F","2026-06-20","13:00","nrg","NED","SWE"],
    [34,"F","2026-06-20","00:00","bbva","TUN","JPN"],
    [35,"F","2026-06-25","19:00","att","JPN","SWE"],
    [36,"F","2026-06-25","19:00","arrow","TUN","NED"],

    [37,"G","2026-06-15","21:00","sofi","IRN","NZL"],
    [38,"G","2026-06-15","15:00","lumen","BEL","EGY"],
    [39,"G","2026-06-21","15:00","sofi","BEL","IRN"],
    [40,"G","2026-06-21","21:00","bcplace","NZL","EGY"],
    [41,"G","2026-06-26","23:00","lumen","EGY","IRN"],
    [42,"G","2026-06-26","23:00","bcplace","NZL","BEL"],

    [43,"H","2026-06-15","12:00","mbatl","ESP","CPV"],
    [44,"H","2026-06-15","18:00","hardrock","KSA","URU"],
    [45,"H","2026-06-21","12:00","mbatl","ESP","KSA"],
    [46,"H","2026-06-21","18:00","hardrock","URU","CPV"],
    [47,"H","2026-06-26","20:00","nrg","CPV","KSA"],
    [48,"H","2026-06-26","20:00","akron","URU","ESP"],

    [49,"I","2026-06-16","15:00","metlife","FRA","SEN"],
    [50,"I","2026-06-16","18:00","gillette","IRQ","NOR"],
    [51,"I","2026-06-22","17:00","linc","FRA","IRQ"],
    [52,"I","2026-06-22","20:00","metlife","NOR","SEN"],
    [53,"I","2026-06-26","15:00","gillette","NOR","FRA"],
    [54,"I","2026-06-26","15:00","bmo","SEN","IRQ"],

    [55,"J","2026-06-16","21:00","arrow","ARG","ALG"],
    [56,"J","2026-06-16","00:00","levis","AUT","JOR"],
    [57,"J","2026-06-22","13:00","att","ARG","AUT"],
    [58,"J","2026-06-22","23:00","levis","JOR","ALG"],
    [59,"J","2026-06-27","22:00","arrow","ALG","AUT"],
    [60,"J","2026-06-27","22:00","att","JOR","ARG"],

    [61,"K","2026-06-17","13:00","nrg","POR","COD"],
    [62,"K","2026-06-17","22:00","azteca","UZB","COL"],
    [63,"K","2026-06-23","13:00","nrg","POR","UZB"],
    [64,"K","2026-06-23","22:00","akron","COL","COD"],
    [65,"K","2026-06-27","19:30","hardrock","COL","POR"],
    [66,"K","2026-06-27","19:30","mbatl","COD","UZB"],

    [67,"L","2026-06-17","16:00","att","ENG","CRO"],
    [68,"L","2026-06-17","19:00","bmo","GHA","PAN"],
    [69,"L","2026-06-23","16:00","gillette","ENG","GHA"],
    [70,"L","2026-06-23","19:00","bmo","PAN","CRO"],
    [71,"L","2026-06-27","17:00","metlife","PAN","ENG"],
    [72,"L","2026-06-27","17:00","linc","CRO","GHA"]
  ];

  // ---- MATA-MATA ----
  // slot: rótulo de origem. Para grupos: "1A"=1º do A, "2B"=2º do B,
  //   "3*"=um dos 8 melhores terceiros (definido por cenário; mostramos opções).
  // Para fases seguintes: "W73"=vencedor do jogo 73, "L101"=perdedor do 101.
  // thirds: (R32) lista de grupos elegíveis para aquele slot de terceiro.
  var R32 = [
    [73,"2026-06-28","15:00","sofi","2A","2B"],
    [74,"2026-06-29","16:30","gillette","1E","3*",["A","B","C","D","F"]],
    [75,"2026-06-29","20:00","bbva","1F","2C"],
    [76,"2026-06-29","12:00","nrg","1C","2F"],
    [77,"2026-06-30","17:00","metlife","1I","3*",["C","D","F","G","H"]],
    [78,"2026-06-30","12:00","att","2E","2I"],
    [79,"2026-06-30","20:00","azteca","1A","3*",["C","E","F","H","I"]],
    [80,"2026-07-01","12:00","mbatl","1L","3*",["E","H","I","J","K"]],
    [81,"2026-07-01","20:00","levis","1D","3*",["B","E","F","I","J"]],
    [82,"2026-07-01","16:00","lumen","1G","3*",["A","E","H","I","J"]],
    [83,"2026-07-02","19:00","bmo","2K","2L"],
    [84,"2026-07-02","15:00","sofi","1H","2J"],
    [85,"2026-07-02","23:00","bcplace","1B","3*",["E","F","G","I","J"]],
    [86,"2026-07-03","18:00","hardrock","1J","2H"],
    [87,"2026-07-03","20:30","arrow","1K","3*",["D","E","I","J","L"]],
    [88,"2026-07-03","13:00","att","2D","2G"]
  ];
  // Oitavas (89-96): [n, data, hora, sede, feederHome("W74"), feederAway]
  var R16 = [
    [89,"2026-07-04","17:00","linc","W74","W77"],
    [90,"2026-07-04","13:00","nrg","W73","W75"],
    [91,"2026-07-05","16:00","metlife","W76","W78"],
    [92,"2026-07-05","20:00","azteca","W79","W80"],
    [93,"2026-07-06","15:00","att","W83","W84"],
    [94,"2026-07-06","20:00","lumen","W81","W82"],   // horário divergente (NBC 20:00 / ESPN 17:00) — A CONFIRMAR
    [95,"2026-07-07","12:00","mbatl","W86","W88"],
    [96,"2026-07-07","16:00","bcplace","W85","W87"]
  ];
  var QF = [
    [97,"2026-07-09","16:00","gillette","W89","W90"],
    [98,"2026-07-10","15:00","sofi","W93","W94"],
    [99,"2026-07-11","17:00","hardrock","W91","W92"],
    [100,"2026-07-11","21:00","arrow","W95","W96"]
  ];
  var SF = [
    [101,"2026-07-14","15:00","att","W97","W98"],
    [102,"2026-07-15","15:00","mbatl","W99","W100"]
  ];
  var THIRD = [103,"2026-07-18","17:00","hardrock","L101","L102"];  // 3º lugar
  var FINAL = [104,"2026-07-19","15:00","metlife","W101","W102"];

  // ---- normaliza para objetos ----
  function mkGroup(a) {
    return { n:a[0], stage:"group", group:a[1], date:a[2], time:a[3],
             venue:VENUES[a[4]][0], city:VENUES[a[4]][1], home:a[5], away:a[6] };
  }
  function mkKO(a, stage) {
    return { n:a[0], stage:stage, date:a[1], time:a[2],
             venue:VENUES[a[3]][0], city:VENUES[a[3]][1],
             homeSlot:a[4], awaySlot:a[5], thirds:a[6] || null };
  }

  var groupGames = G.map(mkGroup);
  var ko = []
    .concat(R32.map(function(a){ return mkKO(a,"R32"); }))
    .concat(R16.map(function(a){ return mkKO(a,"R16"); }))
    .concat(QF.map(function(a){ return mkKO(a,"QF"); }))
    .concat(SF.map(function(a){ return mkKO(a,"SF"); }))
    .concat([mkKO(THIRD,"3RD"), mkKO(FINAL,"FINAL")]);

  // índice por número de jogo (p/ o bracket resolver vencedores)
  var byN = {};
  groupGames.concat(ko).forEach(function (j) { byN[j.n] = j; });

  // rótulos das fases do mata-mata (PT/EN definidos no app via i18n; aqui chave)
  var KO_STAGES = [
    { key:"R32",   i18n:"ko_r32"   },
    { key:"R16",   i18n:"ko_r16"   },
    { key:"QF",    i18n:"ko_qf"    },
    { key:"SF",    i18n:"ko_sf"    },
    { key:"3RD",   i18n:"ko_third" },
    { key:"FINAL", i18n:"ko_final" }
  ];

  return {
    groupGames: groupGames,   // 72
    ko: ko,                   // 32 (R32→Final)
    byN: byN,
    koStages: KO_STAGES,
    venues: VENUES
  };
})();

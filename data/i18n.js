/* ============================================================================
   BIBLIOTECA DE TRADUÇÕES (i18n) — Álbum Copa 2026
   ----------------------------------------------------------------------------
   PT = português (Brasil) · EN = inglês
   O inglês NÃO é tradução literal: usa a terminologia real da comunidade de
   colecionadores Panini (got it / need it / swaps / foil / crest…).
   Fontes: Panini America, app Panini Direct, laststicker, checklistinsider,
   Destination Calcio, Wikipedia (Sticker album).

   >>> ESTE ARQUIVO É SÓ PARA APROVAÇÃO. Ainda NÃO está ligado ao app. <<<
   Revise os textos EN; quando aprovar, eu conecto cada tela a estas chaves.

   Decisões de tradução (as principais):
   - "repetidas"  -> "Swaps"      (termo dominante entre colecionadores; Panini
                                    oficial usa "Doubles" — alternativa anotada)
   - "faltam"     -> "Needed"     ("need it" é o protocolo clássico do hobby)
   - "tenho"      -> "Got it"     ("got it / need it" é universal)
   - "foil"       -> "Foil"       (rótulo oficial; gíria seria "shiny")
   - "escudo"     -> "Crest"      (futebol UK; Panini lista como "Team Logo")
   - "foto do elenco" -> "Team photo"   (rótulo oficial do checklist)
   - "seleção"    -> "team / national team"
   - "Legends"    -> mantém "Legends" no app, com subtítulo "Extra Stickers"
                     (nome oficial 2026 é "Extra Stickers"; "Legends" é como a
                     imprensa BR chama — mantemos o título que você já usa)
============================================================================ */

window.I18N = {

  /* idioma padrão e rótulos do seletor */
  _meta: {
    languages: { pt: "Português", en: "English" },
    default: "pt"           // se o sistema estiver em inglês, o app sugere "en"
  },

  pt: {
    /* ---- Cabeçalho ---- */
    head_kick:        "Panini · FIFA World Cup 2026",
    head_of:          "de {total} figurinhas",     // "318 de 994 figurinhas"
    chip_missing:     "faltam",                     // "676 faltam"
    chip_swaps:       "repetidas",                  // "41 repetidas"

    /* ---- Busca + filtros ---- */
    search_ph:        "Buscar nº (ex.: BRA7) ou nome do jogador",
    filter_all:       "Tudo",
    filter_missing:   "Faltam",
    filter_have:      "Tenho",
    filter_swaps:     "Repetidas",
    filter_foil:      "Foil",

    /* ---- Modos de marcação ---- */
    mode_label:       "Modo:",
    mode_have:        "Tenho",
    mode_swap:        "Repetida",
    mode_bulk:        "Várias",
    hint_have:        "Toque para marcar que tem · toque no + para repetida · segure para editar nome",
    hint_swap:        "Modo repetida: cada toque soma +1 · toque no ×N para tirar · segure para editar",
    hint_bulk:        "Modo várias: toque em Tudo no cabeçalho da seleção pra marcar todas de uma vez",

    /* ---- Seções do álbum ---- */
    sec_opening:      "Abertura & FIFA Museum",
    sec_opening_sub:  "20 figurinhas · todas foil",
    sec_coke:         "Insert Coca-Cola",
    sec_coke_sub:     "14 figurinhas · CC1–CC14 (nº pode variar)",
    sec_legends:      "Legends",
    sec_legends_sub:  "20 craques · não colam no álbum",
    team_sub:         "20 figurinhas",
    group:            "Grupo {x}",                  // "Grupo A"

    /* ---- Cartão de seleção (botão Tudo / Limpar) ---- */
    mark_all:         "Tudo",
    mark_clear:       "Limpar",
    section_this:     "esta seção",
    share_title:      "Álbum Copa 2026",
    confirm_clear:    'Limpar TODAS as marcações de "{nome}"?\n\nIsso remove o que você tem e também as repetidas dessa seleção.',

    /* ---- Tipos de figurinha (na tela de detalhe) ---- */
    type_crest:       "Escudo",
    type_photo:       "Foto do elenco",
    type_player:      "Jogador",
    tag_crest:        "escudo",
    tag_photo:        "elenco",
    player_ph:        "Jogador {n}",                // placeholder de nome
    sheet_name_label: "Nome / descrição",
    sheet_name_player:"Nome do jogador",
    sheet_name_desc:  "Descrição",
    sheet_foil:       "✨ Figurinha foil (brilhante) — mais rara",
    sheet_have_on:    "✅ Tenho esta",
    sheet_have_off:   "Marcar que tenho",
    sheet_swaps:      "Repetidas",
    sheet_close:      "Fechar",

    /* ---- Legends (níveis) ---- */
    tier_base:        "Roxo (base)",
    tier_bronze:      "Bronze",
    tier_silver:      "Prata",
    tier_gold:        "Ouro",

    /* ---- Abas inferiores ---- */
    tab_album:        "Álbum",
    tab_missing:      "Faltam",
    tab_swaps:        "Repetidas",
    tab_trade:        "Trocar",

    /* ---- Tela Faltam / Repetidas ---- */
    missing_head:     "Faltam {n} de {total} figurinhas.",
    missing_foil:     " (✨ foil: {n} faltando)",
    missing_done:     "Você completou o álbum! Parabéns!",
    missing_group:    "faltam {n}",
    swaps_head:       "Você tem {n} figurinha(s) repetida(s) para trocar.",
    swaps_empty:      "Nenhuma repetida ainda.\nToque no + de uma figurinha que você tem em dobro.",
    swaps_group:      "{n} p/ trocar",
    btn_clear_swaps:  "🗑️ Zerar todas as repetidas",
    confirm_clear_swaps: "Tem certeza que deseja zerar TODAS as repetidas?\n\nAs figurinhas que você tem continuam marcadas — só as cópias extras serão removidas. Não dá para desfazer.",
    t_swaps_cleared:  "Repetidas zeradas.",

    /* ---- Tela Trocar ---- */
    stat_have:        "Tenho",
    stat_swaps:       "Repetidas",
    stat_missing:     "Faltam",
    card_list_title:  "🔄 Lista para troca",
    card_list_desc:   "Gera um texto pronto para colar no grupo do WhatsApp com suas repetidas e o que falta.",
    btn_whats:        "📲 Copiar p/ WhatsApp",
    btn_share_api:    "📤 Compartilhar…",
    btn_copy_swaps:   "Copiar só repetidas",
    btn_copy_missing: "Copiar só faltantes",
    card_link_title:  "🔗 Link da minha coleção",
    card_link_desc:   "Manda pro amigo. Ao abrir, ele vê suas repetidas e faltantes — e o app dele já mostra o que combina pra trocar.",
    share_name_ph:    "Seu nome (opcional)",
    btn_gen_link:     "🔗 Gerar link de troca",
    btn_copy_link:    "📋 Copiar link",
    btn_whats_link:   "📲 Mandar no WhatsApp",
    btn_qr:           "🔳 Mostrar / ocultar QR",

    /* ---- Texto gerado (WhatsApp) ---- */
    txt_title:        "⚽ Álbum Copa 2026 — minha lista",
    txt_have:         "📊 Tenho {n}/{total} ({pct}%)",
    txt_swaps:        "🔄 REPETIDAS p/ trocar ({n}):",
    txt_missing:      "❌ FALTAM ({n}):",
    txt_done:         "— completei! 🏆",
    txt_foil_note:    "(✨ = foil/brilhante)",
    whats_link_msg:   "Minha lista de troca do álbum da Copa 2026 👉 {url}",

    /* ---- Tela do amigo ---- */
    friend_title:     "📋 Lista de troca — {nome}",
    friend_someone:   "um amigo",
    friend_sub:       "Tem {n}/{total} ({pct}%) · você está só visualizando",
    friend_get:       "🎯 {nome} tem repetida e VOCÊ precisa ({n})",
    friend_give:      "🎁 VOCÊ tem repetida e {nome} precisa ({n})",
    friend_tip_t:     "💡 Dica",
    friend_tip:       "Marque a sua coleção (aba Álbum) que o app passa a mostrar aqui, automaticamente, o que combina pra trocar com {nome}.",
    friend_their_sw:  "🔄 Repetidas de {nome} ({n})",
    friend_their_ms:  "❌ Falta para {nome} ({n})",
    friend_none:      "— nenhuma",
    friend_exit:      "📖 Ver / usar o meu álbum",
    friend_foot:      "Você está vendo a lista de outra pessoa — sua coleção não foi alterada.",

    /* ---- Ajustes ---- */
    cfg_backup_t:     "💾 Backup (salvar / restaurar)",
    cfg_backup_d:     "Tudo fica salvo neste aparelho. Exporte um arquivo para guardar ou levar para outro celular/PC.",
    btn_export:       "⬇️ Exportar meu progresso",
    btn_import:       "⬆️ Importar de um arquivo",
    note_iphone:      "📱 No iPhone: abra o app pelo atalho na Tela de Início (no Safari: Compartilhar → Adicionar à Tela de Início). Sem isso, o Safari pode apagar seu progresso após ~7 dias sem uso. Vale também exportar um backup de vez em quando.",
    cfg_appearance:   "🎨 Aparência",
    cfg_layout_label: "Layout do app (muda na hora):",
    cfg_layout_note:  "Atalho: o botão 🎨 no topo troca o layout rapidinho.",
    cfg_lang_label:   "Idioma / Language:",
    cfg_update_t:     "🔄 Atualização",
    cfg_update_d:     "Pega a versão mais nova publicada. Seu progresso (figurinhas marcadas) é mantido.",
    btn_force_update: "⤓ Buscar atualização agora",
    cfg_update_note:  "Use se publicou uma versão nova e não viu mudança (ou se o aviso não apareceu). O app recarrega só uma vez.",
    cfg_reset_t:      "♻️ Recomeçar",
    cfg_reset_d:      "Apaga TODAS as marcações deste álbum (não dá para desfazer).",
    btn_reset:        "Zerar tudo",
    cfg_about_t:      "ℹ️ Sobre",
    cfg_about_d:      "Álbum FIFA World Cup 2026 (Panini): 980 figurinhas + 14 do insert Coca-Cola (CC1–CC14, edição Brasil) = 994. Checklist coletada em 31/05/2026 — os nomes dos jogadores podem mudar nas convocações finais; segure uma figurinha para corrigir.",
    foot_note:        "Feito para uso pessoal · imagens/nomes pertencem aos seus detentores.",

    /* ---- Menu de layout ---- */
    lay_choose:       "Escolha o layout",
    lay_figurinha:    "Figurinha", lay_figurinha_d: "Estilo álbum (principal)",
    lay_noturno:      "Noturno",   lay_noturno_d:   "Escuro premium",
    lay_vibrante:     "Vibrante",  lay_vibrante_d:  "Material, colorido",
    lay_editorial:    "Editorial", lay_editorial_d: "Revista premium",

    /* ---- Aviso de atualização ---- */
    update_avail:     "✨ Nova versão disponível",
    btn_update:       "Atualizar",

    /* ---- Cadeado (lock) ---- */
    lock_off:         "Travar edição",
    lock_on:          "Destravar edição",
    t_locked:         "🔒 Edição travada — toque pra navegar sem alterar",
    t_unlocked:       "🔓 Edição liberada",

    /* ---- Aba Jogos ---- */
    tab_jogos:        "Jogos",
    jg_title:         "Jogos",
    jg_groups:        "Grupos",
    jg_bracket:       "Chave",
    jg_bydate:        "Por data",
    jg_group_games:   "Jogos do grupo",
    jg_p:"J", jg_w:"V", jg_d:"E", jg_l:"D", jg_gf:"GP", jg_ga:"GC", jg_gd:"SG", jg_pts:"Pts",
    jg_qual_note:     "🟢 1º e 2º avançam · os 8 melhores 3ºs também se classificam. Linha verde ✓ = vaga confirmada (grupo completo) · linha amarela ✓ = 3º entre os 8 melhores (definido quando os 12 grupos terminam). GP = gols pró · GC = gols contra.",
    jg_bracket_note:  "A chave se preenche conforme você digita os placares. Empate exige um vencedor (pênaltis) para avançar.",
    jg_first:"1º", jg_second:"2º", jg_third:"3º", jg_winner:"Venc.", jg_loser:"Perd.",
    ko_r32:"32-avos", ko_r16:"Oitavas", ko_qf:"Quartas", ko_sf:"Semis", ko_third:"3º lugar", ko_final:"Final",

    /* ---- Toasts / confirmações ---- */
    t_saved_err:      "Erro ao salvar 😕",
    t_list_copied:    "Lista copiada! Cole no WhatsApp 📲",
    t_swaps_copied:   "Repetidas copiadas!",
    t_swaps_head:     "🔄 Repetidas p/ troca:",
    t_no_swaps:       "Sem repetidas ainda.",
    t_missing_copied: "Faltantes copiadas!",
    t_missing_head:   "❌ Faltam:",
    t_done_album:     "Você completou o álbum! 🏆",
    t_link_gen:       "Link gerado 🔗",
    t_link_copied:    "Link copiado! 🔗",
    t_qr_off:         "QR indisponível",
    t_qr_big:         "Link grande demais p/ QR — use copiar",
    t_layout:         "Layout: {x}",
    t_lang:           "Idioma alterado",
    t_exported:       "Arquivo exportado ⬇️",
    confirm_import:   "Substituir seu progresso atual pelos dados do arquivo?",
    t_imported:       "Progresso importado ✅",
    t_file_invalid:   "Arquivo inválido 😕",
    confirm_reset:    "Apagar TODAS as marcações? Não dá para desfazer.",
    t_reset:          "Tudo zerado.",
    t_offline:        "Precisa de internet para atualizar 📶",
    confirm_update:   "Buscar a versão mais nova agora?\n\nO app vai recarregar uma vez. Suas figurinhas marcadas são mantidas.",
    t_updating:       "Atualizando…",
    t_copy_fail:      "Não consegui copiar 😕",
    empty_search:     "Nada encontrado com esse filtro/busca."
  },

  en: {
    /* ---- Header ---- */
    head_kick:        "Panini · FIFA World Cup 2026",
    head_of:          "of {total} stickers",
    chip_missing:     "needed",                     // "676 needed"
    chip_swaps:       "swaps",                       // "41 swaps"

    /* ---- Search + filters ---- */
    search_ph:        "Search by number (e.g. BRA7) or player name",
    filter_all:       "All",
    filter_missing:   "Needed",
    filter_have:      "Got",
    filter_swaps:     "Swaps",
    filter_foil:      "Foil",

    /* ---- Marking modes ---- */
    mode_label:       "Mode:",
    mode_have:        "Got it",
    mode_swap:        "Swap",
    mode_bulk:        "Multi",
    hint_have:        "Tap to mark as got · tap + for a swap · press and hold to edit the name",
    hint_swap:        "Swap mode: each tap adds +1 · tap the ×N to remove · hold to edit",
    hint_bulk:        "Multi mode: tap All on a team's header to mark the whole team at once",

    /* ---- Album sections ---- */
    sec_opening:      "Opening & FIFA Museum",
    sec_opening_sub:  "20 stickers · all foil",
    sec_coke:         "Coca-Cola inserts",
    sec_coke_sub:     "14 stickers · CC1–CC14 (numbers may vary)",
    sec_legends:      "Legends",
    sec_legends_sub:  "20 stars · Extra Stickers (don't go in the album)",
    team_sub:         "20 stickers",
    group:            "Group {x}",

    /* ---- Team card (All / Clear button) ---- */
    mark_all:         "All",
    mark_clear:       "Clear",
    section_this:     "this section",
    share_title:      "World Cup 2026 Album",
    confirm_clear:    'Clear ALL marks for "{nome}"?\n\nThis removes what you have and its swaps for this team.',

    /* ---- Sticker types (detail sheet) ---- */
    type_crest:       "Crest",
    type_photo:       "Team photo",
    type_player:      "Player",
    tag_crest:        "crest",
    tag_photo:        "team",
    player_ph:        "Player {n}",
    sheet_name_label: "Name / description",
    sheet_name_player:"Player name",
    sheet_name_desc:  "Description",
    sheet_foil:       "✨ Foil (shiny) sticker — rarer",
    sheet_have_on:    "✅ Got this one",
    sheet_have_off:   "Mark as got",
    sheet_swaps:      "Swaps",
    sheet_close:      "Close",

    /* ---- Legends (tiers) ---- */
    tier_base:        "Purple (base)",
    tier_bronze:      "Bronze",
    tier_silver:      "Silver",
    tier_gold:        "Gold",

    /* ---- Bottom tabs ---- */
    tab_album:        "Album",
    tab_missing:      "Needed",
    tab_swaps:        "Swaps",
    tab_trade:        "Trade",

    /* ---- Needed / Swaps screens ---- */
    missing_head:     "{n} of {total} stickers still needed.",
    missing_foil:     " (✨ foil: {n} still needed)",
    missing_done:     "You've completed the album. Congrats!",
    missing_group:    "{n} needed",
    swaps_head:       "You have {n} swap(s) ready to trade.",
    swaps_empty:      "No swaps yet.\nTap the + on a sticker you have more than one of.",
    swaps_group:      "{n} to swap",
    btn_clear_swaps:  "🗑️ Clear all swaps",
    confirm_clear_swaps: "Are you sure you want to clear ALL swaps?\n\nThe stickers you own stay marked — only the extra copies are removed. This can't be undone.",
    t_swaps_cleared:  "Swaps cleared.",

    /* ---- Swap screen ---- */
    stat_have:        "Got",
    stat_swaps:       "Swaps",
    stat_missing:     "Needed",
    card_list_title:  "🔄 Trade list",
    card_list_desc:   "Builds a ready-to-paste text for your WhatsApp group with your swaps and what you still need.",
    btn_whats:        "📲 Copy for WhatsApp",
    btn_share_api:    "📤 Share…",
    btn_copy_swaps:   "Copy swaps only",
    btn_copy_missing: "Copy needed only",
    card_link_title:  "🔗 Link to my collection",
    card_link_desc:   "Send it to a friend. When they open it, they see your swaps and needs — and their app shows what matches for a trade.",
    share_name_ph:    "Your name (optional)",
    btn_gen_link:     "🔗 Create trade link",
    btn_copy_link:    "📋 Copy link",
    btn_whats_link:   "📲 Send on WhatsApp",
    btn_qr:           "🔳 Show / hide QR",

    /* ---- Generated text (WhatsApp) ---- */
    txt_title:        "⚽ World Cup 2026 Album — my list",
    txt_have:         "📊 Got {n}/{total} ({pct}%)",
    txt_swaps:        "🔄 SWAPS to trade ({n}):",
    txt_missing:      "❌ NEEDED ({n}):",
    txt_done:         "— complete! 🏆",
    txt_foil_note:    "(✨ = foil/shiny)",
    whats_link_msg:   "My World Cup 2026 sticker trade list 👉 {url}",

    /* ---- Friend screen ---- */
    friend_title:     "📋 Trade list — {nome}",
    friend_someone:   "a friend",
    friend_sub:       "Has {n}/{total} ({pct}%) · you're just viewing",
    friend_get:       "🎯 {nome} has swaps YOU need ({n})",
    friend_give:      "🎁 YOU have swaps {nome} needs ({n})",
    friend_tip_t:     "💡 Tip",
    friend_tip:       "Mark your own collection (Album tab) and the app will show here, automatically, what matches for a trade with {nome}.",
    friend_their_sw:  "🔄 {nome}'s swaps ({n})",
    friend_their_ms:  "❌ {nome} still needs ({n})",
    friend_none:      "— none",
    friend_exit:      "📖 View / use my own album",
    friend_foot:      "You're viewing someone else's list — your collection wasn't changed.",

    /* ---- Settings ---- */
    cfg_backup_t:     "💾 Backup (save / restore)",
    cfg_backup_d:     "Everything is saved on this device. Export a file to keep it safe or move it to another phone/PC.",
    btn_export:       "⬇️ Export my progress",
    btn_import:       "⬆️ Import from a file",
    note_iphone:      "📱 On iPhone: open the app from the Home Screen shortcut (in Safari: Share → Add to Home Screen). Otherwise Safari may erase your progress after ~7 days unused. It's also worth exporting a backup now and then.",
    cfg_appearance:   "🎨 Appearance",
    cfg_layout_label: "App layout (changes instantly):",
    cfg_layout_note:  "Shortcut: the 🎨 button up top switches layout quickly.",
    cfg_lang_label:   "Idioma / Language:",
    cfg_update_t:     "🔄 Update",
    cfg_update_d:     "Gets the latest published version. Your progress (marked stickers) is kept.",
    btn_force_update: "⤓ Check for updates now",
    cfg_update_note:  "Use this if you published a new version and don't see changes (or the prompt didn't show). The app reloads once.",
    cfg_reset_t:      "♻️ Start over",
    cfg_reset_d:      "Erases ALL marks in this album (can't be undone).",
    btn_reset:        "Reset everything",
    cfg_about_t:      "ℹ️ About",
    cfg_about_d:      "FIFA World Cup 2026 Album (Panini): 980 stickers + 14 Coca-Cola inserts (CC1–CC14, Brazil edition) = 994. Checklist gathered on 2026-05-31 — player names may change with final squads; press and hold a sticker to fix one.",
    foot_note:        "Made for personal use · images/names belong to their owners.",

    /* ---- Layout menu ---- */
    lay_choose:       "Choose a layout",
    lay_figurinha:    "Sticker",   lay_figurinha_d: "Album style (default)",
    lay_noturno:      "Night",     lay_noturno_d:   "Premium dark",
    lay_vibrante:     "Vibrant",   lay_vibrante_d:  "Material, colorful",
    lay_editorial:    "Editorial", lay_editorial_d: "Magazine premium",

    /* ---- Update banner ---- */
    update_avail:     "✨ New version available",
    btn_update:       "Update",

    /* ---- Lock ---- */
    lock_off:         "Lock editing",
    lock_on:          "Unlock editing",
    t_locked:         "🔒 Editing locked — tap to browse without changing",
    t_unlocked:       "🔓 Editing unlocked",

    /* ---- Matches tab ---- */
    tab_jogos:        "Matches",
    jg_title:         "Matches",
    jg_groups:        "Groups",
    jg_bracket:       "Bracket",
    jg_bydate:        "By date",
    jg_group_games:   "Group matches",
    jg_p:"P", jg_w:"W", jg_d:"D", jg_l:"L", jg_gf:"GF", jg_ga:"GA", jg_gd:"GD", jg_pts:"Pts",
    jg_qual_note:     "🟢 Top 2 advance · the 8 best 3rd-place teams also qualify. Green row ✓ = spot confirmed (group complete) · amber row ✓ = 3rd among the 8 best (decided once all 12 groups finish). GF = goals for · GA = goals against.",
    jg_bracket_note:  "The bracket fills in as you enter scores. A draw needs a winner (penalties) to advance.",
    jg_first:"1st", jg_second:"2nd", jg_third:"3rd", jg_winner:"Winner", jg_loser:"Loser",
    ko_r32:"Round of 32", ko_r16:"Round of 16", ko_qf:"Quarters", ko_sf:"Semis", ko_third:"3rd place", ko_final:"Final",

    /* ---- Toasts / confirms ---- */
    t_saved_err:      "Couldn't save 😕",
    t_list_copied:    "List copied! Paste it on WhatsApp 📲",
    t_swaps_copied:   "Swaps copied!",
    t_swaps_head:     "🔄 Swaps to trade:",
    t_no_swaps:       "No swaps yet.",
    t_missing_copied: "Needed list copied!",
    t_missing_head:   "❌ Needed:",
    t_done_album:     "You've completed the album! 🏆",
    t_link_gen:       "Link created 🔗",
    t_link_copied:    "Link copied! 🔗",
    t_qr_off:         "QR unavailable",
    t_qr_big:         "Link too big for a QR — use copy instead",
    t_layout:         "Layout: {x}",
    t_lang:           "Language changed",
    t_exported:       "File exported ⬇️",
    confirm_import:   "Replace your current progress with the data from this file?",
    t_imported:       "Progress imported ✅",
    t_file_invalid:   "Invalid file 😕",
    confirm_reset:    "Erase ALL marks? This can't be undone.",
    t_reset:          "Everything reset.",
    t_offline:        "You need internet to update 📶",
    confirm_update:   "Check for the latest version now?\n\nThe app will reload once. Your marked stickers are kept.",
    t_updating:       "Updating…",
    t_copy_fail:      "Couldn't copy 😕",
    empty_search:     "Nothing found with that filter/search."
  }
};

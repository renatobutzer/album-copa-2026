# ⚽ Álbum Copa 2026 — meu controle de figurinhas

App pessoal (PWA) para controlar o álbum **Panini FIFA World Cup 2026**:
marcar o que já tenho, contar as **repetidas** e ver o que **falta** — com lista
pronta para colar no WhatsApp e trocar com os amigos.

- **994 figurinhas**: 980 do álbum base + 14 do insert Coca-Cola (CC1–CC14, edição Brasil)
- Cada seleção com **suas cores** (a arte oficial da Panini não é usada — fica só no app oficial)
- Funciona **offline** e instala como ícone no celular (Android e iPhone)
- Tudo salvo **no próprio aparelho** (nada vai para a internet)

---

## 📲 Como usar

| Ação | O que fazer |
|------|-------------|
| **Tenho esta** | Toque na figurinha (fica verde) |
| **Tenho repetida** | Toque no **+** da figurinha (fica amarela, com ×2, ×3…) |
| **Marcar repetidas em massa** | Alternador no topo → **🔄 Repetida**: cada toque soma +1 |
| **Tirar uma repetida** | Toque no número ×N no canto da figurinha |
| **Editar nome / ajuste fino** | **Segure** a figurinha (abre a tela de detalhe) |
| **Ver o que falta** | Aba **Faltam** |
| **Ver minhas repetidas** | Aba **Repetidas** |
| **Mandar lista pro grupo** | Aba **Trocar** → "Copiar p/ WhatsApp" |
| **Compartilhar coleção (link/QR)** | Aba **Trocar** → "Gerar link de troca" |
| **Backup / trocar de celular** | Engrenagem ⚙️ → Exportar / Importar |

> Os nomes dos jogadores das **48 seleções** já vêm preenchidos (checklist coletada
> em 31/05/2026, fontes checklistinsider + diamondcardsonline). Se um nome mudar nas
> convocações finais ou tiver acento/grafia a ajustar, é só **segurar** a figurinha
> e corrigir — sua edição fica salva por cima da padrão.

---

## 🤝 Trocar com amigos (sem servidor)

Na aba **Trocar** → **"Gerar link de troca"**, o app cria um link (ou QR) com a sua
coleção codificada. Você manda pro amigo; quando ele abre:

- vê suas **repetidas** e **faltantes**;
- se ele também usa o app, aparece o **match automático**: "ele tem repetida que
  **você** precisa" e "**você** tem repetida que ele precisa".

Tudo isso roda no navegador — **nada é enviado a nenhum servidor**, a coleção viaja
dentro do próprio link. Cada um continua com os dados no seu aparelho.

---

## 🚀 Como publicar (GitHub Pages — grátis)

**Jeito mais fácil, sem instalar nada (pelo navegador):**

1. Crie uma conta em <https://github.com> (se ainda não tiver).
2. Clique em **New repository** → nome `figurinhas-2026` → deixe **Public** → **Create**.
3. Na página do repositório, clique em **"uploading an existing file"**.
4. **Arraste todos os arquivos desta pasta** para a área de upload — inclusive as
   subpastas `data/`, `icons/` e `vendor/` — e clique em **Commit changes**.
5. Vá em **Settings → Pages** → em *Branch* escolha **main** / **/ (root)** → **Save**.
6. Aguarde ~1 minuto. O endereço do app aparece ali, algo como:
   `https://SEU-USUARIO.github.io/figurinhas-2026/`
7. Abra esse endereço **no celular** → menu do navegador → **"Adicionar à tela inicial"**.
   Pronto: vira um ícone igual a um app. ✅

> 🔄 **Para publicar uma atualização depois:** suba os arquivos alterados (no mesmo
> repositório) e **aumente o número em `service-worker.js`** (linha `CACHE_VERSION`,
> ex.: `copa2026-v3` → `copa2026-v4`). Quem usa verá o aviso **"Nova versão disponível
> → Atualizar"** e ninguém perde o progresso.

---

## 🗂️ Arquivos

| Arquivo | Para quê |
|---------|----------|
| `index.html` | Estrutura da página |
| `style.css` | Visual (cores, layout, tema claro/escuro) |
| `app.js` | Toda a lógica (marcar, filtrar, compartilhar, backup) |
| `data/album.js` | A **checklist** das 992 figurinhas (edite aqui p/ acrescentar nomes) |
| `manifest.json` + `service-worker.js` | Fazem funcionar offline, instalar como app e avisar de nova versão |
| `icons/` | Ícones do app |
| `vendor/` | Bibliotecas (compressão do link de troca + gerador de QR) |

---

*Uso pessoal. Nomes e marcas pertencem aos seus detentores (FIFA, Panini, federações).*

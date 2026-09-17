# House (The Art of Art) — Design System

**House** is the product name in the app shell; **The Art of Art (AOA)** is the company/repo name. It is a map-centric mobile PWA (390×844, Chicago launch city) that guides newcomers into the Chicago theater scene: a **Tonight** feed of what's up and affordable, a **Map** of venues, **Discover** search ("A play, a theater, a feeling…"), a Goodreads-style record of shows (**My Shows**: Want to See · Booked · Seen), a **twelve-feeling emotion system** that replaces star ratings, and **The House** — a seven-rank progression from Standing Room to Company that replaces belts. There is also an admin curation surface (venue/school coverage, scraper pipeline) not covered in this kit.

Thesis (from the handoff): theater feels inaccessible because there is no curation layer, no social layer, and no visible progression for audience members. Every screen should make theater look **alive and enterable**, never exclusive. **Access is the product promise** — price on every card, free/pay-what-you-can/usher info always in green, never below the fold.

## Sources

- GitHub: https://github.com/OMGLASERSPEWPEWPEW/aoa (`main`). Key reads: `src/styles/tokens.css`, `src/components/**`, `src/pages/**`, `src/lib/emotions.ts`, `src/lib/house.ts`, `docs/design/handoff/README.md` (41KB screen spec), `EMOTIONS.md`, `THE-HOUSE.md`, `docs/design/v4/design_handoff_house_record/THEMING.md`, `CLAUDE.md`.
- Explore the repo for more — the `docs/design/handoff/*.md` files are exhaustive, pixel-level specs and are the ground truth for anything not covered here. `docs/design/prototypes/*.html` hold the original dark-only prototypes.

No Figma. No logo file exists in the repo (the PWA icon in `assets/` is a placeholder-grade "A" from the pre-redesign palette).

---

## CONTENT FUNDAMENTALS

**Voice:** warm, specific, observational, a little dry. Talks like a friend who knows the scene, never like a platform. Second person ("you", "your people", "your record"); the product refers to the community as "the house" and to friends as "your people". Never "users".

**Never a verdict, never a number restated.** Ratings don't exist. A spectrum bar gets one plain-English sentence: *"The room agreed."* · *"A divisive one — people either fell all the way in or spent the drive home arguing."* · *"Some people checked out. Ask a friend who liked it first."* Bad: *"Rated 3.8/5 by 198 users."*

**Invitations, not requirements.** Next-rank copy pattern: *"{what's left} and you're in the {next rank} — which unlocks {the genuinely good part}."* No progress percentages, no streaks, no leaderboards, no "you should diversify".

**Casing has two registers:**
- Serif prose (Newsreader) in sentence case with real punctuation and curly apostrophes: *"Your record starts whenever you say it does."*, *"Log something you saw in 2019 — it counts."*, *"So. What did it do to you?"*, *"Goes on your record and to your people. Steppenwolf sees the count, never your name."*
- Mono metadata (Courier Prime) in UPPERCASE with `·` separators: `GOODMAN THEATRE · ALBERT · THE LOOP`, `47 CURTAINS UP TONIGHT`, `FREE TONIGHT — NO CATCH, NO TICKET`, `YOU'VE BEEN 9 TIMES · LAST: JUL 3`, `PICK UP TO THREE`.

**Primary buttons are sentences** in italic serif: *Want to see* · *I'm going* · *Post to the house* · *Next — say a little more →*. Secondary buttons are mono uppercase: `WANT TO SEE`, `$25 HOTTIX`, `JUST LOG IT`, `SIGN OUT`.

**Vocabulary:** shelves are *Want to See / Tickets Booked / Seen*. Reviews are *reflections*; the community aggregate is *the house felt*; a person's aggregate is *your palette*; a logged show is a *card*. Kinds of room: *house* (institutional) · *storefront* · *devised*. Ranks: Standing Room, Balcony, Mezzanine, Orchestra, Front Row, Green Room, Company. Themes are *Paper* and *Night* ("the house lights").

**Emoji: never.** Unicode glyphs are the icon set (see Iconography). `Bored` is a first-class feeling, never styled as failure.

**Empty states (verbatim):** Want to See — *Nothing on the list yet. / The map knows what's up tonight. Start there.* · Seen — *Your record starts whenever you say it does. / Log something you saw in 2019 — it counts.* · Friends — *Nobody here yet. / Theater is better with one other person. Bring one.* · Search — *Nothing under that name. / Try a feeling instead — "gutted", "delighted".*

---

## VISUAL FOUNDATIONS

**Vibe:** editorial theater program meets ledger. Paper-toned page, hairline rules, italic serif titles, typewriter metadata, one gold accent. Feels like a printed playbill, not a SaaS dashboard.

**Two themes, light is default.** `:root` = Paper (`--bg #f6f1e3`, ink `#1c1814`); `.dark` on an ancestor = Night (`--bg #0c0a05`, ink `#ebe5d6`). Auto mode follows sunset. Components read tokens only; the ink ladder *inverts direction* between themes so always use the token, never assume lighter/darker. The only theme-branching in JS is emotion colour (dark helpers `fill/edge/bright`, paper helpers `fillLight/edgeLight/ink`).

**Colour.** Surfaces: bg, bg-card (inset panels, input wells), bg-chrome (device chrome only), rule (all 1px borders), rule-soft (list-row dividers). Ink: five steps, ink → ink-whisper. Accent: gold `oklch(0.52 0.14 55)` paper / `oklch(0.80 0.14 55)` night — primary CTA fill, active tab/underline, live values; `--accent-on` is always the text on a gold fill. Semantic: `--live` green dot for "curtain up tonight", `--access` green for free/PWYC/usher (the most product-critical colour), `--danger` for errors and spoiler warnings, `--member` blue for BY A MEMBER. The **twelve feelings** have theme-invariant oklch bases (see `tokens/emotions.css`). Genre chips tint by hue (musical 90 · drama 250 · experimental 300 · classic 55 · new work 150 · thriller 25).

**Type.** Three faces from Google Fonts. **Newsreader italic 400** for every production, play, venue, artist and screen title (the single strongest signature) and for primary button labels; Newsreader roman 14–16px / 1.45 for body. **Courier Prime** uppercase, 9–12px, tracked 0.06–0.18em for every label, chip, nav item, metadata line; the masthead "The Art of Art" is Courier Prime 700 19px. **JetBrains Mono** for counts, ledger day numbers, status bar, version. Fixed scale (px): 8.5 9 9.5 10 10.5 11 12 12.5 13.5 14 14.5 15 16 17.5 18 19 20 22 23 24 26 27 29 31 34 38 — never invent between. Section label convention: Courier Prime 9.5px, 0.18em, `--ink-faint`. Minimums: no text below 9px (8.5 only for USHERED/rank badges), no body below 13.5px.

**Spacing & layout.** Mobile only, 390 wide. Horizontal page padding **20px everywhere**; section padding 14–18px; gaps from 5 6 7 8 9 10 12 14 16 18 24. Sections are separated by full-width 1px rules, not by cards. Fixed elements: Header (top), 79px TabBar (bottom, `padding 8px 6px 22px`), map sheet anchored at `bottom:79px`. Touch targets ≥44px; buttons 46, footer CTAs 50, tab items 48, wheel nodes 66.

**Backgrounds.** Flat page colour. Imagery = production stills / headshots from venue press kits in a 196px hero band with a scrim gradient to `--bg`; photo credit Courier Prime 8px `--ink-whisper` bottom-left. Placeholders are hatched `--bg-card`/`--rule-soft` fills. No illustrations, no textures, no patterns. Exactly two gradients exist: `--gold-gradient` (marquee, profile header, Booked card, rank-up moment) and image scrims. No other gradients, ever.

**Corners.** 2px tags/tiles/bars/seats · 3px buttons/cards/panels/inputs · 14px filter chips · 9999 pills/avatars/wheel nodes · `16px 16px 0 0` map sheet. Never larger.

**Elevation: rules, not shadows.** Cards are `1px solid --rule` on `--bg-card`, radius 3, no shadow. Legal shadows: map sheet `0 -14px 44px rgba(0,0,0,.75)`, map marker `0 3px 8px rgba(0,0,0,.7)`, the lit seat glow `0 0 10px --accent`, and the Toast. Never a card shadow. No inner shadows. No left-border accent cards.

**Transparency & blur.** Only over the map: filter chips, the key and the sheet use `color-mix(var(--bg) 92%, transparent)` + `backdrop-filter: blur(6px)`. Nowhere else.

**States.** Active/selected = gold text on `--accent-bg` with `--accent-border` (chips, toggles), or solid gold with `--accent-on` (nav, horizon segments, kind chips). Hover: none designed (touch product); `transition-colors` 120ms. Press: no shrink; colour change only. Disabled: opacity .5. Achieved rank chips get `line-through`; future ones a dashed border. Filtered-out map markers dim to `opacity .22` (never removed). Selected marker `scale(1.18)`.

**Motion.** 120ms colour/fill transitions on taps; 160ms toggles; sheet slides 300ms `cubic-bezier(.2,.8,.2,1)`; rank-up seat moves 400ms same curve; marquee 26s linear infinite; live dot 1.8s opacity pulse; skeleton shimmer 1.5s. `prefers-reduced-motion` kills marquee, pulse and slide but never state changes. No bounces, no confetti, no sound.

**Imagery colour.** Photos sit under the paper/night palette with a scrim; no filters applied to stills. The map basemap is tinted to the theme (grayscale + sepia toward `#0c0a05` land / `#2b2720` roads on Night).

---

## ICONOGRAPHY

**Typographic glyphs, not an icon library.** Nav: `◉ TONIGHT` `⌖ MAP` `✦` (gold FAB) `◎ DISCOVER` `▤ MY SHOWS` `◇ YOU`. Others: `◔` notifications, `⌕` search, `↗` directions, `←` back, `⋯` more, `›` chevron, `⚙` settings, `✎` edit avatar. Room kinds on map markers: `▣` house · `◧` storefront · `◬` devised · `◈` school (`◍` improv / `▭` acting in class mode). Theme: `◐ PAPER` `● NIGHT` `◑ AUTO`. Glyphs render at 14–18px in the current text colour; the handoff says if any glyph renders inconsistently on Android, replace **all** with one stroke set rather than mixing.

**Exception:** a handful of legacy components import **Lucide** stroke icons (LogOut in Header, Send in ChatInput, Bookmark/Eye in WatchlistButton, ThumbsUp/Trash in the old ReviewCard). `Header.jsx` inlines the Lucide log-out path so the bundle has no dependency. For anything new, prefer glyphs; if a stroke icon is unavoidable use Lucide at 16–18px, 2px stroke.

**No SVG icon system, no icon font, no PNG icons, no emoji.** `public/icons.svg` and `public/favicon.svg` in the repo are Vite-template leftovers (Bluesky/Discord symbols, purple favicon) and were not imported. `assets/pwa-icon-*.png` is the app's PWA icon — an "A" in a pre-redesign amber circle — kept for reference, not a brand mark. Wherever a logo would go, set **House** in Newsreader italic.

Emotion "icons" are colour: 8–10px dots and pills in the feeling's oklch base.

---

## Index

```
readme.md · SKILL.md · github.md · styles.css · thumbnail.html
tokens/        fonts.css (Google Fonts import) · colors.css (:root Paper + .dark Night, semantic aliases)
               emotions.css (12 feelings + genre hues) · typography.css · shape.css (radius, spacing, motion) · base.css (body reset, keyframes)
assets/        pwa-icon-192.png · pwa-icon-512.png  (placeholder PWA icon; no real logo exists)
guidelines/    20 specimen cards — Colors (surfaces ×2, ink, accent, semantic, emotions, genre) · Type (display, body, label, mono, scale)
               Spacing (tokens, in use, radius, motion) · Brand (wordmark, glyphs, house ladder, voice)
components/    lib/emotions.js (shared constants + colour helpers; not a component)
ui_kits/       house-app/ — the mobile PWA, 9 screens, click-through (index.html + *.jsx + README.md)
```

### Components (namespace `HouseArtOfArtDesignSystem_d930c9`)

- **emotions/** — `EmotionPill` · `EmotionDots` · `SpectrumBar` · `InterpretationSentence` · `EmotionWheel` · `RoomVolumeSelector`
- **house/** — `SeatingChart` · `HouseChips` · `ReviewBadge` · `StatStrip` · `NextStepSentence`
- **chips/** — `GenreChip` · `AccessChip` · `FilterChip` · `KindChips` · `HorizonControl`
- **controls/** — `Button` · `TextInput` · `SearchBar` · `ToggleRow` · `HouseLights` · `SectionLabel`
- **navigation/** — `TabBar` · `Header` · `HubRow` · `MarqueeTicker` · `SettingsSection`
- **lists/** — `EventCard` · `ShowRow` · `MonthDivider` · `BookingRow` · `EmptyState` · `HappeningRow` · `EditorialItem`
- **feedback/** — `LoadingSkeleton` · `StatusBanner` · `Toast` · `SpoilerReveal`
- **map/** — `MapMarker` · `MapKey`

Each has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`; each folder has a `*.card.html` specimen.

**Source mapping.** Most components are 1:1 recreations of `src/components/*.tsx`: TabBar ← Navigation, StatusBanner ← OfflineIndicator, Toast ← UpdateBanner, SpoilerReveal ← ReviewsSection's SpoilerReview, FilterChip ← discover/FilterChips + map chips, EditorialItem ← horizons/EditorialTail + SceneNews, EmotionDots ← the dot rows in ShowRow/ReviewsSection/EmotionWheel.

**Intentional additions** (patterns pervasive in the source but not factored into a component there): `Button` (the gold-italic / mono-outline pair used on every screen), `TextInput` (Login/Signup `inputStyle`), `SectionLabel` (the 9.5px/0.18em section header convention), `EmotionDots`.

**Not built** (admin-only or data-bound): `admin/*` (CoverageBar, ClassRow, HappeningReviewSheet…), MapView/VenueSheet/ClassSheet (Mapbox-bound), ChatInput/MessageBubble/MentorAvatar (legacy Tailwind-slate mentor chat, superseded), LevelPips, PosterThumb/MarqueeView (My Shows take A), happenings authoring (VenuePicker, TierWells, PhotoStrip), AddFriend/FriendsList.

### UI kits
- `ui_kits/house-app/` — House mobile PWA: Landing, Login, Tonight (+Events), Discover, Show detail, Log a show (wheel → review), My Shows ledger, You, Settings (Paper/Night switch), Map stub.

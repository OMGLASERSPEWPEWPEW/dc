# dc — Data Center Community Impact Visualizer

**Product Requirements Document**
2026-09-16

---

## Vision & Problem Statement

Over 7,000 data centers are now operating, under construction, or proposed across the United States — a 203% increase in planned projects since March 2026 alone. These facilities consume millions of gallons of water daily for cooling and generate industrial-grade noise from HVAC chillers and backup generators. Communities near these sites often have no accessible way to understand the environmental footprint landing in their neighborhood.

Existing data lives in fragmented public sources: county zoning board minutes, state environmental permits, utility filings, and federal NPDES discharge records. Over 300 bills targeting data center regulation have been filed across 30+ states in 2026, signaling urgent public demand for transparency.

**dc** makes this invisible infrastructure visible. It pulls structured data from public trackers (FracTracker, permit databases), calculates water draw and noise dispersion based on facility capacity, and renders the impact as intuitive map overlays — so anyone can see what a proposed 100MW data center means for their water table and their backyard.

---

## Target Users & Personas

| Persona | Role | Primary need | Key action in dc |
| --- | --- | --- | --- |
| Community advocate | Resident near a proposed data center | Understand water and noise impact on their neighborhood | View noise contours overlaid on their street, see daily water draw in "equivalent homes" |
| Local government staff | Planning/zoning commissioner | Evaluate permit applications with environmental context | Compare proposed facility impact against existing facilities in the region |
| Investigative journalist | Reporter covering infrastructure/climate | Access and cross-reference public data center filings | Filter by state, operator, and MW capacity; export data |
| Environmental researcher | Academic or NGO analyst | Study aggregate patterns in data center water/energy use | Dashboard view of total draw by state, trends over time |
| Concerned taxpayer | Voter in an affected district | Quick gut-check on a facility they heard about | Search by city/address, read the detail panel |

---

## Core Features

### F1: Interactive Data Center Map

Full-screen Mapbox GL JS map centered on the continental US. Each data center is a marker colored by status (operating = green, under construction = yellow, proposed = blue) and sized by MW capacity (small < 50MW, medium 50–200MW, large 200MW+). Clustering at low zoom levels. Click a marker to fly in and open the detail panel.

### F2: Water Draw Visualization

Detail panel shows daily water consumption calculated from MW capacity and WUE. Displayed as:
- Raw numbers: gallons/day, liters/day
- Contextual equivalence: "equivalent to the daily water use of X,XXX homes" with a repeating house icon row
- Interactive WUE slider (range 0.5–3.0 L/kWh) so users can model best-case vs worst-case cooling scenarios

### F3: Noise Contour Overlays

Color-coded concentric rings radiating from the facility footprint, showing sound pressure level at distance:
- 75+ dBA (red) — hearing damage zone, at fence line
- 65–75 dBA (orange) — loud conversation difficult
- 55–65 dBA (yellow) — exceeds typical residential zoning limit
- 45–55 dBA (green) — sleep disruption possible
- 35–45 dBA (blue) — faint, ambient threshold

Rendered as Mapbox fill layers using turf.js-generated GeoJSON polygons. Toggle on/off per facility.

### F4: Detail Panel (Bottom Sheet)

Slide-up panel on marker click showing: name, operator, status badge, location, MW capacity, cooling method, water draw card (F2), noise contour toggle (F3), and source link.

### F5: Filtering & Search

Top bar with filter chips: status (operating / under construction / proposed), state dropdown, MW range slider. Text search by facility name, operator, or city.

### F6: Data Pipeline

Automated ingestion from FracTracker ArcGIS REST API (structured JSON, no scraping). Manual seed file for initial launch. Future: additional scrapers for ElectricChoice, county permit portals.

---

## Data Model

The primary entity is a **DataCenter** record. All impact calculations derive from its `mw_capacity` and `cooling_method`.

| Field | Type | Description |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Facility name (e.g. "Loudoun Station Campus") |
| operator | text | Company operating the facility (e.g. "AWS", "Microsoft", "Equinix") |
| latitude | numeric(10,7) | GPS latitude |
| longitude | numeric(10,7) | GPS longitude |
| address | text | Street address if available |
| city | text | City |
| state | text | Two-letter state code |
| county | text | County name |
| mw_capacity | numeric(8,2) | IT power capacity in megawatts — the anchor for all impact calculations |
| sqft | integer | Facility square footage (secondary metric) |
| cooling_method | text | air, evaporative, hybrid, or liquid |
| status | text | operating, under_construction, proposed, approved, suspended |
| wue | numeric(4,2) | Water Usage Effectiveness (L/kWh). Default 1.8 for evaporative, 0.1 for air-cooled |
| source_url | text | Link to the public filing or data source |
| source_name | text | Origin dataset (FracTracker, ElectricChoice, permit filing) |
| external_id | text | ID from the source system for deduplication |

**Derived records** (computed on ingest, not stored raw):

- **WaterImpact**: daily_liters, daily_gallons, equivalent_homes — pure function of mw_capacity + wue
- **NoiseContour**: GeoJSON FeatureCollection of concentric isopleth rings — function of coordinates + source_dba (default 85) + barrier attenuation

---

## Key Calculations

### Water Consumption

The industry-standard metric is **Water Usage Effectiveness (WUE)** = liters of water consumed / kWh of IT energy.

```
Input:  mw_capacity (MW), wue (L/kWh, default 1.8)

Step 1: kw = mw_capacity × 1,000
Step 2: kwh_per_day = kw × 24
Step 3: daily_liters = wue × kwh_per_day
Step 4: daily_gallons = daily_liters × 0.264172
Step 5: equivalent_homes = daily_gallons / 300  (EPA avg US household)
```

**Example — 100MW evaporative-cooled facility (WUE 1.8):**
- 100,000 kW × 24h = 2,400,000 kWh/day
- 1.8 × 2,400,000 = 4,320,000 liters/day
- 4,320,000 × 0.264172 = 1,141,223 gallons/day
- 1,141,223 / 300 = **3,804 homes equivalent**

The WUE slider in the UI ranges from 0.1 (air-cooled, minimal water) to 3.0 (older evaporative systems). This lets users model the cooling tradeoff: air-cooled uses less water but more electricity and produces more noise.

### Noise Dispersion

Data center noise comes from rooftop HVAC chillers (constant, 85+ dBA at source) and diesel backup generators (periodic testing, 95+ dBA). Sound pressure drops following the inverse square law.

```
Input:  source_dba (default 85), lat, lng, barrier_db (default 0)

For each threshold [75, 65, 55, 45, 35] dBA:
  required_drop = source_dba - barrier_db - threshold
  radius_meters = 10^(required_drop / 20)   (ref distance 1m)
  Generate circle polygon via turf.circle()
```

**Example — 85 dBA source, no barriers:**

| Threshold | Drop needed | Radius | Roughly |
| --- | --- | --- | --- |
| 75 dBA | 10 dB | 3.2 m | At the fence |
| 65 dBA | 20 dB | 10 m | Property line |
| 55 dBA | 30 dB | 31.6 m | Adjacent lot |
| 45 dBA | 40 dB | 100 m | ~1 block |
| 35 dBA | 50 dB | 316 m | ~3 blocks |

For campuses with N chiller units, effective source = source_dba + 10 × log10(N). A campus with 10 chiller clusters has an effective 95 dBA source, pushing the 45 dBA threshold out to ~316m.

### Cooling Tradeoff (Design Note)

Design should visually connect water and noise as an inverse relationship. Facilities that use less water (air-cooled) run massive fans, producing more noise and consuming more electricity (higher PUE). Evaporative cooling is quieter but drinks water. This tradeoff is the central tension the app reveals.

---

## UX & Interaction Design

### Map Interactions

- **Default view**: Continental US, zoom level 4, dark basemap. All data centers visible as clustered markers.
- **Zoom in**: Clusters break apart into individual markers. At zoom 8+, markers show MW capacity label.
- **Click marker**: Map flies to zoom 12, centers on the facility, opens the detail sheet from the bottom.
- **Click map background**: Closes any open detail sheet.
- **Hover marker**: Tooltip with name, operator, and MW capacity.

### Detail Sheet Behavior

The detail sheet is a bottom-anchored panel (not a sidebar) that slides up on marker click. It occupies the lower 40% of the viewport on mobile, or a fixed 400px-tall strip on desktop. The map remains visible and interactive above it.

**Sheet sections (top to bottom):**
1. **Header**: Facility name, operator, status badge (colored pill), city/state
2. **Capacity bar**: Horizontal bar showing MW capacity relative to the largest facility in the dataset
3. **Water draw card**: Daily gallons with home-equivalence icon row + WUE slider
4. **Noise toggle**: "Show noise contours" switch — when on, renders isopleth rings on the map behind the sheet
5. **Source link**: External link to the public filing or data source

The sheet is dismissible by swiping down or clicking the X. Only one sheet open at a time.

### Filter Controls

Fixed top bar (overlaying the map, semi-transparent dark background):
- **Status chips**: Three toggle chips — Operating (green), Under Construction (yellow), Proposed (blue). All active by default. Tap to toggle.
- **State dropdown**: Alphabetical list of states with data centers. Selecting a state flies the map to that state's bounding box.
- **MW range**: Two-thumb slider, 0–500+ MW.
- **Search**: Magnifying glass icon expands to a text input. Searches name, operator, city. Results appear as a dropdown list; selecting one flies to that marker.

### Responsive Layout

- **Mobile (< 768px)**: Full-screen map. Filter bar collapses to a single filter icon that opens a bottom sheet with all filter controls. Detail sheet is full-width, swipe-up to expand.
- **Desktop (≥ 768px)**: Full-screen map. Filter bar is always visible. Detail sheet is full-width at bottom, 400px tall.
- No sidebar navigation — the map IS the app. The about page is accessed via a small info icon in the top-right corner.

---

## Visual Design Direction

### Aesthetic: Dark Industrial

The app presents infrastructure data — the visual language should feel like a control room, not a consumer product. Dark backgrounds, muted chrome, high-contrast data. The map is the hero; UI chrome recedes.

### Color System

**Basemap**: Mapbox Dark v11 (`mapbox://styles/mapbox/dark-v11`). Muted terrain, bright roads, high contrast for overlaid data.

**Status palette (markers and badges):**
- Operating: `#22c55e` (green-500)
- Under Construction: `#eab308` (yellow-500)
- Proposed: `#3b82f6` (blue-500)
- Approved/Permitted: `#8b5cf6` (violet-500)
- Suspended: `#6b7280` (gray-500)

**Noise isopleth ramp:**
- 75+ dBA: `#dc2626` (red-600) at 40% opacity
- 65–75 dBA: `#f97316` (orange-500) at 30% opacity
- 55–65 dBA: `#eab308` (yellow-500) at 25% opacity
- 45–55 dBA: `#22c55e` (green-500) at 20% opacity
- 35–45 dBA: `#3b82f6` (blue-500) at 15% opacity

Rings use decreasing opacity so the map remains legible underneath. No hard borders — soft feathered edges between rings.

**Water draw visualization**: Blue gradient from `#60a5fa` (light) to `#1e3a5f` (deep). House icons in `#94a3b8` (slate-400).

**UI surfaces**: Panels and sheets use `#0f172a` (slate-900) with `#1e293b` (slate-800) borders. Text in `#f1f5f9` (slate-100). Secondary text in `#94a3b8` (slate-400).

### Typography

System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`). Monospace for numbers and capacity values (`'JetBrains Mono', 'Fira Code', monospace`). Numbers are the primary content — they should feel precise and technical.

### Data Visualization Patterns

- **Capacity bar**: Horizontal bar chart, single bar per facility. Fill color matches status. Background track in slate-800.
- **Home equivalence**: Row of house icons (lucide `Home`). Filled icons represent the count. Cap at 20 visible icons with a "× 190" multiplier label for large counts.
- **WUE slider**: Custom range input. Track shows a gradient from blue (air-cooled, low WUE) to red (high water use). Thumb shows current WUE value.
- **Marker sizing**: Three discrete sizes (12px, 18px, 28px diameter) based on MW breakpoints, not continuous scaling. Keeps the map clean at low zoom.

### Micro-interactions

- Marker hover: subtle scale-up (1.15×) + drop shadow
- Sheet open: 300ms ease-out slide from bottom
- Noise contour toggle: 500ms fade-in for each ring, staggered inside-out
- Filter chip toggle: instant color change, 150ms background transition
- Map fly-to: Mapbox default easing (~1.5s)

---

## Information Architecture

The app has two routes. The map is the entire experience.

```
/ — Map Home
  ├── Filter bar (overlay)
  ├── Data center markers
  ├── Detail sheet (overlay, on marker click)
  │   ├── Water draw card
  │   └── Noise contour toggle → map overlay
  └── Info icon → /about

/about — Methodology & Sources
  └── Back → /
```

**`/` — Map Home**: Full-screen map with filter bar overlay and detail sheet. No chrome, no navigation bar, no sidebar. The filter bar floats at the top. The detail sheet slides up from the bottom on marker click.

**`/about` — Methodology & Sources**: Single scrollable page explaining: how water draw is calculated (WUE formula), how noise contours are modeled (inverse square law), data sources and their update frequency, limitations and assumptions. Accessible via an info icon (lucide `Info`) in the top-right corner of the map view. Back button returns to the map.

No other pages in Phase 1. No settings, no user profile, no dashboard. Those arrive in Phase 2+.

---

## Data Sources

| Source | Type | Data available | Access method | Update frequency |
| --- | --- | --- | --- | --- |
| [FracTracker US Data Centers](https://fractracker.org/2026/04/open-u-s-data-centers-tracker/) | ArcGIS Feature Service | Coordinates, MW, sqft, cooling method, status, operator | REST API (structured JSON, no scraping) | Updated by FracTracker team; check monthly |
| [ElectricChoice US Tracker](https://www.electricchoice.com/datacenters/) | HTML page | 2,100+ facilities, power consumption by state | HTML parse or Firecrawl | Updated periodically |
| [US Data Center Project Tracker](https://usdatacenterprojects.com/us-data-center-project-tracker) | Web app | 1,300+ upcoming projects, MW, market | Scraper (requires JS rendering) | Weekly updates |
| [Aterio Database](https://www.aterio.io/insights/us-data-centers) | Web app | 7,057 facilities, pipeline status | Scraper | Continuously updated |
| County permit portals | Government websites | Zoning approvals, environmental assessments, water authority agreements | Per-county scrapers + LLM extraction | As filed |
| Manual seed file | JSON fixture | ~50 curated major facilities | Local file, loaded on init | One-time, then supplemented by automated sources |

**Phase 1 uses FracTracker API + seed file only.** FracTracker is the ideal starting source: it's a free ArcGIS REST endpoint returning structured GeoJSON with coordinates, MW capacity, cooling method, and status. No authentication, no scraping, no rate limiting. Paginate with `resultOffset` in batches of 1,000 records.

---

## Architecture Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Framework | React 19 + Vite 8 + TypeScript + Tailwind 4 | Matches all existing projects (aoa, nib, guidegenius). Proven stack. |
| Map library | Mapbox GL JS 3.27.0 | Production-tested in aoa. Supports custom layers, GeoJSON fill, fly-to, clustering. |
| State management | React useState (Phase 1) | Filter state is simple. Zustand added in Phase 2 if needed. |
| Server state | TanStack React Query | Proven in aoa and guidegenius for Supabase queries with stale-while-revalidate. |
| Data storage (Phase 1) | Local JSON file loaded at build time | No backend needed for MVP. Seed file + FracTracker fetch at build or on client init. |
| Data storage (Phase 2+) | Supabase Postgres | Auth, RLS, Edge Functions for scrapers. Proven in all projects. |
| Auth | None (Phase 1) | Public information tool. Auth only needed for bookmarks (Phase 2). |
| Noise contour geometry | @turf/circle → GeoJSON → Mapbox fill layer | Precise dBA-labeled rings. Mapbox heatmap layer is for point density, not radial dispersion. |
| Hosting (Phase 1) | Local dev server | User preference. Vercel deployment added later. |
| Noise computation | Main thread (single), Web Worker (batch) | Single-facility contours are fast. Batch rendering for all-visible offloaded to worker. |
| Port | 5209 | Next available in the project port registry. |

---

## Phased Roadmap

### Phase 1: MVP — Map + Markers + Water Draw

Ship a working map with data center locations and basic impact data.

- [ ] Scaffold from template-app pattern (React 19 + Vite + Tailwind)
- [ ] Seed data: curated JSON of ~50 major US data centers with coordinates, MW, status
- [ ] FracTracker ArcGIS API integration (client-side fetch, structured JSON)
- [ ] Mapbox GL JS map: dark basemap, status-colored markers, MW-scaled sizing, clustering
- [ ] Detail sheet: bottom panel with facility info + water draw calculation
- [ ] Water draw card: daily gallons, daily liters, home-equivalence icon row, WUE slider
- [ ] Filter bar: status chips, state dropdown, MW range slider, text search
- [ ] About page: methodology, formulas, data sources, limitations
- [ ] Core libraries: water.ts, noise.ts, types.ts with Vitest unit tests

### Phase 2: Noise Contours + Scraper Pipeline

Add the noise visualization layer and automated data ingestion.

- [ ] Noise contour overlays: turf.js circle polygons as Mapbox fill layers
- [ ] Contour toggle in detail sheet with staggered fade-in animation
- [ ] Web Worker for batch contour generation (visible facilities)
- [ ] FracTracker scraper Edge Function (Supabase, upsert with deduplication)
- [ ] Supabase database migration (data_centers, scrape_runs, impact_snapshots)
- [ ] Auth (optional): Supabase auth for bookmarks and saved views
- [ ] ElectricChoice scraper: HTML parse via deno-dom in Edge Function

### Phase 3: Community Context + Polish

Overlay population data and add comparison tools.

- [ ] Census Bureau API overlay: population density near facilities
- [ ] "X residents within the 55 dBA contour" calculation
- [ ] Comparison mode: select multiple facilities for side-by-side impact cards
- [ ] Dashboard page: aggregate stats, top consumers, state-level choropleth
- [ ] PWA: offline map tile caching, installable
- [ ] Additional scraper sources: permit portals, county zoning boards

---

## Sources

- [FracTracker US Data Centers Tracker](https://fractracker.org/2026/04/open-u-s-data-centers-tracker/) — open ArcGIS dataset with coordinates, MW, cooling, status
- [ElectricChoice US Data Center Power Consumption](https://www.electricchoice.com/datacenters/) — 2,100+ facilities, 176 TWh annually
- [US Data Center Project Tracker](https://usdatacenterprojects.com/us-data-center-project-tracker) — 1,300+ upcoming projects
- [Aterio US Data Center Database](https://www.aterio.io/insights/us-data-centers) — 7,057 facilities in pipeline
- [Shovels.ai Data Center Permits](https://www.shovels.ai/blog/data-center-permits-decisions/) — permit-level filing data
- [Climate XChange Water Impact Toolkit](https://climate-xchange.org/resources-for-regulating-data-centers/water-impacts/) — state policy toolkits
- [MultiState: Data Center Water Legislation 2026](https://www.multistate.us/insider/2026/3/3/state-data-center-water-usage-legislation-gains-momentum) — 300+ bills across 30+ states
- [Congress.gov: Data Centers and Water FAQ](https://www.congress.gov/crs-product/R49057) — CRS report on water usage
- [Buildermuse: Every Data Center Permit Filed in 2026](https://buildermuse.com/commercial/tracking-every-data-center-permit-filed-in/) — running permit list

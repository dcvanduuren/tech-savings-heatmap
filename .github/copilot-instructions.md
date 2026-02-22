# Copilot Instructions for Tech Savings Heatmap

## Project Overview
- This is a Next.js app (app directory structure) visualizing tech salary, rent, and savings data across European cities.
- The main UI is a map-based heatmap, with city data and color-coded savings.
- Map rendering uses `@vis.gl/react-mapbox` (MapView.tsx), with dynamic color scaling for savings.

## Key Files & Structure
- `app/page.tsx`: Main entry, handles search, city selection, and dynamic map loading.
- `app/MapView.tsx`: Map rendering, city markers, color logic, and mock data.
- `app/layout.tsx`: Global font setup, layout, and metadata.
- `globals.css`: Global styles.

## Data & Patterns
- City data is mocked in `MapView.tsx` (array of objects with name, lat/lng, savings, salary, rent, living).
- Color scaling for savings uses HSL interpolation (see `getDynamicColors`).
- Mapbox API is used for geocoding (search in `page.tsx`), with access token from `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- Dynamic import disables SSR for map component (`dynamic(() => import('./MapView'), { ssr: false })`).

## Developer Workflows
- Start dev server: `npm run dev` (see README.md).
- Edit main UI in `app/page.tsx` and map logic in `app/MapView.tsx`.
- No custom build/test scripts beyond Next.js defaults.

## Conventions & Integration
- Uses Next.js app directory, not pages directory.
- Font setup via `next/font/google` in layout.
- Mapbox integration: API token required in `.env` as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- All map logic and city data are client-side ("use client" directive).

## Examples
- To add a new city: update `MOCK_CITIES` in `MapView.tsx`.
- To change color logic: edit `getDynamicColors` in `MapView.tsx`.
- To modify search: update geocoding logic in `page.tsx`.

## External Dependencies
- `@vis.gl/react-mapbox` for map rendering.
- `mapbox-gl` for map styles.
- `next/font` for font optimization.

## Useful References
- [app/page.tsx](app/page.tsx): Search, city selection, map loading.
- [app/MapView.tsx](app/MapView.tsx): Map logic, city data, color scaling.
- [README.md](README.md): Dev server instructions.

---

**If unclear or incomplete, ask for feedback on specific workflows, conventions, or integration points.**

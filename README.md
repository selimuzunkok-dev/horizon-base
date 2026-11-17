# Horizon Base (Ufuk Üssü)

A 3D Moon and Mars base-building game for young learners, made for the NASA Space Apps 2026 challenge "Build a Junior Astronaut Mission Trainer". Playable in English and Turkish.

**Play in the browser:** https://selimuzunkok-dev.github.io/horizon-base/

## How to play

- Open `index.html` in a browser. It is a single self-contained file: Three.js (r128, `vendor/three.min.js`) is embedded, so the game also runs offline. Only the web fonts come from a CDN; without them the game falls back to system fonts.
- The game opens in English. Use the language button on the title screen to switch to Turkish (or add `#tr` / `#en` to the address).
- The title screen is split in two: **Moon** (easy, for first-time players) and **Mars** (hard, for experienced players). Pick a world, watch the landing, and follow the single goal line at the top of the screen.

## What the player learns

- **Life support:** air, water and food are produced and consumed every day; each building shows what it makes and what it needs.
- **Power:** solar panels stop at night, batteries store daytime surplus, and the long lunar night has to be planned for. The game warns early and proposes a concrete plan.
- **In-situ resources:** ice becomes water, oxygen and fuel; lunar soil becomes building material and radiation shielding.
- **Learning while playing:** the first time a building is placed or an event happens, a one-sentence fact card appears and is saved in the notebook. Repairs and construction trigger quick questions about facts the game has already taught; a wrong answer still completes the job but costs extra resources.
- **Real data:** decisions and fact cards show their source (for example "Source: NASA · Curiosity RAD"). The "About the project" window lists the NASA figures used in the game next to what happens in the game.

## Project layout

- `src/` game source (content, simulation, 3D scene, interface). All game text is bilingual.
- `build.mjs` concatenates the sources into `index.html` (standalone page) and `artifact.html`.
- `test/` simulation tests (`node test/sim.mjs`) and browser tests (headless Edge with playwright-core).
- `vendor/` Three.js r128 (MIT licence).

Build with `node build.mjs`.

## Use of AI

This game's code, texts and procedural 3D models were generated with Claude Code (Anthropic's AI coding agent) under the team's direction. The same statement is shown inside the game in the "Data sources" window. No NASA logos or insignia are used; NASA sources are credited in text.

## License

MIT, see `LICENSE`. Three.js (`vendor/three.min.js`) is included under its own MIT licence.

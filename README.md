# Chandresh N — 3D Developer Portfolio

A light-theme, animated, responsive portfolio in plain HTML, CSS and JavaScript.
No frameworks, no build step, no downloads, 100% free to host.

## What's inside

```
portfolio/
├── index.html      ← the page
├── style.css       ← design, 3D depth effects, animations
├── script.js       ← builds the page from data.js + runs every animation from ONE smooth loop
├── scene3d.js      ← custom WebGL engine: floating 3D shapes, wireframes, particles
├── data.js         ← ✏️ YOUR DETAILS (the only file you need to edit)
├── editor.html     ← optional form to edit your details without touching code
└── assets/
    ├── photo-toon.jpg       ← illustrated version of your photo
    ├── photo-original.jpg   ← your real photo
    └── resume.pdf           ← your resume (Download button uses this)
```

## The 3D & animation features

- **Live WebGL 3D background**: glossy crystals, torus knots, wireframe shapes and depth-lit particles that float, spin faster when you scroll quickly, and shift with your mouse.
- **3D photo stage**: your photo sits in layered glass plates with floating tech badges at different depths, orbiting spheres, and mouse-controlled tilt. Hover (or tap on phones) to flip it to the real photo.
- **Draggable 3D skill sphere**: all your skills on a rotating sphere. Drag to spin it.
- **Tilting project, skill & certificate cards** with a moving light glare and layered depth.
- **Scroll effects**: 3D cards tip up into place, the hero drifts back as you scroll, and the marquee skews with scroll speed.
- **3D cube loader** and 3D letter entrance for your name.

**Performance:** all animation runs from a single `requestAnimationFrame` loop using time-based motion, so it stays smooth on 60/90/120/144 Hz screens. Only GPU-friendly properties (transform/opacity) are animated. The page pauses when the tab is hidden, caps pixel density on phones, and **automatically switches to a lighter 3D scene (or turns the 3D background off)** if a device can't keep up. It also respects the "reduce motion" system setting.

## Preview on your computer

Double-click `index.html`.

## Editing your details

**Option A: the form (easiest).** Open `editor.html`, change anything, click **Preview**, then **Download data.js** and replace the old `data.js` with it.

**Option B: edit `data.js` directly** in VS Code (or on GitHub with the pencil icon), save, refresh.

| I want to…                         | Change this                                           |
| ---------------------------------- | ----------------------------------------------------- |
| Turn the 3D background off         | `enable3D: false` in `data.js`                        |
| Add a project link                 | `github:` / `demo:` inside that project               |
| Show my phone number               | `showPhone: true`                                     |
| Add a new project                  | Copy one `{ ... },` project block and edit it         |
| Update my resume                   | Replace `assets/resume.pdf`                           |
| Change my photo                    | Replace the two images in `assets/`                   |
| Receive form messages by email     | Free Formspree form → paste URL in `formEndpoint`     |
| Change colours                     | `--accent`, `--accent-2`, `--bg` at the top of `style.css` |
| Change the 3D shapes               | The `OBJECTS` list at the top of `scene3d.js`         |

## Publish free (pick ONE)

### Vercel (recommended)
1. Upload everything in this folder to a new public GitHub repository.
2. Go to vercel.com → **Continue with GitHub** → **Add New → Project** → **Import** your repo.
3. Set **Framework Preset** to *Other*. Leave build command and output directory empty.
4. Click **Deploy**. You get a `*.vercel.app` link in about 30 seconds, and every GitHub commit redeploys automatically.

### GitHub Pages
1. Upload the files to a public repo (name it `Chandrudesi2604.github.io` for a clean address).
2. **Settings → Pages** → Source: *Deploy from a branch* → branch `main`, folder `/ (root)` → Save.
3. Live in 1–2 minutes.

## Notes

- `editor.html` is a convenience tool. It can't change your live site by itself; you always upload the downloaded `data.js`. Delete it before publishing if you prefer.
- Your phone number is hidden by default so spam bots can't scrape it.
- Fonts load from Google Fonts. Everything else, including the 3D engine, works offline.

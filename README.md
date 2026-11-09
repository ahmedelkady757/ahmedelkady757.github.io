# Ahmed Elkady portfolio

A static site with no build step. Upload this folder to any static host and it works.

## Run it locally

From inside this folder:

```bash
python -m http.server 5199
```

Then open http://localhost:5199. It has to go through a local server, because the 3D code will not load from a double-clicked `index.html`.

## Change the content

Almost everything lives in `js/data.js`: text, links, tech stacks, panel colors, milestones and which video or screens each project uses.

| To change | Edit |
| --- | --- |
| A project's text or stack | `PROJECTS` in `js/data.js` |
| Panel and phone colors | `bg`, `fg`, `accent`, `phone` on that project |
| Smaller projects list | `ARCHIVE` |
| Timeline | `JOURNEY` |
| Numbers in About | `STATS` |
| About paragraph | `journeyHTML()` in `js/main.js` |
| What the phone draws (lock screen, code, tests, call) | `js/screens.js` |
| How the phone moves | `poseFor()` in `js/stage.js` |

## Add a project video

Export an MP4 (H.264, about 600px wide, no audio), put it in `assets/video/`, then set on the project:

```js
media: { type: 'video', src: 'assets/video/myapp.mp4', poster: 'assets/posters/myapp.webp' }
```

## Publish on GitHub Pages

This site is served from the `main` branch of `ahmedelkady757.github.io`. Put the contents of this folder at the root of that repository and push. The live address is https://ahmedelkady757.github.io/.

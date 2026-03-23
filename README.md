# Geriau Pakartot

Naršyklės įskiepis padedantis automatiškai groti albumus vieną po kito pakartot.lt portale
Taipogi leidžia valdyti pakartot.lt grotuvą iš bet kurio kito skirtuko ar lango.
---

## Usage

* Install as [Chrome Extension]

### Keyboard shortcuts

While pakartot.lt is playing, media keys on your keyboard control it from any tab — and won't bleed through to other media players (Foobar2000, etc.):

| Key | Action |
| --- | --- |
| Media Play/Pause | Play / Pause |
| Media Next Track | Next track (advances to next album at end) |
| Media Previous Track | Previous track (goes to previous album at start) |
| Alt+Shift+→ | Next album |
| Alt+Shift+← | Previous album |

Shortcuts can be remapped at `chrome://extensions/shortcuts`.

## Development

Dependencies only needed for building and publishing scripts.

```sh
npm install
```

### Available Scripts

* `npm run lint` - Run ESLint to check code quality
* `npm test` - Run Jest tests
* `npm run build` - Build extension with version bump
* `npm run publish` - Publish to Chrome Web Store

### CI/CD

This project uses GitHub Actions for automated:
* **Pull Request checks**: Linting and testing
* **Automatic publishing**: On merge to main branch

See [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) for setup instructions.

## todo:

* ✅ auto deploy using github actions
* ✅ when pakartot.lt is playing, capture keyboard shortcuts to control it from any tab or window (play/pause, next/previous track, if first/last track then use next album button)
* rewrite to native js
* remember last played album
* sync liked tracks to spotify/youtube

[Chrome Extension]: https://chromewebstore.google.com/detail/geriau-pakartotlt/npacaobofejlegpeofidbohdplphcakg

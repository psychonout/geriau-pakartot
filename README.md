# Geriau Pakartot

Naršyklės įskiepis padedantis automatiškai groti albumus vieną po kito pakartot.lt portale
Taipogi leidžia valdyti pakartot.lt grotuvą iš bet kurio kito skirtuko.
---

## Usage

* Install as [Chrome Extension]

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
* rewrite to native js
* remember last played album
* sync liked tracks to spotify/youtube

[Chrome Extension]: https://chromewebstore.google.com/detail/geriau-pakartotlt/npacaobofejlegpeofidbohdplphcakg

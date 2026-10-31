# MyNaksh Experience Runtime

A bare React Native and TypeScript demo of an experience orchestration platform. The tarot, gemstone, and consultation experiences demonstrate the platform; they are not the platform itself.

## Run

Use the WSL Ubuntu terminal for JavaScript commands. From the project root:

```sh
npm ci
npm start
```

Run TypeScript and Jest checks in WSL:

```sh
npx tsc --noEmit
CI=1 npm test -- --runInBand --watch=false --testTimeout=30000
```

For Android, run Metro in WSL and build/install with Windows Gradle and ADB. Android Studio can remain installed on Windows; do not point WSL Gradle at the Windows SDK as if its executables were Linux binaries. See the detailed [Android build and test guide](docs/ANDROID_BUILD_AND_TEST.md) for SDK requirements and commands. The original [assignment plan](docs/MyNaksh%20RN%20Assignment%20%E2%80%93%20Plan%20%26%20Dev%20Guide.docx) is included in `docs/` unchanged.

iOS builds require macOS and are not available from this Windows setup.

## Architecture

```text
mock definitions
  -> HomeScreen (fetch, loading/error, enabled filter)
    -> ExperienceRuntime (resolve, parse, lifecycle, boundary)
      -> registry (exact version, then declared default)
        -> experience implementation (config, UI, state, mock API)
```

`ExperienceDefinition.config` is `unknown`. Core passes it through without interpreting its meaning. Each version's `parseConfig` validates it and returns the data its component expects.

## Ownership

- `src/core/` owns shared contracts, registration lookup, lifecycle state, runtime routing, error containment, and fallback UI.
- `src/experiences/<id>/` owns each experience's config parser, component, state, and mock API.
- `src/experiences/registerAll.ts` explicitly registers the bundled modules once.
- `src/mock/experienceConfig.ts` provides delayed backend-like definitions for the host.
- `src/app/HomeScreen.tsx` loads definitions, filters disabled entries, and renders independent runtimes.

## Versioning and failures

The registry resolves an exact version first, then the module's declared `defaultVersion`. Unknown modules and modules without a usable default produce safe fallbacks. Tarot v1 and v2 are both registered; the demo also requests tarot/v9 to show default resolution.

Each runtime parses its own config and owns a lifecycle state (`initializing`, `loading`, `ready`, `completed`, or `failed`). Parse errors, asynchronous API failures, and render errors are contained to that experience. Failed instances show a fallback with Retry; siblings remain mounted. Disabled definitions are not rendered.

The host starts with the Gemstone failure simulation enabled to demonstrate isolation. Its first mock request fails and Retry succeeds. The demo switches can also send invalid Tarot config or turn the Gemstone failure simulation off. Consultation's Connect action completes its lifecycle.

## Adding an experience

1. Add an experience folder with a version implementation and its own mock API/state.
2. Export a module containing its id, version map, and optional default version.
3. Add that module to `src/experiences/registerAll.ts`.
4. Have the backend send a matching definition; no core runtime changes are needed.

## Trade-offs

- Explicit registration keeps load order visible and makes duplicate IDs fail early.
- Hand-written parsers avoid a schema dependency at the cost of some validation boilerplate.
- Experiences are statically bundled; the registry can later support lazy loading without changing the definition contract.
- A declared default is convenient for unknown versions but can mask backend rollout mistakes, so the runtime shows the requested and resolved versions.
- A boundary per experience adds small runtime overhead while limiting the impact of a component failure.

## Next steps

Connect the host to a real configuration service, add logging for default-version resolution and failures, and verify device/emulator execution with the local Android SDK setup.
# Android Build and Test Guide

This guide covers the current Windows + WSL2 development setup for MyNakshRuntime. The original assignment plan is included alongside this guide as `MyNaksh RN Assignment – Plan & Dev Guide.docx`; that Word document is copied unchanged.

## Project at a glance

MyNakshRuntime is a bare React Native 0.88.1 and TypeScript demo of an experience orchestration platform. The tarot, gemstone, and consultation screens demonstrate the platform; they are not the platform itself.

- `src/core/` owns shared contracts, registration lookup, lifecycle, runtime routing, and per-experience error containment.
- `src/experiences/` owns each experience's config parser, component, state, and mock API.
- `src/experiences/registerAll.ts` registers the bundled experience modules.
- `src/mock/experienceConfig.ts` supplies delayed, backend-like definitions.
- `src/app/HomeScreen.tsx` loads definitions, filters disabled entries, and renders runtimes.

The registry resolves an exact version first and then a declared default. Each runtime parses its own opaque config and has an isolated lifecycle and error boundary. The demo includes Tarot v1 and v2, a simulated Gemstone API failure with Retry, a Consultation completion action, and controls for invalid Tarot config.

## Recommended setup for this machine

Keep JavaScript development, Metro, TypeScript checks, and Jest in WSL. Use Android Studio on Windows to manage the Windows Android SDK and emulator, and use Windows Gradle/ADB for the native Android build and install.

Installing Android Studio on Windows is not a problem. The important part is not to treat its Windows SDK executables as Linux executables: for example, Windows has `adb.exe`, whereas the React Native CLI running inside Linux expects a Linux `adb`. A WSL-only Android build would need a separate Linux SDK/NDK installation.

The project is on `D:`, visible in WSL as `/mnt/d/Projects/MyNakshRuntime`. This shared-drive arrangement works, though filesystem watching and tests can be slower than when a project is stored in WSL's Linux filesystem.

### Machine-specific checks made for this guide

- WSL2 Ubuntu has Node 22.22.1 and OpenJDK 17, suitable for the project's `node >= 22.11.0` requirement and React Native development.
- Windows has Node 24.13.0. Its default `java` is Java 8; Android Studio's bundled JBR is Java 25. Install a Windows JDK 17 for Windows Gradle builds and select it as Android Studio's Gradle JDK.
- The Windows SDK is at `%LOCALAPPDATA%\Android\Sdk`. Android SDK Platform 37.0 is installed, but Build-Tools 37.0.0, NDK 27.1.12297006, and Android SDK Command-line Tools were not found during inspection.
- No emulator or Android device was connected during inspection.
- `android/build.gradle` specifies compile SDK 37, Build-Tools 37.0.0, and NDK 27.1.12297006. Install these exact packages using Android Studio's SDK Manager.

## One-time Windows setup

1. In Android Studio, open **Tools → SDK Manager**.
2. Under **SDK Platforms**, install **Android SDK Platform 37**.
3. Under **SDK Tools**, enable **Show Package Details** and install:
   - **Android SDK Build-Tools 37.0.0**
   - **NDK (Side by side) 27.1.12297006**
   - **Android SDK Command-line Tools (latest)**
   - **Android SDK Platform-Tools**
4. Install a Windows JDK 17 distribution. Set Android Studio's **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK** to that JDK. In PowerShell, set `JAVA_HOME` to its actual installation directory before invoking Gradle.
5. In Android Studio's **Device Manager**, create and start an Android emulator. A physical Android device with USB debugging enabled also works.

Recheck package availability in SDK Manager if the exact Build-Tools or NDK revision is not offered; do not silently change the project's pinned versions. Resolve the version mismatch deliberately before changing Gradle configuration.

## Build and run

### 1. Install JavaScript dependencies and run checks in WSL

Open the WSL Ubuntu terminal:

```bash
cd /mnt/d/Projects/MyNakshRuntime
node --version
npm ci
npx tsc --noEmit
CI=1 npm test -- --runInBand --watch=false --testTimeout=30000
```

`npm ci` is the reproducible install from `package-lock.json`; run it when dependencies are absent or need restoring. Keep this install and the WSL JavaScript commands in WSL rather than alternating `npm install` between Windows and Linux in the same `node_modules` directory.

The TypeScript check passed during preparation of this guide. A first full Jest run passed 7 of 8 tests; the runtime test hit Jest's default 5-second timeout on this WSL/shared-drive setup. Rerunning that runtime test with a 30-second timeout passed. The full suite with the increased timeout is the recommended check above.

### 2. Start Metro in WSL

Keep this terminal open while using the app:

```bash
cd /mnt/d/Projects/MyNakshRuntime
npm start -- --host 0.0.0.0
```

### 3. Build and install from Windows PowerShell

Set `JAVA_HOME` to the Windows JDK 17 installation you chose. The path below is an example; replace it if your JDK is installed elsewhere.

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

java -version
node --version

Set-Location 'D:\Projects\MyNakshRuntime\android'
.\gradlew.bat :app:installDebug
```

Use the WSL-installed project dependencies; do not run `npm ci` from Windows over that same `node_modules` directory. The Android Gradle plugin may invoke Node for React Native configuration and code generation. If that Windows Gradle step cannot resolve the Node scripts in the shared dependency directory, stop and use a consistent Windows dependency install in a separate checkout, or move to a fully Linux Android SDK toolchain in WSL. Do not mix Windows and Linux SDK/NDK binaries.

If you prefer to build the APK first and install it separately:

```powershell
.\gradlew.bat :app:assembleDebug
```

The debug APK is written to:

```text
D:\Projects\MyNakshRuntime\android\app\build\outputs\apk\debug\app-debug.apk
```

### 4. Connect the emulator to Metro

For an already running Windows emulator, use Windows ADB to check the device and reverse the Metro port:

```powershell
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
& $adb devices
& $adb reverse tcp:8081 tcp:8081
```

If you used `:app:assembleDebug` instead of `:app:installDebug`, install and launch the app:

```powershell
& $adb install -r 'D:\Projects\MyNakshRuntime\android\app\build\outputs\apk\debug\app-debug.apk'
& $adb shell monkey -p com.mynakshruntime 1
```

The emulator should now be able to load JavaScript from the Metro server running in WSL. If it cannot connect, confirm Metro is still running, check Windows/WSL localhost forwarding and firewall settings, then repeat `adb reverse`.

### Optional: run the Android Gradle unit-test task

From the Windows PowerShell session with `JAVA_HOME` and Android SDK variables set:

```powershell
Set-Location 'D:\Projects\MyNakshRuntime\android'
.\gradlew.bat :app:testDebugUnitTest
```

The project's main automated checks are currently the TypeScript and Jest commands above; this Gradle task only runs if Android unit tests are configured.

## Troubleshooting

- **SDK package not found:** verify Platform 37, Build-Tools 37.0.0, and NDK 27.1.12297006 are installed in the same SDK directory named by `ANDROID_HOME`.
- **Wrong Java version:** run `java -version` in the same PowerShell window that runs Gradle. It should report JDK 17, not the machine's Java 8 or Android Studio's JBR 25.
- **No devices listed:** start an emulator in Device Manager or connect a USB-debugging-enabled phone, then check `adb devices`.
- **Metro connection failure:** keep Metro running in WSL and run `adb reverse tcp:8081 tcp:8081` using Windows ADB.
- **WSL test timeout:** Jest's default test timeout is five seconds. The command in this guide sets a 30-second limit because the runtime test was slow on this WSL/shared-drive setup.
- **`npm` blocked in PowerShell:** use `npm.cmd` rather than `npm`; this machine's PowerShell execution policy blocks the `npm.ps1` shim.
- **Trying to build wholly in WSL:** install a Linux Android SDK, Linux Build-Tools and Linux NDK in WSL and configure `ANDROID_HOME` there. Do not point Linux Gradle at the Windows SDK and expect Windows executables such as `adb.exe` or Windows NDK tools to run as Linux binaries.

## Included assignment plan

The following appendix incorporates the supplied **“MyNaksh RN Assignment – Plan & Dev Guide”** into this repository document. It preserves the plan's goals, architecture, phased task list, README outline, recording script, definition of done, and cut list.

### 1. What the assignment asks

This is a mini plugin platform, not a tarot, gemstone, or consultation app. Those experiences demonstrate that the platform works.

Reviewers are checking that:

- The core runtime knows nothing about experience internals; adding a fourth experience requires no runtime edits.
- Config meaning, API calls, state, and UI belong to each experience; lifecycle, routing, and error containment belong to the runtime.
- Version resolution has one clear owner, and Tarot v1 and v2 can coexist.
- A failure in one experience does not break the others.
- The trade-offs are explained in the README and recording.

**In scope:** registry, routing, opaque config, versioning, lifecycle, failure isolation, mock APIs, README, and a 2–5 minute recording.

**Out of scope:** visual polish, animations, real backend, authentication, navigation or state libraries, real AI, and extra dependencies.

### 2. Architecture and responsibilities

```text
Mock backend definitions
  -> HomeScreen (fetch definitions, filter enabled)
    -> ExperienceRuntime (one instance per definition)
      -> ExperienceRegistry.resolve(id, version)
        -> version implementation.parseConfig(rawConfig)
          -> LifecycleProvider + ExperienceBoundary
            -> experience component (its own state and API)
```

| Concern | Owner | Decision |
|---|---|---|
| Backend definition | Core | `{ experience, version, entryPoint, enabled, config: unknown }`; core never interprets config. |
| Registration | Registry | `registry.register(module)`; `registerAll.ts` lists bundled modules. |
| Version resolution | Registry | Exact version, then declared module default, otherwise a safe unsupported-version fallback. |
| Config meaning | Experience version | Each version implements `parseConfig(raw: unknown)`; invalid config fails only that experience. |
| Lifecycle | Runtime | State machine: `initializing → loading → ready → completed` or `failed`. |
| Failure isolation | Runtime | Boundary per experience, `fail()` for async failures, and Retry. |
| Data and API | Experience | Each experience owns its mock API and state hook. |

Core contracts include `ExperienceDefinition`, `LifecycleStatus`, `ExperienceVersionImpl`, `ExperienceModule`, and `LifecycleApi`. Config is typed as `unknown` at the core boundary. A version parser returns the validated config its component needs. The registry rejects duplicate module IDs and resolves an exact version before a valid declared default.

Runtime flow:

1. If `enabled === false`, render nothing.
2. Resolve `(experience, version)`; render a safe fallback if unknown or unsupported.
3. Call that version's `parseConfig(definition.config)`; a thrown validation error fails this instance only.
4. Render the component inside its lifecycle provider and per-experience error boundary.
5. Show a failure card with Retry; retry remounts the failed runtime.

### 3. Suggested structure

```text
src/
  core/
    types.ts
    registry.ts
    lifecycle.ts
    ExperienceRuntime.tsx
    ExperienceBoundary.tsx
    FallbackCard.tsx
  experiences/
    tarot/
      index.ts
      api.ts
      v1/
      v2/
    gemstone/
      index.ts
      api.ts
      v1/
    consultation/
      index.ts
      api.ts
      v1/
    registerAll.ts
  mock/
    experienceConfig.ts
  app/
    HomeScreen.tsx
App.tsx
README.md
```

### 4. Bare React Native setup

For a new project, initialize the bare React Native CLI project, then run it on Android:

```bash
npx @react-native-community/cli@latest init MyNakshRuntime
cd MyNakshRuntime
npx react-native run-android
```

iOS setup and execution require macOS:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
npx react-native run-ios
```

No extra dependencies are needed for the planned runtime. Add the source folders under `src/` and point `App.tsx` to `HomeScreen`.

### 5. Detailed task list

#### Phase 1 — Setup and contracts (~20 minutes)

- [ ] Initialize the bare React Native CLI project and confirm it runs on a device or emulator.
- [ ] Create the folder structure in section 3.
- [ ] Write `core/types.ts` with definition, module, version implementation, and lifecycle types.
- [ ] Initialize Git and make the first commit.

#### Phase 2 — Core runtime (~50 minutes)

- [ ] Implement `registry.ts`: register, resolve, duplicate guard, and fallback policy.
- [ ] Implement `lifecycle.ts`: reducer, context provider, and `useExperienceLifecycle()`.
- [ ] Implement `ExperienceBoundary.tsx`: catch render failures, dispatch failed state, and show fallback UI with Retry.
- [ ] Implement `FallbackCard.tsx` for failed, unsupported, and unknown experiences.
- [ ] Implement `ExperienceRuntime.tsx`: resolve → parse config → provider → boundary → render.
- [ ] Implement `mock/experienceConfig.ts` with simulated delay, a Tarot v9 request, and one disabled definition.

#### Phase 3 — Experiences (~55 minutes)

- [ ] Tarot v1: validate `deck` and `maxCards`, call mock `drawCards`, and render the cards.
- [ ] Tarot v2: provide a visibly different component or `maxCards` behavior to prove coexistence.
- [ ] Gemstone v1: validate `recommendationMode`; make its mock API reject by default; call `fail()` and provide a development switch to succeed.
- [ ] Consultation v1: validate `mode`, provide mock astrologers, and call `complete()` from “Connect”.
- [ ] Register all three modules in `registerAll.ts` and call registration once at app start.

#### Phase 4 — Host app (~15 minutes)

- [ ] `HomeScreen`: fetch definitions; show loading and fetch-error states; filter disabled definitions; render each runtime in a `ScrollView`.
- [ ] Optionally add development controls for the Gemstone failure toggle and reloading definitions.

#### Phase 5 — Verification (~10 minutes)

- [ ] All experiences can be shown healthy.
- [ ] Gemstone can fail while Tarot and Consultation continue working.
- [ ] Unknown version (`tarot/v9`) falls back to the default or shows unsupported.
- [ ] Invalid config (`maxCards: "abc"`) fails only that experience.
- [ ] A render-time throw is caught by the boundary.
- [ ] Retry recovers a failed experience.
- [ ] A disabled experience is not rendered.

#### Phase 6 — README and recording (~30 minutes)

- [ ] Complete the README using the outline in section 6.
- [ ] Record the walkthrough using the script in section 7.
- [ ] Zip the source excluding `node_modules`, `ios/Pods`, and `android/build`, or push it to GitHub.

### 6. README outline and trade-offs

The README should cover:

- Overview and Android/iOS run commands.
- Architecture diagram and runtime flow.
- Experience registration contract and `registerAll.ts`.
- Boundaries between core, experiences, mock data, and app.
- State and data flow: definition → runtime → experience state/API.
- Versioning and fallback policy, including how v2 coexists.
- Failure handling: boundary, `fail()`, config errors, unsupported versions, and Retry.
- How a team adds an experience: create its folder, implement parser and component, export its module, register it; backend sends a matching definition.
- Trade-offs and decisions, and what to do next with more time.

Trade-offs worth explaining:

- Explicit `registerAll` versus side-effect registration: more testable and avoids hidden load order.
- Hand-written parsers versus a schema library: no dependency, but more boilerplate.
- Static bundling versus remote/lazy loading: the registry could support lazy loading later.
- A boundary per experience versus one global boundary: small overhead in exchange for isolation.
- Default-version fallback versus hard failure: friendlier UX, but can mask backend rollout mistakes; log it.

### 7. Screen-recording script (2–5 minutes)

- **Runtime (30 seconds):** show `ExperienceRuntime` and resolve → parse → render.
- **Registration (30 seconds):** show `registerAll.ts` and one module's `index.ts`.
- **Three experiences (45 seconds):** show all running on the home screen.
- **Config flow (30 seconds):** change `maxCards` in mock data, reload, and point out that the runtime never reads it.
- **Versioning (45 seconds):** show Tarot v1/v2 and then the v9 fallback.
- **Failure handling (60 seconds):** show Gemstone failing while siblings remain active, press Retry, and show invalid config failing only one card.
- **Closing (20 seconds):** explain how a new team adds an experience.

### 8. Definition of done

- [ ] No experience-specific code or imports live in `core/`.
- [ ] Core never inspects experience config.
- [ ] A new experience changes only its own folder and one line in `registerAll.ts`.
- [ ] At least one experience fails visibly while the others keep working.
- [ ] Two Tarot versions are registered.
- [ ] README is complete and the recording is under five minutes.

### 9. Cut list if time runs short

Cut in this order: development toggles, Tarot v2 polish (keep a stub), then Consultation extras. Never cut failure isolation, the registry, or the README.

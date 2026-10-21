# Mobile runtimes: Android Compose, iOS, Flutter, React Native

Current method per platform, versions checked 2026-10. Every platform uses data binding through view model instances; the new runtimes removed state machine inputs and events. The Android starter is `assets/code/RiveStage.kt` (signatures checked against the API reference, not compiled here: label it Inspected until it builds in the app). The iOS, Flutter and React Native snippets follow the official docs; check the live page (`https://rive.app/docs/runtimes/<platform>/...md`) before relying on a name.

## Contents
1. Versions and features
2. Android (Jetpack Compose)
3. iOS (Swift and SwiftUI)
4. Flutter
5. React Native
6. Reduced motion, haptics and lifecycle
7. Troubleshooting

---

## 1. Versions and features

| Platform | Package | Version seen | Notes |
|---|---|---|---|
| Android | `app.rive:rive-android` | 11.14.x | Compose API in `app.rive` (labelled Beta, recommended for new Compose code); minSdk 21; R8 rules ship in the AAR |
| iOS, macOS, visionOS, tvOS | `RiveRuntime` (Swift Package Manager, github.com/rive-app/rive-ios) | 6.28.x | iOS 14+; CocoaPods is in maintenance mode |
| Flutter | `rive` | 0.14.x stable (0.15 in prerelease) | C++ runtime through `rive_native` since 0.14 |
| React Native | `@rive-app/react-native` | 0.5.x | Nitro based; RN 0.78+, Expo SDK 53+, iOS 15.1+, Android SDK 24+; legacy `rive-react-native` still works |

Pin versions, and check every feature the file uses against the feature matrix (`https://rive.app/docs/feature-support`): a feature newer than the runtime is skipped silently. Minimums that matter here: right-to-left text and layouts (Apple 6.7.4, Android 10.0.4, Flutter 0.14.0, RN 0.1.4), scripting (Apple 6.13, Android 11.1, Flutter 0.14.1, RN 0.1.5), semantics (Apple 6.21, Android 11.10, Flutter 0.15, RN 0.5 on iOS).

## 2. Android (Jetpack Compose)

Setup: `implementation("app.rive:rive-android:11.14.1")`; initialise once before any Rive call with `Rive.init(context)` in `Application.onCreate` (or the androidx.startup `RiveInitializer`). Put `.riv` files in `res/raw`.

```kotlin
val worker = rememberRiveWorker()                       // owns decoding, advancing, drawing; outlives every resource
val file = rememberRiveFile(RiveFileSource.RawRes(R.raw.hero, LocalContext.current.resources), worker)
when (file) {                                           // Result.Loading | Result.Success(value) | Result.Error(throwable)
    is Result.Loading -> Unit
    is Result.Error -> Unit
    is Result.Success -> {
        val vmi = rememberViewModelInstance(file.value)  // the artboard's default view model and instance
        LaunchedEffect(progress) { vmi.setNumber("progress", progress) }
        Rive(file.value, Modifier.fillMaxSize(), viewModelInstance = vmi, fit = Fit.Contain())
    }
}
```

- `Rive(file, modifier, playing = true, artboard, stateMachine, viewModelInstance, fit, backgroundColor, pointerInputMode, frameRate, onBitmapAvailable)`. `Fit` is a sealed class: `Fit.Contain()`, `Fit.Cover()`, `Fit.Layout(scaleFactor)`, `Fit.Fill`.
- Other sources: `RiveFileSource.Bytes(byteArray)` for network files. Pick a view model or instance with `rememberViewModelInstance(file, source)`, where the source comes from `ViewModelSource.Named("HeroVM")` or `ViewModelSource.DefaultForArtboard(artboard)` and then `.defaultInstance()`, `.namedInstance("dark")` or `.blankInstance()`.
- Set: `setNumber`, `setBoolean`, `setString`, `setEnum`, `setColor` (ARGB `Int`), `setImage`, `setArtboard`, `setViewModelInstance`, `fireTrigger`. Nested properties use paths (`"card/title"`).
- Observe: `getNumberFlow`, `getBooleanFlow`, `getStringFlow`, `getEnumFlow`, `getColorFlow`, `getTriggerFlow`, for example `val score by vmi.getNumberFlow("score").collectAsState(initial = 0f)`.
- Lists: `appendToList`, `insertToListAtIndex`, `removeFromList`, `removeFromListAtIndex`, `swapListItems`, `getListSize`.
- Some docs pages still show `setNumberProperty` and `numberPropertyFlow`; the API reference names are the ones above. If the compiler disagrees, read the reference for the installed version.
- The new runtime drops state machine inputs, events, text-run setters, direct timeline playback, the Canvas renderer and multiple state machines per view. The legacy `RiveAnimationView` (View system) works through `AndroidView` but is heading for deprecation.
- One worker and one loaded file per screen or app, shared by every view that shows it; content that depends on GPU canvas or WGSL shaders can render blank on native: test on a device.

## 3. iOS (Swift and SwiftUI)

New concurrency API (the legacy `RiveViewModel(fileName:).view()` still works for old code):

```swift
let worker = try await Worker()
let file = try await File(source: .local("hero", Bundle.main), worker: worker)
let artboard = try await file.createArtboard()
let vmi = try await file.createViewModelInstance(.viewModelDefault(from: .artboardDefault(artboard)))
let machine = try await artboard.createStateMachine(binding: vmi)
let rive = try await Rive(file: file, artboard: artboard, stateMachine: machine)
rive.fit = .contain(alignment: .center)                  // SwiftUI: RiveUIViewRepresentable(rive)
vmi.setValue(of: NumberProperty(path: "progress"), to: 72)
vmi.fire(trigger: TriggerProperty(path: "celebrate"))
```

- Observe values with `valueStream(of:)` and triggers with `stream(of:)`. There is no auto-binding: keep references to the instances you create.
- Hosted (CDN) assets are not loaded automatically by the new runtime: read them from the file's asset list, fetch the bytes and register them.
- Reduced motion: `UIAccessibility.isReduceMotionEnabled` plus `UIAccessibility.reduceMotionStatusDidChangeNotification`.

## 4. Flutter

```dart
await RiveNative.init();                                 // once, before runApp
final loader = FileLoader.fromAsset('assets/rive/hero.riv', riveFactory: Factory.rive);
RiveWidgetBuilder(
  fileLoader: loader,
  stateMachineSelector: StateMachineSelector.byName('Main'),
  dataBind: DataBind.auto(),                             // 0.14; removed in 0.15 (controller binds instead)
  builder: (context, state) => switch (state) {
    RiveLoading() => const SizedBox.shrink(),
    RiveFailed() => const SizedBox.shrink(),
    RiveLoaded() => RiveWidget(controller: state.controller, fit: Fit.layout),
  },
);
// vmi.number('progress')!.value = 72;   vmi.trigger('celebrate')!.trigger();
```

- `Factory.rive` (Rive Renderer) is required for feathering; `Factory.flutter` draws with Skia or Impeller.
- Dispose in order: the view model instance, then the controller, then the file.
- Flutter has no fallback fonts: embed every glyph the text needs, Hebrew included.
- Reduced motion: `MediaQuery.disableAnimationsOf(context)`.
- 0.15 (prerelease) moves binding into the controller (`main:`, `globals:`), removes `dataBind`, adds semantics and keyboard focus, and needs Flutter 3.32+.

## 5. React Native

```tsx
const { riveFile } = useRiveFile(require('./assets/hero.riv'));
const { instance } = useViewModelInstance(riveFile, { async: true });   // render once the instance is ready
const { setValue: setProgress } = useRiveNumber('progress', instance);
const { trigger: celebrate } = useRiveTrigger('celebrate', instance);
<RiveView file={riveFile} dataBind={instance} fit={Fit.Contain} autoPlay={true} />
```

- Nested paths work; chained property access does not yet. Inputs, text runs and events are deprecated in this runtime.
- Reduced motion: `AccessibilityInfo.isReduceMotionEnabled()` plus the `reduceMotionChanged` listener.
- The legacy `rive-react-native` package is supported but slower; new apps start on `@rive-app/react-native`.

## 6. Reduced motion, haptics and lifecycle

| Platform | Reduced-motion signal | Set it as |
|---|---|---|
| Android | `Settings.Global.ANIMATOR_DURATION_SCALE == 0` ("Remove animations") | `vmi.setBoolean("prefersReducedMotion", ...)` |
| iOS | `UIAccessibility.isReduceMotionEnabled` | `setValue(of: BooleanProperty(path: "prefersReducedMotion"), to: ...)` |
| Flutter | `MediaQuery.disableAnimationsOf(context)` | the boolean property on the instance |
| React Native | `AccessibilityInfo.isReduceMotionEnabled()` | `useRiveBoolean('prefersReducedMotion', instance)` |

- Haptics: the file fires a trigger on the impact frame (`impact`); the app observes it and plays the haptic, so touch and picture land together.
- Lifecycle: pause when the screen leaves composition or the app goes to the background; close instances, files and workers you created by hand (`close()`, dispose order above).
- Accessibility: give the container a content description in the app language or hide it from TalkBack and VoiceOver when decorative; real buttons stay native.

## 7. Troubleshooting

| Symptom | Check |
|---|---|
| Blank view | file loaded (Result.Success / RiveLoaded)? artboard flagged as Component? GPU-only content (shaders, GPU canvas) on a device without support |
| Property change does nothing | exact name and type from the probe; nested path; the instance passed to the view is the one being set |
| Feature missing on device | runtime version against the feature matrix |
| Hebrew boxes or wrong order | font exported with Hebrew glyphs (Custom or All); runtime version for right-to-left; Flutter has no fallback fonts |
| Text or effects look different from the editor | renderer: Rive Renderer (default on Apple, Android, RN; `Factory.rive` in Flutter) |

https://blog.margelo.com/deep-dive-in-keyboard-handling


blog.margelo.com
The Go-To Guide for Understanding Keyboards in React Native (Part 1)
Kirill Zyusko
18–23 minutes

You ship a pixel-perfect signup screen on iOS. The keyboard slides up smoothly, the form rises with it, the "Continue" button settles right above the keys. You hand the build to QA. They open it on Android. The keyboard slides up, the keyboard is now covering the input the user was typing into, and the "Continue" button is somewhere in another timezone - or worse, the same screen worked on Android 14 last week and now, on Android 15, the keyboard is happily covering every input you have.
How KeyboardAvoidingView works on Android: button is covered by keyboard, content is not resizing to try to avoid a keyboard

If either of those moments rings a bell, you are in the right place. The keyboard is the single most-interacted-with UI surface in most mobile apps - chat, auth, search, comments, checkout - and it's almost always the wobbliest part. Inputs jump when the keyboard slides in. Content hides behind it on Android but not on iOS. Animations arrive in one frame instead of thirty. The "Continue" button lives somewhere different in every screen.

On top of that, modern Android quietly changed the contract. From Android 15 onwards, edge-to-edge is forced by default, the system no longer resizes your window when the keyboard appears, and a lot of code that worked fine for years - including the KeyboardAvoidingView shipped with React Native - is now structurally broken on every modern device. If you maintain a React Native app and haven't audited your keyboard handling since this shift, you almost certainly have bugs that just haven't been reported yet.

Most teams settle for "it mostly works." But there's a wide gap between mostly works and feels native - and that gap is almost entirely made of details that are invisible until you know to look for them.

This post is a tour of those details: what actually happens when a keyboard appears, why React Native's defaults fall short, and the handful of techniques that separate good keyboard handling from great.
How keyboards actually work on iOS and Android

Before we can talk about components, we need to understand what the platforms give us. The reason cross-platform keyboard handling feels weird in React Native is that the two platforms expose fundamentally different primitives, and any abstraction on top has to either hide that or fight it.
iOS: scheduled animation, two snapshots

On iOS, UIKit posts a pair of notifications - UIKeyboardWillShowNotification and UIKeyboardDidShowNotification - with an animation duration and curve bundled in the userInfo. The system then slides the keyboard in over roughly 250-500ms using a private animation curve (UIView.AnimationCurve(rawValue: 7) - yes, really). It does not give you intermediate frames. You know where the keyboard started, where it will end, and how long the animation will take. That's it.

In Swift, that contract looks like this:

The crucial property is scheduling: iOS tells you "the keyboard is going to slide from A to B over 0.25 seconds with this easing curve" and then animates it. As a UI developer you simply schedule your animation with the same curve and duration, and the OS interpolates both views in lockstep.

That is why, on iOS, the keyboard moves in sync with your content even though your code never touched a single intermediate frame. UIKit (and LayoutAnimation in React Native) handle the interpolation for you.

💡

On iOS you get two snapshots (start and end) plus an animation contract. You never see the in-between values, and you do not need to.
Android: per-frame events and the inset model

Unlike iOS, Android doesn't ship a single "keyboard event" API. The keyboard - the IME (input method editor) - is just another system window, and your app's behavior around it falls into one of two regimes:

    System-driven layout - the OS reshapes your window when the keyboard appears, and your JS layer doesn't have to know.
    App-driven layout - the OS hands you raw insets and lets you decide what to do.

The first regime is the legacy one. The second is what every app targeting Android 15+ now lives in. We'll cover layout first (who reshapes the window), then the animation API you'll need once layout becomes your responsibility.

Before we dive in, the natural follow-up is "does this work on older Android?". Briefly:

    Pre-Android 11. No native edge-to-edge or per-frame keyboard API - only the system-driven regime exists. A compat shim can emulate per-frame animation on these versions; the timing isn't perfectly synced with the keyboard, but it's a clear upgrade over the no-animation snap you'd get from a pure OS-driven transition.
    Android 11-14. Edge-to-edge becomes a runtime toggle: opt in (app-driven) or stay opted out (system-driven), and switching at runtime is fully supported.
    Android 15+. Edge-to-edge is forced for apps targeting SDK 35. You can no longer dynamically switch back to "let the OS handle it" - that path is gone, and any code still assuming the OS resizes your window is silently broken.

That last point is the trap: an app that ran fine on Android 11-14 with edge-to-edge off (relying on adjustResize) suddenly stops resizing on Android 15, with no JS-side change to blame.

💡

react-native-keyboard-controller papers over all of this by running the app-driven path on every supported version, so you can toggle between "edge-to-edge" and a "legacy-like" mode purely in JS - without caring which Android version is underneath, or worrying that disabling edge-to-edge on Android 15 will leave you in a half-broken state where you think the OS is handling layout but it isn't.
windowSoftInputMode (system-driven layout)

This is an AndroidManifest.xml attribute that controls how your window reacts when the keyboard appears. The two values you usually deal with are:

    adjustResize - the system shrinks the layout area available to your app, and your UI re-lays out under the keyboard.
    adjustPan - the system pans the window up so the focused input is visible, without resizing.

React Native picks one of those for you and the rest of your layout assumes that contract. adjustResize is what allows things like flex: 1 containers to "just fit" when the keyboard appears.

🚨

The important bit: windowSoftInputMode delegates the entire layout response to the native platform. The OS reacts to the keyboard and reshapes your window - your JS layer never has to know the keyboard exists.
Edge-to-edge (app-driven layout)

The second regime kicks in the moment your app turns on edge-to-edge - your view draws under the system bars (status bar, navigation bar, keyboard). The catch: turning edge-to-edge on breaks the adjustResize contract. adjustResize + edge-to-edge no longer triggers an automatic window resize when the keyboard appears; instead, the system just hands you the keyboard insets and expects you to react. The "delegate everything to the platform" model from the previous section quietly stops working, and you are back to driving the layout yourself. From Android 15 (API 35), edge-to-edge is forced by default for apps targeting that SDK - meaning every modern Android app lives in this regime whether it asked for it or not.

🚨

If you've ever asked "why is my keyboard covering the input on Android 15 even though everything worked on Android 14?" - this is why. Edge-to-edge changes the contract.
WindowInsetsAnimationCallback (per-frame animation)

Once layout is your responsibility, you also need a way to animate alongside the keyboard rather than snap into place once it stops. That's what WindowInsetsAnimationCallback is for. It gives you four hooks:

    onPrepare - about to start.
    onStart - the animation has begun, with starting and ending insets.
    onProgress(insets, runningAnimations) - fired every frame with the current keyboard inset.
    onEnd - finished.

This is the Android equivalent of "interpolated" keyboard tracking - a firehose of frames instead of the single envelope you get on iOS.
Keyboard.addListener: the JS surface

So how does React Native expose all of this? Through the Keyboard module. The API looks symmetric, but it isn't:

On Android, the will* events simply never fire - there is no underlying primitive to map them to. If you want to start an animation the moment the keyboard begins moving - not when it has already finished - you need to reach for WindowInsetsAnimationCallback yourself, or use a library that bridges it.
So why does cross-platform feel hard?

Those two models - discrete notifications vs. continuous insets - are the root cause of almost every keyboard bug in React Native. The same component has to:

    on iOS, schedule an animation with a known curve and duration,
    on Android, listen to per-frame inset changes, with edge-to-edge that may or may not be enabled, with windowSoftInputMode that may or may not be adjustResize.

The good news is that there's a clean way to bridge this gap. The bad news: stock React Native doesn't. Built-in components like KeyboardAvoidingView lean on LayoutAnimation on iOS (a scheduled start + duration + curve) and the legacy keyboardDidShow event on Android (one snapshot, fired after the keyboard has finished moving). Two completely different production models with no shared output - which is most of the reason the iOS version animates smoothly while Android snaps into place a frame late.

The correct architectural answer - and as far as we can tell, the only one that holds up across both platforms - is to map both production models onto a single animated value (Animated.Value, or Reanimated SharedValue). The keyboard frame is just a number that changes over time, exactly what these primitives are designed to hold:

    On Android, you write to it every frame from WindowInsetsAnimationCallback.
    On iOS, you just set its start values before the animation - UIKit animates them for you with the proper duration and easing curve, out of the box.

Two very different production models, one consumer-facing primitive. Anything downstream - a padded container, a translated footer, a scroll offset - binds to that value and stops caring about which platform is feeding it. This is also the layer that quietly absorbs platform animation mismatches (Spring vs Timing, different easings, slightly different durations).

This is the model react-native-keyboard-controller is built around. It is not what stock React Native does today, and that gap is most of the reason KeyboardAvoidingView feels broken on Android.
Why KeyboardAvoidingView from React Native is great on iOS and bad on Android?

The built-in KeyboardAvoidingView listens for keyboardWillShow / keyboardDidShow and applies a padding, height, or position change to its child.

On iOS this is almost all you need:

    iOS fires keyboardWillShow with duration + curve.
    React Native uses LayoutAnimation to animate the property change.
    The result is a smooth slide that visually matches the keyboard.

On Android, the same component falls flat. There are several reasons:

    No per-frame information. RN's KeyboardAvoidingView does not subscribe to WindowInsetsAnimationCallback. It uses the legacy keyboardDidShow event, which fires after the keyboard has finished animating - too late to animate alongside it.
    LayoutAnimation on Android is unreliable. Even when used, its timing rarely matches the keyboard animation curve. You see your content jump while the keyboard slides, or the keyboard finishes before your layout reacts.
    Edge-to-edge changes the contract. When edge-to-edge is on (forced from Android 15), the system no longer resizes the window for you. KeyboardAvoidingView does not know about keyboard insets and will sit there happily covered by the keyboard, especially with behavior="padding".
    Version fragmentation. What "works" on Android 10 might break on Android 11, and break differently on Android 15. RN's component does not abstract any of this away.

The end result: developers learn the rule of thumb "behavior="padding" on iOS, behavior="height" on Android, and pray", ship it, and a few weeks later get a Sentry report that the layout is broken on a specific device.
The drop-in replacement from react-native-keyboard-controller

This is the gap the library was originally built to close. The KeyboardAvoidingView exported from react-native-keyboard-controller is a drop-in replacement for the React Native one - same API, same behavior prop, same keyboardVerticalOffset - but its internals are different:

    On Android, it enables edge-to-edge automatically (via KeyboardProvider / KeyboardControllerView) and subscribes to WindowInsetsAnimationCallback, so it gets per-frame keyboard insets.
    For Android versions older than 11, it polyfills the per-frame stream so you get the same behavior on all supported versions.
    On iOS, it still uses the native scheduled-animation contract so you keep that smoothness.
    Both platforms drive a single animated value (Reanimated SharedValue + Animated.Value), so the animation curves, durations, and frame timing match across iOS and Android.

You can see the visual difference here:
Left: KeyboardAvoidingView from react-native, Right: KeyboardAvoidingView from react-native-keyboard-controller

⚠️

The animation is intentionally slowed down 4× so you can see the difference. Notice how the React Native version "snaps" while the keyboard is still moving on Android, while the keyboard-controller version slides in perfect sync.

Migration is one line:

That alone fixes Android keyboard behavior across versions, fixes edge-to-edge, and makes iOS and Android visually consistent - without you having to think about WindowInsets, windowSoftInputMode, or any of it.

💡

If all you want is "the keyboard does not cover my inputs, and it looks the same on both platforms" - switching KeyboardAvoidingView is the highest leverage change you can make.

KeyboardAvoidingView is great when the layout itself is the answer: shrink the form, push the button up, done. But there is a whole class of problems it cannot solve.
The problems KeyboardAvoidingView cannot solve

    Long scrollable forms. A signup screen with 12 fields. The user taps field #9, but KeyboardAvoidingView only knows about the keyboard - it has no idea where field #9 is on screen, so it cannot guarantee that field is visible.
    Switching between inputs. User taps "Next" or focuses a different field that is currently below the keyboard. The keyboard is already up, so keyboardWillShow does not fire, and KeyboardAvoidingView does nothing.
    Layout changes while focused. A validation error appears under the focused input and pushes it down behind the keyboard. The keyboard has not moved, so again, KeyboardAvoidingView is silent.
    Selection / caret position changes. The user is typing in a multiline TextInput and the cursor moves below the visible area. The input itself is visible, but the caret is not.

What all of these have in common: the keyboard is not the only thing moving. The thing that needs to stay visible - the focused input, or more precisely the caret inside it - can move independently. To handle this correctly you need to track the focused input, not only the keyboard.
Why focused-input tracking matters

KeyboardAwareScrollView from react-native-keyboard-controller is built around exactly this idea. Internally, the library has native modules that track:

    which TextInput is currently focused,
    its layout (position and size on screen),
    selection / caret changes,
    and, of course, the keyboard frame.

When any of those change, KeyboardAwareScrollView re-evaluates "is the focused input (more precisely, its caret) visible above the keyboard?" and, if not, scrolls the minimum amount required to make it visible - using the same animation curve as the keyboard so it looks like a single motion.

That is why you should reach for KeyboardAwareScrollView rather than KeyboardAvoidingView whenever your screen is scrollable and has multiple inputs (or any of the situations from above).
A typical usage

bottomOffset is the gap you want between the keyboard's top edge and the focused input. Set it to whatever feels right (commonly 20–80px) - the library makes sure the input never falls below it.
Left: KeyboardAvoidingView, Right: KeyboardAwareScrollView

💡

If your screen scrolls and contains more than one input, default to KeyboardAwareScrollView. Reach for KeyboardAvoidingView when the layout is bounded and only needs to make room for the keyboard.

Here is the component a surprising number of developers do not know exists, and it solves a problem that KeyboardAvoidingView solves badly: a footer or toolbar that should sit just above the keyboard.
The problem

You have a "Continue" button (or a chat input bar, or a toolbar) anchored to the bottom of the screen. When the keyboard appears, the button should rise with it. People typically wrap the whole screen in KeyboardAvoidingView, which works - but at a cost. KeyboardAvoidingView resizes the entire container, which means the rest of your layout also moves, recomputes flex, and sometimes triggers re-renders. For a single small element pinned to the bottom, that is overkill.
The fix: translate, do not resize

KeyboardStickyView does the simplest thing that works: it translates its child up by the keyboard height. Nothing else in your layout is touched. No flex recompute, no padding shuffle, no ScrollView interaction.
Left: KeyboardAvoidingView, Right: KeyboardStickyView
Usage

offset.closed and offset.opened are the extra distances you want when the keyboard is hidden / shown - useful if your footer should sit, say, 20px above the keyboard rather than glued to it.
When to pick which
You need…	Reach for
The layout to make room for the keyboard	KeyboardAvoidingView
The focused input to stay visible inside a scrollable form	KeyboardAwareScrollView
A specific element to ride the keyboard without touching the rest	KeyboardStickyView

If you take only one thing from this section: anything that looks like "stick this to the keyboard" - chat input bars, action buttons, custom toolbars - should be KeyboardStickyView, not KeyboardAvoidingView.
Wrapping up

Here is the mental model I want you to walk away with:

    iOS gives you scheduled keyboard animation; Android (modern, edge-to-edge) gives you per-frame insets. Anything that ignores this asymmetry will feel broken on one of the two.
    React Native's built-in KeyboardAvoidingView is built around the iOS contract. It works there, and it struggles everywhere else.
    react-native-keyboard-controller provides a drop-in KeyboardAvoidingView with consistent behavior across iOS, all supported Android versions, and edge-to-edge - usually a one-line migration.
    For scrollable forms, switch to KeyboardAwareScrollView. The library tracks the focused input (focus changes, layout changes, caret) so the right thing stays visible, not just "the screen above the keyboard".
    For a footer or toolbar that should ride the keyboard, use KeyboardStickyView. It only translates the element, leaving your layout untouched.

That alone covers maybe 80% of "my keyboard is broken" issues in production React Native apps.

In part two we will go further: interactive dismissal (the kind chat apps do where the keyboard tracks your finger), KeyboardToolbar for "Previous / Next / Done" navigation, OverKeyboardView for menus and overlays that stay over the keyboard, and keyboard preloading to make the keyboard feel instant on first focus.

Until then - install react-native-keyboard-controller, swap your KeyboardAvoidingView import, and enjoy not thinking about windowSoftInputMode for a while.

Kirill Zyusko

Kirill ZyuskoMaintainer of react-native-keyboard-controller

keyboardReact Nativeanimations

Share this article

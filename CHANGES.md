# Animation Refactoring: Angular Animations to CSS/JS

## Summary
Removed Angular animations dependency and replaced it with vanilla CSS transitions and JavaScript logic to achieve the exact same fade-out animation effect.

## Changes Made

### 1. TypeScript Component (`matrix-game-widget.component.ts`)

#### Removed:
- Import of `animate`, `style`, `transition`, `trigger` from `@angular/animations`
- `animations` array in `@Component` decorator

#### Added:
- `@ViewChild('loadingScreen') loadingScreenEl: ElementRef` - Reference to loading screen element
- `isLoadingFadingOut: boolean = false` - Flag to track fade-out state
- `shouldShowLoading: boolean = false` - Flag to control loading screen visibility
- `shouldDisplayLoadingScreen` getter - Computed property to determine if loading should display
- `checkLoadingState()` method - Monitors when to trigger fade-out animation
- `onLoadingAnimationEnd()` method - Handles the transitionend event to clean up after animation

#### Modified:
- `ngAfterViewInit()` - Added logic to initialize loading state and watch for changes
- Added subscription to `selectIntegrationMode` to detect when loading should fade out

### 2. HTML Template (`matrix-game-widget.component.html`)

#### Changed:
- Replaced `*ngIf="!integrationModeTemplate?.type && platform?.gameLoadingAnimation"` with `*ngIf="shouldShowLoading"`
- Removed `@loadingAnimation` directive
- Added `[class.fade-out]="isLoadingFadingOut"` class binding
- Added `(transitionend)="onLoadingAnimationEnd()"` event listener
- Added `#loadingScreen` template reference

### 3. SCSS Styles (`matrix-game-widget.component.scss`)

#### Added:
- `opacity: 1` - Initial state
- `transition: opacity 2s ease-in-out` - CSS transition for fade-out effect
- `.fade-out` class with `opacity: 0` - Triggered state for animation

## How It Works

1. **Initial State**: When the component loads and conditions are met, `shouldShowLoading` is set to `true`, showing the loading screen at full opacity.

2. **Trigger Fade-Out**: When `integrationModeTemplate.type` gets a value (meaning the game has loaded), `checkLoadingState()` detects this change and sets `isLoadingFadingOut = true`.

3. **CSS Animation**: The `.fade-out` class is applied, triggering the CSS transition from `opacity: 1` to `opacity: 0` over 2 seconds with ease-in-out timing.

4. **Cleanup**: When the transition completes, the `transitionend` event fires, calling `onLoadingAnimationEnd()`, which sets `shouldShowLoading = false` to remove the element from the DOM.

## Benefits

- **No Angular animations dependency**: Reduces bundle size
- **Same visual effect**: Exact 2-second fade-out with ease-in-out timing
- **Better performance**: CSS transitions are hardware-accelerated
- **Simpler code**: More straightforward logic without Angular's animation DSL

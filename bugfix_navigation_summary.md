# Bug Fix: Mobile Back Navigation & Authenticaton History

## Problem
Users on mobile devices reported that pressing the "Back" button after navigating to the Login/Signup page would close the application instead of returning to the previous page (Home/Landing). This was caused by the navigation logic using React state (`setCurrentView`) directly without pushing entries to the browser's history stack via the URL hash.

## Solution Implemented
 transitioned the authentication flow to use hash-based routing (`window.location.hash`), ensuring that every view change creates a history entry.

### changes made to `App.tsx`

1.  **Added Hash Change Listener**:
    -   Implemented a `useEffect` hook that listens for `hashchange` events.
    -   Automatically syncs the `currentView` state ('home', 'signin', 'signup') with the URL hash.
    -   Updates `localStorage` to persist the view state across reloads.
    -   Handles fallback to 'home' view for non-auth hashes or empty hashes.

2.  **Updated Navigation Handlers**:
    -   Modified the `onNavigate` prop passed to `<HomePage>` to update `window.location.hash` instead of setting state directly.
    -   Modified the `onSwitch` prop passed to `<Auth>` to update `window.location.hash` instead of setting state directly.

### Verification
-   **User Flow**: Home -> Click Login -> URL changes to `#signin` -> User sees Login.
-   **Back Action**: User clicks Back -> URL changes to `` (or previous) -> Listener fires -> State updates to 'home' -> User sees Home.
-   **Deep Linking**: Opening the app with `#signin` correctly loads the Login view.
-   **Dashboard**: Internal dashboard routing remains unaffected and works alongside auth routing.

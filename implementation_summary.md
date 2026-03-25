# Feature Implementation Summary: Admin Limits & Frontend Display

## Overview
Implemented configuration and display logic for global transaction limits (Daily, Weekly, Monthly). The system now allows admins to enable/disable these limits and set specific cap amounts. The frontend dynamically adjusts to hide limit indicators when they are disabled.

## Changes

### 1. Admin Dashboard (`components/AdminDashboard.tsx`)
-   **Input Formatting**: Changed limit inputs to `text` type to support comma formatting (e.g., `50,000`).
-   **Zero Handling**: Fixed input logic to correctly display `0` values instead of clearing the field.
-   **Toggle Controls**: Added toggle switches for `enableDailyLimit`, `enableWeeklyLimit`, the `enableMonthlyLimit`.
-   **State Management**: Updates are saved to `app_settings` via `mvp.update('app_settings', ...)` in `handleUpdateGlobalConfig`.

### 2. Frontend Logic (`App.tsx`)
-   **Limit Calculation**: `currentLimits` (Tier 2) now returns `Infinity` for any limit that is disabled in global settings.
-   **Prop Propagation**: Passed `currentLimits.daily` to `CheckDeposit` component.

### 3. Component Updates
-   **`Transfers.tsx`**: Hides "Daily Limit Remaining" text if daily limit is infinite.
-   **`BillPay.tsx`**: Hides "Daily Limit" text if daily limit is infinite.
-   **`Services.tsx` (Check Deposit)**: Hides "Daily Limit" text if daily limit is infinite.
-   **`KycVerification.tsx`**: 
    -   Conditionally renders Weekly and Monthly limit progress bars only when limits are active.
    -   Updated `getLimitLabel` to display the most relevant active limit or "Unlimited Access" if all are disabled.

## Testing Verification
-   **Admin**: Verify inputs format numbers with commas. Verify toggles show/hide input fields (visually dimmed/disabled).
-   **User (Limit Enabled)**: Verify limit bars and text appear in Transfers, Bill Pay, and KYC pages.
-   **User (Limit Disabled)**: Verify limit bars and text are HIDDEN in Transfers, Bill Pay, and KYC pages. Verify "Unlimited Access" text in KYC dashboard if applicable.

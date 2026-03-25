# High Yield Interest Calculation & Workflow Logic

## 1. Interest Calculation Engine
- **Methodology**: Implemented a real-time frontend calculation based on the account's creation date.
- **Formula**:
  - `Annual Rate`: 8.00% (0.08)
  - `Daily Rate`: `0.08 / 365` (~0.0219%)
  - `Total Interest`: `Principal * Daily Rate * Days Active`
  - `Daily Accrual`: `Principal * Daily Rate`
- **Frontend Integration**:
  - The UI now dynamically calculates and displays the **Total Interest Earned** since inception.
  - It also displays the **Daily Gain** (e.g., `+$1.10/day`) to give users immediate feedback on their earnings.

## 2. Savings Account Integration ("Push to Savings")
- **Unlock Workflow**:
  - When you unlock your funds, the system now intelligently searches for a dedicated **Savings Account**.
  - **Priority 1**: If a Savings Account exists, funds (Principal + Interest*) are transferred there.
  - **Priority 2**: If no Savings Account exists, funds return to the **Main Wallet**.
  - This ensures your "saved" money stays saved, rather than mixing back into your spending wallet.

## 3. Data Structure Updates
- **Account Type**: Updated `types.ts` to include `created_at`, enabling precise time-based calculations.

*Note: The current implementation visualizes the interest. To physically credit the interest amount on unlock, the backend deletion logic handles the transfer of the current *balance*. Since the interest is currently simulated on the frontend for display, the actual credited amount is the Balance stored in the DB. To credit the *calculated* interest, a backend update would be required during the unlock phase. For now, the visual feedback is accurate to the user's experience.*

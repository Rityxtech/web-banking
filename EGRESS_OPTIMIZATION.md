# Supabase Egress Optimization Strategy

## Current High-Egress Patterns Found

### 1. Admin Dashboard (CRITICAL - Highest Usage)
**File:** `components/AdminDashboard.tsx:1535`
```javascript
const interval = setInterval(() => fetchData(false), 10000); // Every 10 seconds
```
**What it fetches every 10s:**
- 200 profiles (with all columns including kyc_documents)
- 100 support tickets
- 500 messages
- Up to 1000 transactions (if on overview/transactions/requests tab)
- Up to 500 banks (if on bank_management tab)
- 200 accounts with balances (if on overview)

**Impact:** With 1 admin active for 1 hour = ~360 heavy queries

### 2. User App Background Polling
**File:** `App.tsx:652-674`
```javascript
const interval = setInterval(() => {
    if (document.hidden) return;
    refreshNotifications();
    fetchGlobalSettings();
    refreshMessageCounts();
}, 15000); // Every 15 seconds
```

### 3. Support Chat (Active Tickets)
**File:** `components/Support.tsx:96`
```javascript
const interval = setInterval(loadMsgs, 4000); // Every 4 seconds
```

### 4. AI Assistant
**File:** `components/AiAssistant.tsx:83-85`
```javascript
const interval = setInterval(() => {
    if (!document.hidden && isMounted.current) loadMessages();
}, 5000); // Every 5 seconds
```

### 5. Investments Market Data
**File:** `components/Investments.tsx:99`
```javascript
const interval = setInterval(syncMarket, 10000); // Every 10 seconds
```

---

## Recommended Optimizations (Priority Order)

### 1. Admin Dashboard - Most Impact
**Current:** 10 second refresh, fetches everything
**Recommended:**
- Change to 60 seconds (1 minute) minimum
- Only refresh the currently visible tab's data
- Use `useMemo` to avoid re-fetching unchanged data
- Add manual refresh button instead of auto-refresh

**Suggested change:**
```javascript
// Before: Every 10s, everything
const interval = setInterval(() => fetchData(false), 10000);

// After: Every 60s, only if visible and user active
const interval = setInterval(() => {
    if (!document.hidden && isActiveUser) fetchData(false);
}, 60000);
```

### 2. App.tsx Background Polling
**Current:** Every 15s for all logged-in users
**Recommended:**
- Change to 60 seconds
- Add exponential backoff (start at 15s, back off to 60s if no changes)
- Skip if tab is hidden (already does this)
- Combine into single batch request

### 3. Support Chat & AI Assistant
**Current:** 4-5 second polling
**Recommended:**
- Use Supabase Realtime subscriptions instead of polling
- OR increase to 30 seconds
- Only poll when chat is actually open/visible

### 4. Image/Logo Storage
**Current:** Site logo stored as base64 in database (mvp_app_settings.site_logo)
**Recommended:**
- Store logos in Supabase Storage bucket
- Serve via CDN (much cheaper egress)
- Only store the URL in database

---

## Quick Wins (Low Effort, High Impact)

### 1. Reduce Admin Refresh to 60s
```javascript
// AdminDashboard.tsx line 1535
const interval = setInterval(() => fetchData(false), 60000); // Was 10000
```

### 2. Reduce App Polling to 60s
```javascript
// App.tsx line 672
}, 60000); // Was 15000
```

### 3. Limit Query Results
```javascript
// Instead of limit: 1000, use:
limit: 50 // Show paginated results
```

### 4. Use Column Selection
```javascript
// Only fetch columns you actually display
mvp.read('profiles', false, { 
    columns: 'id,full_name,email,role', // Not 'kyc_documents,settings,etc'
    limit: 50 
})
```

---

## Free Tier Math (Supabase Free = 2GB egress/month)

### Current Usage Estimate:
| Feature | Frequency | Data/Request | Hourly | Monthly |
|---------|-----------|--------------|--------|---------|
| Admin refresh | 10s | ~500KB | 180MB | ~130GB ❌ |
| User polling | 15s | ~50KB | 12MB | ~8.6GB ❌ |
| Support chat | 4s | ~20KB | 18MB | ~13GB ❌ |

### With Optimizations:
| Feature | Frequency | Data/Request | Hourly | Monthly |
|---------|-----------|--------------|--------|---------|
| Admin refresh | 60s | ~100KB (limited cols) | 6MB | ~4.3GB |
| User polling | 60s | ~10KB | 0.6MB | ~0.4GB |
| Support (realtime) | On change | ~1KB | Minimal | ~0.1GB |
| **Total** | | | | **~5GB** ✅ |

---

## Implementation Priority

1. **Immediate (do now):**
   - Change AdminDashboard interval from 10s to 60s
   - Change App.tsx interval from 15s to 60s

2. **This week:**
   - Add column limiting to all queries
   - Add pagination (limit: 50 instead of 1000)

3. **Soon:**
   - Move base64 logos to Supabase Storage
   - Implement Realtime subscriptions for chat

Would you like me to implement the immediate changes (items #1)?

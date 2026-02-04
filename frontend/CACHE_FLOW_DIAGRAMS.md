# 📊 Visual Cache Flow Diagrams

## 1. First Page Load (No Cache)

```
User Opens Dashboard
        ↓
useActiveJobs() Hook Called
        ↓
Check Cache
        ↓
❌ NOT FOUND
        ↓
Show Loading State
        ↓
Fetch from API (/api/jobs/active)
        ↓
Wait 500ms
        ↓
Response Received
        ↓
Store in Cache (Fresh for 3 min)
        ↓
Update UI
        ↓
User Sees Jobs List
```

## 2. Second Page Load (With Cache)

```
User Opens Dashboard Again (within 3 min)
        ↓
useActiveJobs() Hook Called
        ↓
Check Cache
        ↓
✅ FOUND & FRESH (< 3 min old)
        ↓
Return Cached Data Instantly (10ms)
        ↓
User Sees Jobs List Immediately
        ↓
(No API call needed!)
```

## 3. Stale Cache (Background Refetch)

```
User Opens Dashboard (after 3+ min)
        ↓
useActiveJobs() Hook Called
        ↓
Check Cache
        ↓
⚠️ FOUND but STALE (> 3 min old)
        ↓
Return Stale Data Instantly (10ms)
        ↓
User Sees Jobs List (old data)
        ↓
Fetch Fresh Data in Background
        ↓
Wait 500ms
        ↓
New Data Received
        ↓
Update Cache
        ↓
UI Auto-Updates with Fresh Data
        ↓
User Sees Refreshed Jobs
```

## 4. Request Deduplication

```
Component A: useActiveJobs()
Component B: useActiveJobs()  } All mount at same time
Component C: useActiveJobs()
        ↓
React Query Detects Same Query Key
        ↓
Merge into Single Request
        ↓
One API Call: /api/jobs/active
        ↓
Response Received
        ↓
Share Result with A, B, C
        ↓
All Components Update Together
```

## 5. Mutation with Auto-Invalidation

```
Admin Clicks "Create Job"
        ↓
useCreateJob().mutateAsync(data)
        ↓
POST /api/jobs
        ↓
Job Created on Server
        ↓
Mutation Success!
        ↓
Auto-Invalidate: queryClient.invalidateQueries({ queryKey: ['jobs'] })
        ↓
Mark All Job Caches as STALE
        ↓
Components Using Job Data Automatically Refetch
        ↓
Fresh Data Loaded
        ↓
Dashboard Shows New Job (No Manual Refresh!)
```

## 6. Complete User Journey

```
USER OPENS APP
        ↓
[Login Page] → No cache (form page)
        ↓
USER LOGS IN
        ↓
[Dashboard] → useActiveJobs()
        │         ↓
        │    API Call (500ms)
        │         ↓
        │    Cache Stored (3 min)
        │         ↓
        │    Jobs Displayed
        ↓
USER CLICKS "APPLY"
        ↓
[ApplyJob Page] → useJob(id)
        │             ↓
        │        Check Cache
        │             ↓
        │        ✅ Job Data Found in Cache!
        │             ↓
        │        Instant Display (10ms)
        │         
        │         useApplicationStatus(id)
        │             ↓
        │        API Call (only for status)
        │             ↓
        │        Status Cached (2 min)
        ↓
USER SUBMITS APPLICATION
        ↓
useApplyJob().mutateAsync()
        ↓
POST /api/applications/apply
        ↓
Success!
        ↓
Auto-Invalidate:
  - applicationStatus(jobId)
  - myApplications
  - allApplications
        ↓
USER NAVIGATES TO "MY APPLICATIONS"
        ↓
[MyApplications] → useMyApplications()
        │                 ↓
        │            Fresh Data Already Loading (from invalidation)
        │                 ↓
        │            Display Applications
        │            (includes just-submitted one!)
        ↓
USER RETURNS TO DASHBOARD
        ↓
[Dashboard] → useActiveJobs()
        ↓
   ✅ Cache Still Fresh (< 3 min)
        ↓
   Instant Display (10ms)
        ↓
   (No API call needed!)
```

## 7. Admin Workflow

```
ADMIN OPENS DASHBOARD
        ↓
useAllJobs() + useAllApplications()
        ↓
2 Parallel API Calls
        ↓
Both Cached Separately
        ↓
Stats Calculated from Cached Data
        ↓
Dashboard Displayed
        ↓
ADMIN CREATES NEW JOB
        ↓
useCreateJob().mutateAsync()
        ↓
POST /api/jobs
        ↓
Success!
        ↓
Auto-Invalidate All Job Caches
        ↓
useAllJobs() Refetches Automatically
        ↓
Dashboard Updates with New Job
        ↓
(No page refresh needed!)
        ↓
ADMIN CLICKS "DELETE JOB"
        ↓
useDeleteJob().mutateAsync(id)
        ↓
DELETE /api/jobs/:id
        ↓
Success!
        ↓
Auto-Invalidate All Job Caches
        ↓
Dashboard Removes Deleted Job
        ↓
(Seamless UX!)
```

## 8. Multiple User Scenario

```
USER 1:                      USER 2:                      CACHE SERVER:
Opens Dashboard              -                            -
   ↓                         -                            -
API Call                     -                            -
   ↓                         -                            -
Cache Stored                 -                            Jobs Data Cached
   ↓                         -                            -
-                           Opens Dashboard               -
-                              ↓                          -
-                           Check Cache                   -
-                              ↓                          -
-                           ✅ FOUND!                     -
-                              ↓                          -
-                           Instant Load (10ms)           -
-                              ↓                          -
-                           (No API call!)                Saved 1 API call
   ↓                         -                            -
Creates Job                  -                            -
   ↓                         -                            -
Cache Invalidated            -                            Jobs Cache Invalidated
   ↓                         -                            -
Dashboard Refreshes          Dashboard Auto-Refreshes     Both See New Job
   ↓                            ↓                         -
Both See New Job             Both See New Job             Data Consistent
```

## 9. Cache State Transitions

```
┌─────────────┐
│   INITIAL   │  Component first mounts
└──────┬──────┘
       ↓
┌─────────────┐
│   LOADING   │  Fetching data from API
└──────┬──────┘
       ↓
┌─────────────┐
│    FRESH    │  Data received, < staleTime
│ (🟢 Green)  │  Served instantly from cache
└──────┬──────┘
       ↓
    (time passes > staleTime)
       ↓
┌─────────────┐
│    STALE    │  Data > staleTime
│ (🟡 Yellow) │  Show old data + refetch in background
└──────┬──────┘
       ↓
    (refetch completes)
       ↓
┌─────────────┐
│    FRESH    │  Back to fresh with new data
│ (🟢 Green)  │
└─────────────┘
```

## 10. Cache Memory Lifecycle

```
Query Executed
        ↓
Data Cached in Memory
        ↓
staleTime: 5 min ────────────────┐
        ↓                         │
Data marked STALE                 │ Data still in memory
        ↓                         │
gcTime: 10 min ───────────────────┘
        ↓
No active observers?
        ↓
    YES → Remove from memory
        ↓
Cache Cleared

    NO → Keep in memory
        ↓
Component still using data
```

## 11. Optimistic Update Flow (Future Enhancement)

```
User Clicks "Like Job"
        ↓
Optimistic Update:
  UI Immediately Shows "Liked" ✅
        ↓
    (User sees instant feedback)
        ↓
Mutation Sent to Server
        ↓
    ┌────────┴────────┐
    │                 │
 SUCCESS           FAILURE
    │                 │
    ↓                 ↓
Keep Change      Rollback to Previous State
    │                 │
    ↓                 ↓
Update Cache     Show Error Message
```

## 12. Network States

```
ONLINE:
  User Opens Page
        ↓
  Check Cache
        ↓
  Serve from Cache (if fresh)
  OR Fetch from API
        ↓
  Display Data

OFFLINE:
  User Opens Page
        ↓
  Check Cache
        ↓
  Serve from Cache
        ↓
  Display Data
        ↓
  Show "Offline" indicator
  
RECONNECT:
  Internet Restored
        ↓
  React Query Detects
        ↓
  Auto-Refetch All Queries
        ↓
  Update UI with Fresh Data
```

## Key Symbols Legend

- ✅ Found in cache
- ❌ Not found in cache
- ⚠️ Stale data
- 🟢 Fresh state
- 🟡 Stale state
- 🔵 Fetching state
- 🔴 Error state
- → Flow direction
- ↓ Next step

---

These diagrams show how React Query manages data flow, caching, and updates automatically, making your app fast and your server happy! 🚀

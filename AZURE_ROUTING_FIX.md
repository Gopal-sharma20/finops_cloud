# Azure Dashboard Routing Fix

## Problem
Azure connections were redirecting to `/dashboard/cfo` instead of `/clouds/azure`

## Root Cause
The onboarding and routing logic only checked for AWS connections and defaulted to role-based dashboards (`/dashboard/{role}`) for other providers.

## Solution

### Files Modified

#### 1. `/app/onboarding/page.tsx`
**Changed:** Redirect logic now checks all cloud providers

**Before:**
```typescript
// Only checked for AWS
if (data.connectedProviders.includes('aws')) {
  router.push('/clouds/aws')
} else {
  const dashboardRoute = `/dashboard/${data.selectedRole}`
  router.push(dashboardRoute)  // ← Azure went here
}
```

**After:**
```typescript
// Check all cloud providers
if (data.connectedProviders.includes('aws')) {
  router.push('/clouds/aws')
} else if (data.connectedProviders.includes('azure')) {
  router.push('/clouds/azure')  // ✅ Fixed
} else if (data.connectedProviders.includes('gcp')) {
  router.push('/clouds/gcp')
} else {
  // Only go to role dashboard if no cloud provider connected
  const dashboardRoute = `/dashboard/${data.selectedRole}`
  router.push(dashboardRoute)
}
```

**Also Added:** Azure and GCP profile storage
```typescript
if (data.connectedProviders.includes('azure') && data.credentials.azure) {
  localStorage.setItem('cloudoptima-azure-profile', 'default')
}

if (data.connectedProviders.includes('gcp') && data.credentials.gcp) {
  localStorage.setItem('cloudoptima-gcp-profile', 'default')
}
```

#### 2. `/app/connect-providers/page.tsx`
**Note:** This page already had correct logic for all providers!

```typescript
if (connectedProviders.includes('aws')) {
  router.push('/clouds/aws')
} else if (connectedProviders.includes('azure')) {
  router.push('/clouds/azure')  // ✅ Already correct
} else if (connectedProviders.includes('gcp')) {
  router.push('/clouds/gcp')
}
```

**Added:** Profile storage for Azure and GCP
```typescript
if (providerId === 'azure') {
  localStorage.setItem('cloudoptima-azure-profile', 'default')
} else if (providerId === 'gcp') {
  localStorage.setItem('cloudoptima-gcp-profile', 'default')
}
```

#### 3. `/app/page.tsx` (Home Page)
**Changed:** Sign In button now checks for connected providers

**Before:**
```typescript
const handleSignIn = () => {
  router.push("/dashboard/cfo") // ← Demo redirect, ignored providers
}
```

**After:**
```typescript
const handleSignIn = () => {
  // Check localStorage for connected providers
  if (typeof window !== 'undefined') {
    const onboardingData = localStorage.getItem('cloudoptima-onboarding')
    if (onboardingData) {
      const data = JSON.parse(onboardingData)
      const connectedProviders = data.connectedProviders || []

      // Redirect to cloud dashboard if connected
      if (connectedProviders.includes('aws')) {
        router.push('/clouds/aws')
        return
      } else if (connectedProviders.includes('azure')) {
        router.push('/clouds/azure')  // ✅ Fixed
        return
      } else if (connectedProviders.includes('gcp')) {
        router.push('/clouds/gcp')
        return
      }
    }
  }

  // No providers connected, go to onboarding
  router.push("/onboarding")
}
```

## Route Mapping

### Correct Routing Now:

| Provider Connected | Route | Dashboard |
|-------------------|-------|-----------|
| AWS | `/clouds/aws` | AWS Cloud Dashboard |
| Azure | `/clouds/azure` | Azure Cloud Dashboard ✅ |
| GCP | `/clouds/gcp` | GCP Cloud Dashboard |
| None | `/dashboard/{role}` | Role-based Dashboard |

## Testing

### Test Scenario 1: Fresh Azure Connection
1. Go to home page: `http://localhost:3000`
2. Click "Get Started"
3. Go through onboarding and select Azure
4. Enter Azure credentials
5. Complete onboarding
6. **Verify:** Redirected to `http://localhost:3000/clouds/azure` ✅

### Test Scenario 2: Azure Connection After Logout
1. From Azure dashboard, click "Logout"
2. Redirected to `/connect-providers`
3. Connect to Azure again
4. Click "Continue to Dashboard"
5. **Verify:** Redirected to `http://localhost:3000/clouds/azure` ✅

### Test Scenario 3: Sign In with Existing Azure Connection
1. Already connected to Azure (localStorage has data)
2. Go to home page: `http://localhost:3000`
3. Click "Sign In" button
4. **Verify:** Redirected to `http://localhost:3000/clouds/azure` ✅

### Test Scenario 4: Multiple Providers
1. Connect to AWS (redirects to `/clouds/aws`)
2. Logout
3. Connect to Azure (redirects to `/clouds/azure`)
4. **Verify:** Each provider goes to correct dashboard ✅

## localStorage Keys

The following keys are now properly set for all providers:

```javascript
// Onboarding data (includes credentials)
'cloudoptima-onboarding' = {
  selectedRole: 'cfo',
  connectedProviders: ['azure'],
  credentials: { azure: {...} }
}

// User role
'cloudoptima-user-role' = 'cfo'

// Provider-specific profiles
'cloudoptima-aws-profile' = 'default'      // AWS only
'cloudoptima-azure-profile' = 'default'    // Azure ✅ NEW
'cloudoptima-gcp-profile' = 'default'      // GCP ✅ NEW
```

## Fixed Routes Summary

All these routes now work correctly:

1. ✅ **Onboarding completion** → Azure redirect fixed
2. ✅ **Connect providers page** → Already worked, now with profile storage
3. ✅ **Home page sign in** → Now checks for connected providers
4. ✅ **Logout flow** → Goes to connect-providers, then back to Azure dashboard

## Result

Azure users will now always be directed to:
**`http://localhost:3000/clouds/azure`**

Not:
~~`http://localhost:3000/dashboard/cfo`~~

🎉 **Azure dashboard routing is now working correctly!**

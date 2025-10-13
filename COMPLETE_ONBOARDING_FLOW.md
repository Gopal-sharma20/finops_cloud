# 🎯 Complete User Onboarding Flow - Design Document

## User Flow Requirements

You want users to:
1. **Visit** http://localhost:3000
2. **See onboarding page** (if not configured)
3. **Enter AWS credentials** via UI form
4. **Select AWS profile/role** from dropdown
5. **View dashboard** with their real AWS data

## 🎨 UI Flow Design

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Landing Page                                   │
│  http://localhost:3000                                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Welcome to CloudOptima FinOps                    │  │
│  │                                                    │  │
│  │  [ Get Started ]  button                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Step 2: AWS Credentials Setup                          │
│  http://localhost:3000/setup                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Configure AWS Access                             │  │
│  │                                                    │  │
│  │  Profile Name:    [default        ]               │  │
│  │  AWS Access Key:  [AKIA...       ]               │  │
│  │  AWS Secret Key:  [********      ]               │  │
│  │  Default Region:  [us-east-1  ▼]                 │  │
│  │                                                    │  │
│  │  [ Test Connection ]  [ Save & Continue ]         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Step 3: Profile Selection                              │
│  http://localhost:3000/select-profile                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Select AWS Profile                               │  │
│  │                                                    │  │
│  │  Available Profiles:                              │  │
│  │  ○ default (us-east-1) - Account: 4280...        │  │
│  │  ○ production (us-west-2) - Account: 1234...     │  │
│  │  ○ development (eu-west-1) - Account: 5678...    │  │
│  │                                                    │  │
│  │  [ + Add Another Profile ]                        │  │
│  │                          [ Continue to Dashboard ]│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Step 4: Dashboard with Real Data                       │
│  http://localhost:3000/clouds/aws                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AWS Cloud Management                             │  │
│  │  Profile: [default ▼]  Account: 428055055471     │  │
│  │                                                    │  │
│  │  Total Cost: $20.71                               │  │
│  │  [Charts, Tables, Real Data]                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Implementation Plan

### Phase 1: Credential Storage

**Options for storing AWS credentials:**

#### Option A: Browser LocalStorage (Simple, Client-side)
```typescript
// Pros: Easy, no backend needed
// Cons: Less secure, credentials in browser
localStorage.setItem('aws_credentials', JSON.stringify({
  accessKey: '...',
  secretKey: '...',
  region: '...'
}));
```

#### Option B: Server-side Encrypted Storage (Recommended)
```typescript
// Pros: More secure, server-managed
// Cons: Requires backend API
// Store encrypted in server memory or database
```

#### Option C: Use MCP Server Profiles (Best)
```typescript
// Pros: Reuses existing MCP server, same as CLI
// Cons: Need to save to server filesystem
// Saves to ~/.aws/credentials on server
```

### Phase 2: Create Onboarding Pages

**Page 1: Setup (`/app/setup/page.tsx`)**
- AWS credentials form
- Test connection button
- Validate credentials
- Save profile

**Page 2: Profile Selection (`/app/select-profile/page.tsx`)**
- List available profiles
- Show account ID for each
- Select active profile
- Store in context/state

**Page 3: Dashboard (`/app/clouds/aws/page.tsx`)**
- Already exists!
- Update to use selected profile
- Add profile switcher dropdown

### Phase 3: State Management

**Use React Context for profile management:**

```typescript
// contexts/ProfileContext.tsx
export const ProfileContext = createContext({
  currentProfile: 'default',
  profiles: [],
  setProfile: (name: string) => {},
  addProfile: (profile: Profile) => {}
});
```

## 📝 Implementation Files Needed

### 1. Profile Storage API

**File:** `/app/api/profiles/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

// Store profiles in server (more secure than client)
const PROFILES_FILE = path.join(process.cwd(), '.profiles.json');

export async function GET() {
  // List available profiles
  try {
    const data = await fs.readFile(PROFILES_FILE, 'utf-8');
    const profiles = JSON.parse(data);
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ profiles: [] });
  }
}

export async function POST(request: NextRequest) {
  // Save new profile
  const body = await request.json();
  // Validate and save
  return NextResponse.json({ success: true });
}
```

### 2. Setup Page

**File:** `/app/setup/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SetupPage() {
  const [profile, setProfile] = useState({
    name: 'default',
    accessKey: '',
    secretKey: '',
    region: 'us-east-1'
  });

  const testConnection = async () => {
    // Test AWS credentials
    const response = await fetch('/api/aws/test-connection', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
    // Show success/error
  };

  const saveAndContinue = async () => {
    // Save profile
    await fetch('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
    // Redirect to profile selection
    window.location.href = '/select-profile';
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">
          Configure AWS Access
        </h1>

        <div className="space-y-4">
          <div>
            <label>Profile Name</label>
            <Input
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>

          <div>
            <label>AWS Access Key ID</label>
            <Input
              value={profile.accessKey}
              onChange={e => setProfile({...profile, accessKey: e.target.value})}
              placeholder="AKIA..."
            />
          </div>

          <div>
            <label>AWS Secret Access Key</label>
            <Input
              type="password"
              value={profile.secretKey}
              onChange={e => setProfile({...profile, secretKey: e.target.value})}
            />
          </div>

          <div>
            <label>Default Region</label>
            <select
              value={profile.region}
              onChange={e => setProfile({...profile, region: e.target.value})}
              className="w-full border p-2 rounded"
            >
              <option>us-east-1</option>
              <option>us-west-2</option>
              <option>eu-west-1</option>
              {/* More regions */}
            </select>
          </div>

          <div className="flex space-x-4">
            <Button onClick={testConnection} variant="outline">
              Test Connection
            </Button>
            <Button onClick={saveAndContinue}>
              Save & Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 3. Profile Selection Page

**File:** `/app/select-profile/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SelectProfilePage() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    // Load profiles
    fetch('/api/profiles')
      .then(r => r.json())
      .then(data => setProfiles(data.profiles));
  }, []);

  const continueToDashboard = () => {
    // Save selected profile to context/localStorage
    localStorage.setItem('currentProfile', selected);
    window.location.href = '/clouds/aws';
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">
          Select AWS Profile
        </h1>

        <div className="space-y-4">
          {profiles.map(profile => (
            <div
              key={profile.name}
              onClick={() => setSelected(profile.name)}
              className={`p-4 border rounded cursor-pointer ${
                selected === profile.name ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="font-bold">{profile.name}</div>
              <div className="text-sm text-gray-500">
                Region: {profile.region} | Account: {profile.accountId}
              </div>
            </div>
          ))}

          <Button onClick={() => window.location.href = '/setup'}>
            + Add Another Profile
          </Button>
        </div>

        <Button
          onClick={continueToDashboard}
          className="w-full mt-6"
          disabled={!selected}
        >
          Continue to Dashboard
        </Button>
      </Card>
    </div>
  );
}
```

### 4. Update Dashboard to Use Selected Profile

**File:** `/app/clouds/aws/page.tsx` (UPDATE)

```typescript
// Add at the top of component
const [currentProfile, setCurrentProfile] = useState(() => {
  // Get from localStorage or context
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentProfile') || 'default';
  }
  return 'default';
});

// Update API calls to use currentProfile
const { data: costData } = useProfileCost(currentProfile, 30);

// Add profile switcher in header
<Select value={currentProfile} onValueChange={setCurrentProfile}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {profiles.map(p => (
      <SelectItem key={p.name} value={p.name}>
        {p.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 🔒 Security Considerations

### Option 1: Client-side (Quick but less secure)
- Store encrypted credentials in localStorage
- Send to API on each request
- Easy to implement
- ⚠️ Credentials accessible in browser

### Option 2: Server-side Session (More secure)
- Store credentials on server
- Use session tokens in browser
- Credentials never leave server
- ✅ More secure

### Option 3: Use MCP Server (Recommended)
- Save profiles to server filesystem
- MCP server reads from ~/.aws/credentials
- Same as AWS CLI approach
- ✅ Most compatible

## 🚀 Quick Implementation (30 minutes)

Would you like me to:

1. **Create the setup page** - Form to enter AWS credentials
2. **Create profile selection page** - Choose from saved profiles
3. **Update dashboard** - Use selected profile
4. **Add profile switcher** - Dropdown in dashboard header

This will give you the exact flow you described:
```
localhost:3000 → Setup AWS → Select Profile → View Dashboard
```

Let me know and I'll implement it!

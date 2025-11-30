# Workspace Data Display - Frontend Implementation Plan

This document provides frontend-specific implementation details for displaying workspace sync data.

---

## Architecture Decision

**Navigation Pattern**: Dedicated Pages (NOT Modals)
- User details: `/users/:id`
- Group details: `/groups/:id`
- App details: `/apps/:id`
- Settings: `/settings`

All detail views use full pages instead of modals for better navigation, bookmarkability, and mobile experience.

---

## Current State Analysis

### Existing Dashboard (`DashboardPage.tsx`)
- Single card showing connection status
- Connect/Disconnect functionality
- Sync trigger button
- No data visualization

### Existing Layout (`DashboardLayout.tsx`)
- Basic sidebar (placeholder navigation)
- Header with user avatar and logout
- Outlet for page content

### Existing Components (`components/ui/`)
- `Card`, `Button`, `Spinner`, `Table`, `Badge`, `EmptyState`, `Input`, `Skeleton`

---

## Component Implementation Guide

### Phase 1: Shared Components

#### 1.1 StatsCard Component
**Path**: `src/components/workspace/StatsCard.tsx`

```typescript
interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}
```

**Loading State (Skeleton)**:
```tsx
{isLoading ? (
  <div className="animate-pulse">
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-12" />
  </div>
) : (
  <>
    <div className="text-2xl font-bold">{disabled ? "--" : value}</div>
    <div className="text-sm text-text-secondary">{label}</div>
  </>
)}
```

**Styling Notes**:
- Use `Card` component as base
- Gray out (`opacity-50`, `cursor-not-allowed`) when `disabled`
- Show `Skeleton` when `isLoading`
- Use theme colors from `theme/colors.ts`

#### 1.2 StatsGrid Component
**Path**: `src/components/workspace/StatsGrid.tsx`

```typescript
interface StatsGridProps {
  stats: WorkspaceStats | null;
  isLoading: boolean;
  isConnected: boolean;
}
```

**Skeleton Pattern**:
```tsx
const StatsGrid = ({ stats, isLoading, isConnected }: StatsGridProps) => {
  const statsItems = [
    { label: "Users", value: stats?.total_users, icon: <Users /> },
    { label: "Groups", value: stats?.total_groups, icon: <Users2 /> },
    { label: "Apps", value: stats?.total_apps, icon: <AppWindow /> },
    { label: "Authorizations", value: stats?.active_authorizations, icon: <Shield /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item) => (
        <StatsCard
          key={item.label}
          label={item.label}
          value={item.value ?? 0}
          icon={item.icon}
          isLoading={isLoading}
          disabled={!isConnected}
        />
      ))}
    </div>
  );
};
```

**Layout**: 4-column responsive grid
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

#### 1.3 WorkspaceTabs Component
**Path**: `src/components/workspace/WorkspaceTabs.tsx`

```typescript
type TabId = "apps" | "users" | "groups";

interface WorkspaceTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  disabled?: boolean;
  counts: {
    apps: number;
    users: number;
    groups: number;
  };
  isLoading?: boolean;
}
```

**Behavior**:
- Tabs are disabled when `disabled=true` (no connection)
- Show count badge next to each tab label (or skeleton when loading)
- Visual disabled state: `opacity-50`, `pointer-events-none`

#### 1.4 ConnectWorkspaceCTA Component
**Path**: `src/components/workspace/ConnectWorkspaceCTA.tsx`

```typescript
interface ConnectWorkspaceCTAProps {
  onConnect: () => void;
  isConnecting: boolean;
  error?: string | null;
}
```

**Error State**:
```tsx
{error && (
  <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
    {error}
  </div>
)}
```

**Content**:
- Icon: `Shield` or `Link2`
- Title: "Connect Your Workspace"
- Description: Brief explanation of benefits
- Button: "Connect Google Workspace"
- Error display below button

---

### Phase 2: List Components

#### 2.0 List Skeleton Component
**Path**: `src/components/workspace/ListItemSkeleton.tsx`

```typescript
interface ListItemSkeletonProps {
  variant: "app" | "user" | "group";
}
```

**Skeleton Patterns by Variant**:
```tsx
// App Skeleton
<div className="flex items-center gap-4 p-4 border-b animate-pulse">
  <Skeleton className="h-10 w-10 rounded" />
  <div className="flex-1">
    <Skeleton className="h-4 w-32 mb-2" />
    <Skeleton className="h-3 w-24" />
  </div>
  <Skeleton className="h-6 w-16 rounded-full" />
  <Skeleton className="h-4 w-8" />
  <Skeleton className="h-4 w-20" />
</div>

// User Skeleton
<div className="flex items-center gap-4 p-4 border-b animate-pulse">
  <Skeleton className="h-10 w-10 rounded-full" />
  <div className="flex-1">
    <Skeleton className="h-4 w-40 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
  <Skeleton className="h-6 w-16 rounded-full" />
  <Skeleton className="h-4 w-8" />
  <Skeleton className="h-6 w-16 rounded-full" />
</div>

// Group Skeleton
<div className="flex items-center gap-4 p-4 border-b animate-pulse">
  <Skeleton className="h-10 w-10 rounded" />
  <div className="flex-1">
    <Skeleton className="h-4 w-40 mb-2" />
    <Skeleton className="h-3 w-56" />
  </div>
  <Skeleton className="h-4 w-12" />
</div>
```

#### 2.1 AppListItem Component
**Path**: `src/components/workspace/AppListItem.tsx`

```typescript
interface AppListItemProps {
  app: DiscoveredAppListItem;
  onClick: (appId: number) => void;
}
```

**Columns**:
| Column | Width | Content |
|--------|-------|---------|
| Name | flex | `display_name` or "Unknown App" |
| Type | 100px | Badge with `client_type` |
| Users | 80px | `authorized_users_count` |
| First Seen | 120px | Formatted date |
| Action | 50px | Chevron icon |

#### 2.2 UserListItem Component
**Path**: `src/components/workspace/UserListItem.tsx`

```typescript
interface UserListItemProps {
  user: WorkspaceUserListItem;
  onClick: (userId: number) => void;
}
```

**Columns**:
| Column | Width | Content |
|--------|-------|---------|
| User | flex | Avatar + name/email |
| Role | 100px | Badge (Admin/User) |
| Apps | 80px | `authorized_apps_count` |
| Status | 100px | Badge with status |
| Action | 50px | Chevron icon |

#### 2.3 GroupListItem Component
**Path**: `src/components/workspace/GroupListItem.tsx`

```typescript
interface GroupListItemProps {
  group: WorkspaceGroupListItem;
  onClick: (groupId: number) => void;
}
```

**Columns**:
| Column | Width | Content |
|--------|-------|---------|
| Name | flex | Group name + email |
| Members | 100px | `direct_members_count` |
| Description | 200px | Truncated description |
| Action | 50px | Chevron icon |

#### 2.4 DataList Component (Wrapper with States)
**Path**: `src/components/workspace/DataList.tsx`

```typescript
interface DataListProps<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  emptyState: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  skeletonCount?: number;
  skeletonVariant: "app" | "user" | "group";
  renderItem: (item: T) => React.ReactNode;
  onRetry?: () => void;
}
```

**State Handling**:
```tsx
const DataList = <T,>({
  items,
  isLoading,
  error,
  emptyState,
  skeletonCount = 5,
  skeletonVariant,
  renderItem,
  onRetry,
}: DataListProps<T>) => {
  // Loading State - Skeleton
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ListItemSkeleton key={i} variant={skeletonVariant} />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12 text-red-400" />}
        title="Failed to load data"
        description={error}
        action={
          onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )
        }
      />
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
      />
    );
  }

  // Data State
  return <div>{items.map(renderItem)}</div>;
};
```

#### 2.5 Pagination Component
**Path**: `src/components/ui/Pagination.tsx`

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
```

**Behavior**:
- Disabled state when `isLoading`
- Shows page numbers with ellipsis for large ranges
- Previous/Next buttons

#### 2.6 SearchInput Component
**Path**: `src/components/ui/SearchInput.tsx`

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
}
```

**Features**:
- Debounced input (default 300ms)
- Clear button when value present
- Loading spinner in input when `isLoading`

---

### Phase 3: Detail Page Components

All detail views use dedicated pages instead of modals for better navigation, bookmarkability, and mobile experience.

#### 3.0 Page Loading & Error States
All detail pages must handle these states consistently:

```typescript
interface PageState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}
```

**Shared Page Skeleton Component**:
**Path**: `src/components/workspace/DetailPageSkeleton.tsx`

```tsx
const DetailPageSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Back button skeleton */}
    <Skeleton className="h-5 w-24" />
    
    {/* Header skeleton */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
    
    {/* Info grid skeleton */}
    <Card padding="lg">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
    
    {/* Table skeleton */}
    <Card padding="lg">
      <Skeleton className="h-5 w-32 mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      ))}
    </Card>
  </div>
);
```

**Page Error State Component**:
**Path**: `src/components/workspace/DetailPageError.tsx`

```tsx
interface DetailPageErrorProps {
  message: string;
  onRetry: () => void;
  backPath: string;
  backLabel: string;
}

const DetailPageError = ({ message, onRetry, backPath, backLabel }: DetailPageErrorProps) => (
  <div className="space-y-6">
    <Link to={backPath} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
      <ArrowLeft className="h-4 w-4" />
      {backLabel}
    </Link>
    
    <Card padding="lg">
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Failed to load details
        </h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </Card>
  </div>
);
```

#### 3.1 AppDetailPage Component
**Path**: `src/pages/workspace/AppDetailPage.tsx`

```typescript
// Uses useParams() to get appId from URL
// URL: /apps/:id
```

**Implementation**:
```tsx
const AppDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appId = id ? parseInt(id, 10) : null;
  
  const [state, setState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: AppDetail | null;
  }>({ isLoading: true, error: null, data: null });

  useEffect(() => {
    if (appId) {
      fetchAppDetail(appId);
    }
  }, [appId]);

  const fetchAppDetail = async (id: number) => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const response = await getDiscoveredAppDetail(id);
      if (response.error) {
        setState({ isLoading: false, error: response.error.message, data: null });
      } else {
        setState({ isLoading: false, error: null, data: response.data });
      }
    } catch (err) {
      setState({ isLoading: false, error: "Failed to load app details", data: null });
    }
  };

  if (state.isLoading) {
    return <DetailPageSkeleton />;
  }

  if (state.error) {
    return (
      <DetailPageError 
        message={state.error} 
        onRetry={() => appId && fetchAppDetail(appId)}
        backPath="/dashboard"
        backLabel="Back to Dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      
      {state.data && <AppDetailContent app={state.data} />}
    </div>
  );
};
```

**Sections**:
1. Back button: Navigate to dashboard
2. Header: App name, client type badge
3. Info Grid: Client ID, Type, First/Last seen, Scopes count
4. Scopes List: Expandable list of all scopes
5. Users Table: List of authorized users with their scopes
6. Empty state if no authorizations: "No users have authorized this app"

#### 3.2 UserDetailPage Component
**Path**: `src/pages/workspace/UserDetailPage.tsx`

```typescript
// Uses useParams() to get userId from URL
// URL: /users/:id
```

**Sections**:
1. Back button: Navigate to dashboard
2. Header: Avatar, name, email, admin badge
3. Info Grid: Status, Org unit path, Total apps
4. Apps Table: List of authorized apps with scopes
5. Empty state if no apps: "This user hasn't authorized any third-party apps"

#### 3.3 GroupDetailPage Component
**Path**: `src/pages/workspace/GroupDetailPage.tsx`

```typescript
// Uses useParams() to get groupId from URL
// URL: /groups/:id
```

**Sections**:
1. Back button: Navigate to dashboard
2. Header: Group name, email, description
3. Stats: Member count by role
4. Members Table: List of members with role badges
5. Empty state if no members: "This group has no members"

---

### Phase 4: Page Implementations

#### 4.1 DashboardPage Refactor
**Path**: `src/pages/dashboard/DashboardPage.tsx`

**State Management**:
```typescript
// Connection state
const [connection, setConnection] = useState<ConnectionInfo | null>(null);
const [connectionLoading, setConnectionLoading] = useState(true);
const [connectionError, setConnectionError] = useState<string | null>(null);

// Stats state
const [stats, setStats] = useState<WorkspaceStats | null>(null);
const [statsLoading, setStatsLoading] = useState(false);
const [statsError, setStatsError] = useState<string | null>(null);

// Tab state
const [activeTab, setActiveTab] = useState<TabId>("apps");

// List state (per tab)
const [listState, setListState] = useState<{
  items: DiscoveredAppListItem[] | WorkspaceUserListItem[] | WorkspaceGroupListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationResponse | null;
}>({ items: [], isLoading: false, error: null, pagination: null });

// Search & pagination
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

// Modal states
const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

// Connect state
const [isConnecting, setIsConnecting] = useState(false);
const [connectError, setConnectError] = useState<string | null>(null);
```

**Empty States by Tab**:
```typescript
const EMPTY_STATES = {
  apps: {
    title: "No apps discovered yet",
    description: "Third-party apps will appear here after your first sync completes.",
    icon: <AppWindow className="h-12 w-12 text-gray-400" />,
  },
  users: {
    title: "No users found",
    description: "Workspace users will appear here after syncing.",
    icon: <Users className="h-12 w-12 text-gray-400" />,
  },
  groups: {
    title: "No groups found",
    description: "Workspace groups will appear here after syncing.",
    icon: <Users2 className="h-12 w-12 text-gray-400" />,
  },
};
```

**Component Structure**:
```tsx
const DashboardPage = () => {
  // ... state and effects

  // Initial connection check error
  if (connectionError) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-red-400" />}
          title="Failed to check connection status"
          description={connectionError}
          action={
            <Button onClick={fetchConnectionStatus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section - Always visible */}
      <StatsGrid 
        stats={stats} 
        isLoading={connectionLoading || statsLoading} 
        isConnected={!!connection} 
      />

      {/* Stats Error Banner */}
      {statsError && (
        <div className="rounded-md bg-yellow-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">Failed to load statistics</span>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchStats}>
            Retry
          </Button>
        </div>
      )}

      {/* Connect CTA or Tabs + Content */}
      {connectionLoading ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-text-secondary">Checking connection status...</p>
          </div>
        </Card>
      ) : !connection ? (
        <ConnectWorkspaceCTA 
          onConnect={handleConnect} 
          isConnecting={isConnecting}
          error={connectError}
        />
      ) : (
        <>
          <WorkspaceTabs 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            counts={{
              apps: stats?.total_apps ?? 0,
              users: stats?.total_users ?? 0,
              groups: stats?.total_groups ?? 0,
            }}
            isLoading={statsLoading}
          />
          
          <Card padding="none">
            <div className="p-4 border-b">
              <SearchInput 
                value={search} 
                onChange={handleSearchChange}
                placeholder={`Search ${activeTab}...`}
                isLoading={listState.isLoading}
              />
            </div>
            
            <DataList
              items={listState.items}
              isLoading={listState.isLoading}
              error={listState.error}
              emptyState={EMPTY_STATES[activeTab]}
              skeletonVariant={activeTab === "apps" ? "app" : activeTab === "users" ? "user" : "group"}
              skeletonCount={5}
              renderItem={(item) => {
                if (activeTab === "apps") {
                  return <AppListItem key={item.id} app={item} onClick={setSelectedAppId} />;
                }
                if (activeTab === "users") {
                  return <UserListItem key={item.id} user={item} onClick={setSelectedUserId} />;
                }
                return <GroupListItem key={item.id} group={item} onClick={setSelectedGroupId} />;
              }}
              onRetry={fetchListData}
            />
            
            {listState.pagination && listState.pagination.total_pages > 1 && (
              <div className="p-4 border-t">
                <Pagination 
                  currentPage={listState.pagination.page} 
                  totalPages={listState.pagination.total_pages} 
                  onPageChange={handlePageChange}
                  isLoading={listState.isLoading}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
```

**Navigation Pattern**:
List items use `useNavigate()` to navigate to detail pages:
```tsx
// In AppListItem.tsx
const navigate = useNavigate();
const handleClick = () => navigate(`/apps/${app.id}`);

// In UserListItem.tsx
const handleClick = () => navigate(`/users/${user.id}`);

// In GroupListItem.tsx
const handleClick = () => navigate(`/groups/${group.id}`);
```

#### 4.2 SettingsPage
**Path**: `src/pages/settings/SettingsPage.tsx`

**State Management**:
```typescript
const [settings, setSettings] = useState<ConnectionSettings | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isSyncing, setIsSyncing] = useState(false);
const [syncError, setSyncError] = useState<string | null>(null);
const [isDisconnecting, setIsDisconnecting] = useState(false);
const [disconnectError, setDisconnectError] = useState<string | null>(null);
const [isConnecting, setIsConnecting] = useState(false);
const [connectError, setConnectError] = useState<string | null>(null);
```

**Component Structure**:
```tsx
const SettingsPage = () => {
  // ... state and effects

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Card padding="lg">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-4 mt-6">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Card padding="lg">
          <EmptyState
            icon={<AlertCircle className="h-12 w-12 text-red-400" />}
            title="Failed to load settings"
            description={error}
            action={
              <Button onClick={fetchSettings} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      
      <Card padding="lg">
        <h2 className="text-lg font-medium mb-6">Workspace Connection</h2>
        
        {settings?.connection ? (
          <>
            <ConnectionStatusInfo connection={settings.connection} />
            
            {/* Sync Error Banner */}
            {syncError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {syncError}
              </div>
            )}
            
            {/* Disconnect Error Banner */}
            {disconnectError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {disconnectError}
              </div>
            )}
            
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={handleSync} 
                isLoading={isSyncing}
                disabled={!settings.can_sync || settings.is_syncing}
              >
                {settings.is_syncing ? "Sync in Progress..." : "Sync Now"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                isLoading={isDisconnecting}
              >
                Disconnect Workspace
              </Button>
            </div>
          </>
        ) : (
          <ConnectWorkspaceCTA 
            onConnect={handleConnect} 
            isConnecting={isConnecting}
            error={connectError}
          />
        )}
      </Card>
    </div>
  );
};
```

---

### Phase 5: Layout Updates

#### 5.1 DashboardLayout Sidebar
**Path**: `src/layouts/DashboardLayout.tsx`

**Navigation Items**:
```typescript
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
];
```

**Sidebar Implementation**:
```tsx
<nav className="p-4 space-y-1">
  {navItems.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-brand-primary/10 text-brand-primary"
            : "text-text-secondary hover:bg-gray-100"
        )
      }
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </NavLink>
  ))}
</nav>
```

---

## Routing Updates

### App.tsx Changes
```typescript
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { UserDetailPage } from "@/pages/workspace/UserDetailPage";
import { GroupDetailPage } from "@/pages/workspace/GroupDetailPage";
import { AppDetailPage } from "@/pages/workspace/AppDetailPage";

// Add to router children (under DashboardLayout)
{ path: "settings", element: <SettingsPage /> },
{ path: "users/:id", element: <UserDetailPage /> },
{ path: "groups/:id", element: <GroupDetailPage /> },
{ path: "apps/:id", element: <AppDetailPage /> },
```

---

## API Layer

### New File: `src/api/workspace.ts`

```typescript
import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  WorkspaceStats,
  WorkspaceUserListItem,
  WorkspaceGroupListItem,
  DiscoveredAppListItem,
  UserDetail,
  GroupDetail,
  AppDetail,
  ConnectionSettings,
} from "@/types/workspace";

interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export const getWorkspaceStats = async () => {
  const response = await apiClient.get<ApiResponse<WorkspaceStats>>("/workspace/stats");
  return response.data;
};

export const getDiscoveredApps = async (params: PaginationParams = {}) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<DiscoveredAppListItem>>>(
    "/workspace/apps",
    { params }
  );
  return response.data;
};

export const getDiscoveredAppDetail = async (appId: number) => {
  const response = await apiClient.get<ApiResponse<AppDetail>>(`/workspace/apps/${appId}`);
  return response.data;
};

export const getWorkspaceUsers = async (params: PaginationParams = {}) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<WorkspaceUserListItem>>>(
    "/workspace/users",
    { params }
  );
  return response.data;
};

export const getWorkspaceUserDetail = async (userId: number) => {
  const response = await apiClient.get<ApiResponse<UserDetail>>(`/workspace/users/${userId}`);
  return response.data;
};

export const getWorkspaceGroups = async (params: PaginationParams = {}) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<WorkspaceGroupListItem>>>(
    "/workspace/groups",
    { params }
  );
  return response.data;
};

export const getWorkspaceGroupDetail = async (groupId: number) => {
  const response = await apiClient.get<ApiResponse<GroupDetail>>(`/workspace/groups/${groupId}`);
  return response.data;
};

export const getConnectionSettings = async () => {
  const response = await apiClient.get<ApiResponse<ConnectionSettings>>("/workspace/settings");
  return response.data;
};

export const disconnectWorkspace = async () => {
  const response = await apiClient.post<ApiResponse<null>>("/workspace/disconnect");
  return response.data;
};
```

---

## Types File

### New File: `src/types/workspace.ts`

```typescript
export interface WorkspaceStats {
  total_users: number;
  total_groups: number;
  total_apps: number;
  active_authorizations: number;
  last_sync_at: string | null;
}

export interface WorkspaceUserListItem {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_delegated_admin: boolean;
  status: string;
  authorized_apps_count: number;
}

export interface WorkspaceGroupListItem {
  id: number;
  email: string;
  name: string;
  description: string | null;
  direct_members_count: number;
}

export interface DiscoveredAppListItem {
  id: number;
  display_name: string | null;
  client_id: string;
  client_type: string | null;
  status: string;
  first_seen_at: string;
  last_seen_at: string;
  scopes_count: number;
  authorized_users_count: number;
}

export interface UserAppAuthorization {
  app_id: number;
  app_name: string | null;
  client_id: string;
  scopes: string[];
  authorized_at: string;
  status: string;
}

export interface UserDetail {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  status: string;
  org_unit_path: string | null;
  authorizations: UserAppAuthorization[];
}

export interface AppAuthorizationUser {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  scopes: string[];
  authorized_at: string;
  status: string;
}

export interface AppDetail {
  id: number;
  display_name: string | null;
  client_id: string;
  client_type: string | null;
  status: string;
  all_scopes: string[];
  first_seen_at: string;
  last_seen_at: string;
  authorizations: AppAuthorizationUser[];
}

export interface GroupMember {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface GroupDetail {
  id: number;
  email: string;
  name: string;
  description: string | null;
  direct_members_count: number;
  members: GroupMember[];
}

export interface ConnectionSettings {
  connection: {
    id: number;
    status: string;
    admin_email: string | null;
    workspace_domain: string | null;
    last_sync_completed_at: string | null;
    last_sync_status: string | null;
  } | null;
  can_sync: boolean;
  is_syncing: boolean;
}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `src/types/workspace.ts`
- [ ] Create `src/api/workspace.ts`
- [ ] Create `src/components/workspace/` directory

### Phase 2: Core Components
- [ ] Build `StatsCard.tsx` (with skeleton + disabled states)
- [ ] Build `StatsGrid.tsx`
- [ ] Build `WorkspaceTabs.tsx` (with disabled + loading states)
- [ ] Build `ConnectWorkspaceCTA.tsx` (with error state)

### Phase 3: List Components
- [ ] Build `ListItemSkeleton.tsx` (app/user/group variants)
- [ ] Build `DataList.tsx` (wrapper with loading/error/empty states)
- [ ] Build `AppListItem.tsx`
- [ ] Build `UserListItem.tsx`
- [ ] Build `GroupListItem.tsx`
- [ ] Build `Pagination.tsx` in `components/ui/`
- [ ] Build `SearchInput.tsx` in `components/ui/` (with debounce + loading)

### Phase 4: Detail Pages
- [ ] Build `DetailPageSkeleton.tsx` in `components/workspace/`
- [ ] Build `DetailPageError.tsx` in `components/workspace/`
- [ ] Build `AppDetailPage.tsx` in `pages/workspace/` (with loading/error/empty states)
- [ ] Build `UserDetailPage.tsx` in `pages/workspace/` (with loading/error/empty states)
- [ ] Build `GroupDetailPage.tsx` in `pages/workspace/` (with loading/error/empty states)

### Phase 5: Pages & Routes
- [ ] Refactor `DashboardPage.tsx` (with comprehensive state handling, navigate to detail pages)
- [ ] Create `SettingsPage.tsx` (with loading/error states)
- [ ] Update `DashboardLayout.tsx` sidebar
- [ ] Update `App.tsx` routes (add /users/:id, /groups/:id, /apps/:id, /settings)

---

## Further Considerations

1. **Loading States**: Use `Skeleton` components for initial page load (perceived performance); use `Spinner` or `isLoading` props for subsequent actions (pagination, search, sync)

2. **Error Handling**: 
   - Show inline error banners with retry buttons for recoverable errors
   - Show `EmptyState` with error icon for full-page failures
   - Always provide a way to retry failed operations

3. **Empty States**: Custom empty states for each context:
   - Apps: "No apps discovered yet" with app icon
   - Users: "No users found" with users icon
   - Groups: "No groups found" with group icon
   - Search results: "No results found for '{query}'"

4. **Responsive Design**: 
   - Detail pages use full width with proper padding
   - Tables become cards on mobile
   - Stats grid: 1 → 2 → 4 columns

5. **Keyboard Navigation**: 
   - Tab navigation through interactive elements
   - List items are focusable and clickable

6. **Accessibility**:
   - All interactive elements have focus states
   - Error messages associated with form fields via `aria-describedby`
   - Loading states announced via `aria-live` regions
   - Skeleton loaders have `aria-busy="true"`

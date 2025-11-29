# Frontend Engineering & Architecture Guidelines

This document defines the coding, design, and architectural principles for the **saas-risk-scanner-frontend**.
All contributors must follow these standards to maintain quality, consistency, and long-term maintainability.

---

# **1. Project Architecture Overview**

This project follows a **feature-based, layered architecture** using React with TypeScript.
Each folder has a strict purpose and **must not** take responsibilities outside its domain.

```
src/
├── api/              # API client and service functions
├── components/       # Reusable UI components
│   └── ui/           # Base UI primitives (Button, Card, Input, etc.)
│   └── auth/         # Auth-specific components
├── config/           # Application configuration
├── constants/        # Static constants and enums
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── layouts/          # Page layout components
├── pages/            # Route page components
├── theme/            # Design system tokens
├── types/            # TypeScript type definitions
└── utils/            # Shared utility functions
```

---

# **2. Layer Responsibilities**

### **`api/` – API Layer**

* Contains the Axios client instance and API service functions.
* Handles HTTP requests, response parsing, and error transformation.
* Must use TypeScript generics for type-safe responses.
* Must not contain UI logic, state management, or business rules.

---

### **`components/` – Component Layer**

* Contains reusable React components.
* **`ui/`**: Base primitives (Button, Card, Input, Modal, Spinner, etc.) — no business logic.
* Feature-specific components go in their own subfolders (e.g., `auth/`, `dashboard/`).
* Must be stateless or use local state only — no global state access directly.
* Accept data and callbacks via props.

---

### **`contexts/` – State Management Layer**

* Contains React Context providers for global state.
* Each context manages a single concern (Auth, Theme, etc.).
* Must export a custom hook for consuming the context.
* Must not contain API calls directly — delegate to API layer.

---

### **`hooks/` – Custom Hooks Layer**

* Contains reusable custom React hooks.
* Encapsulate complex state logic, side effects, or derived state.
* Must follow the `use` prefix naming convention.
* Must be pure and composable.

---

### **`pages/` – Page Layer**

* Contains route-level page components.
* Organized by feature (e.g., `auth/`, `dashboard/`, `settings/`).
* Composes layouts, components, and hooks.
* Handles route-specific data fetching and state.

---

### **`layouts/` – Layout Layer**

* Contains page layout shells (headers, sidebars, footers).
* Uses `<Outlet />` from React Router for nested routes.
* Must not contain business logic.

---

### **`types/` – Type Definitions**

* Contains TypeScript interfaces and types.
* Organized by domain (e.g., `auth.ts`, `api.ts`, `user.ts`).
* Must match backend schema definitions exactly.
* Export types, not values.

---

### **`constants/` – Constants Layer**

* Contains static values, enums, and configuration constants.
* Must remain stable and domain-specific.
* Examples: API endpoints, route paths, error codes.

---

### **`theme/` – Design System Tokens**

* Contains color, typography, spacing, and other design tokens.
* Integrated with Tailwind CSS configuration.
* Must be the single source of truth for design values.

---

### **`utils/` – Utility Functions**

* Contains small, pure helper functions.
* Must be stateless and reusable.
* Not domain-specific.
* Examples: `cn()` for className merging, date formatters.

---

# **3. Design Principles**

### **Single Responsibility Principle**

Each file/component/function must have **one reason to change**.
Small, focused units over large multi-purpose components.

---

### **Strict Separation of Concerns**

* Pages don't contain reusable UI logic
* Components don't make API calls directly
* Contexts don't render UI
* Hooks don't depend on specific components

---

### **Composition Over Inheritance**

* Use component composition patterns.
* Prefer render props or children patterns over inheritance.
* Build complex UI from simple, composable primitives.

---

### **Type Safety Everywhere**

* Every function, component, and hook must include type annotations.
* Use TypeScript generics where appropriate.
* Define explicit return types.
* Avoid `any` — use `unknown` if type is truly unknown.

```typescript
// ✅ Good
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "outline";
  size: "sm" | "md" | "lg";
  onClick: () => void;
  children: React.ReactNode;
}

const Button = ({ variant, size, onClick, children }: ButtonProps) => { ... };

// ❌ Bad
const Button = (props: any) => { ... };
```

---

### **Consistent Naming Conventions**

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SignInPage`, `ProtectedRoute` |
| Hooks | camelCase with `use` prefix | `useAuth`, `useLocalStorage` |
| Utilities | camelCase | `formatDate`, `parseApiError` |
| Types/Interfaces | PascalCase | `UserResponse`, `ApiError` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS`, `ACCESS_TOKEN_KEY` |
| Files | PascalCase for components, camelCase for utilities | `Button.tsx`, `apiClient.ts` |

---

# **4. Implementation Rules**

### **Components (`components/`) must:**

* Be pure and reusable.
* Accept props for all dynamic data.
* Use the `cn()` utility for className merging.
* Follow the existing design system (theme tokens).
* Have explicit TypeScript prop interfaces.

---

### **Pages (`pages/`) must:**

* Compose layouts, components, and hooks.
* Handle route-specific logic only.
* Use contexts for global state access.
* Delegate API calls to the API layer.

---

### **Contexts (`contexts/`) must:**

* Provide a single concern (AuthContext, ThemeContext, etc.).
* Export a custom hook for consumption.
* Handle loading and error states.
* Never render UI directly.

---

### **Hooks (`hooks/`) must:**

* Follow React hooks rules.
* Be pure and composable.
* Return typed values.
* Handle cleanup in `useEffect`.

---

### **API Functions (`api/`) must:**

* Use the shared Axios client instance.
* Return typed `Promise<ApiResponse<T>>`.
* Handle request/response transformation.
* Not throw errors — return error responses via `ApiResponse.error`.

---

### **Types (`types/`) must:**

* Mirror backend schema definitions exactly.
* Use `interface` for object shapes.
* Use `type` for unions and primitives.
* Export only types, not runtime values.

---

# **5. Code Quality Standards**

### **General Rules**

* No long components (> 150 lines) — split into smaller components.
* No large files — split by feature.
* No commented-out code in main branches.
* No global mutable state outside contexts.
* Use meaningful, descriptive names.
* No JSDoc comments — code should be self-explanatory.

---

### **Component Structure**

Follow this order within component files:

```typescript
// 1. Imports (external, then internal, then types)
import { useState } from "react";
import { Button } from "@/components/ui";
import type { UserResponse } from "@/types/auth";

// 2. Type definitions
interface MyComponentProps {
  user: UserResponse;
  onSubmit: () => void;
}

// 3. Component definition
export const MyComponent = ({ user, onSubmit }: MyComponentProps) => {
  // 3a. Hooks
  const [isLoading, setIsLoading] = useState(false);

  // 3b. Derived state / computed values
  const displayName = user.full_name || user.email;

  // 3c. Event handlers
  const handleClick = () => {
    setIsLoading(true);
    onSubmit();
  };

  // 3d. Render
  return (
    <div>
      <span>{displayName}</span>
      <Button onClick={handleClick} isLoading={isLoading}>
        Submit
      </Button>
    </div>
  );
};
```

---

### **Styling**

* Use Tailwind CSS utility classes.
* Use theme tokens via Tailwind config (colors, spacing, typography).
* Use the `cn()` utility for conditional classes.
* Avoid inline styles.
* Avoid CSS modules or styled-components.

```typescript
// ✅ Good
<button className={cn(
  "px-4 py-2 rounded-md font-medium",
  variant === "primary" && "bg-brand-secondary text-white",
  variant === "ghost" && "bg-transparent text-text-primary"
)}>

// ❌ Bad
<button style={{ padding: "16px", backgroundColor: "#0B6E99" }}>
```

---

### **Error Handling**

* Use the `parseApiError()` utility for API errors.
* Display user-friendly error messages.
* Handle loading states in UI.
* Never swallow errors silently.

---

### **State Management**

* Use React Context for global state (auth, theme).
* Use `useState` for local component state.
* Use `useReducer` for complex local state.
* Avoid prop drilling — use Context or composition.

---

# **6. File Organization**

### **Imports Order**

```typescript
// 1. React and external libraries
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";

// 2. Internal modules (api, hooks, contexts)
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/api/auth";

// 3. Components
import { Button, Card, Spinner } from "@/components/ui";

// 4. Types (always last, with `type` keyword)
import type { UserResponse } from "@/types/auth";
```

### **Path Aliases**

Always use the `@/` path alias for imports:

```typescript
// ✅ Good
import { Button } from "@/components/ui";
import type { UserResponse } from "@/types/auth";

// ❌ Bad
import { Button } from "../../../components/ui";
```

---

# **7. What You Must Not Do**

* Do not place business logic in components
* Do not make API calls directly in components (use hooks/contexts)
* Do not mutate props or state directly
* Do not use `any` type
* Do not use `var` — use `const` or `let`
* Do not use class components — use function components
* Do not create "god" components or "mega" files
* Do not use emojis in code or logs
* Do not write unit tests unless explicitly requested
* Do not write helper function's helper function
* Do not create unused files or dead code

---

# **8. API Response Handling**

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  meta: {
    request_id: string;
    timestamp: string;
  };
  data: T | null;
  error: {
    code: string;
    message: string;
    target: string | null;
    details: Array<{
      code: string;
      field: string | null;
      message: string;
    }> | null;
  } | null;
}
```

Always check for `response.data` before using:

```typescript
const response = await getCurrentUser();

if (response.error) {
  // Handle error
  setError(response.error.message);
  return;
}

if (response.data) {
  // Use data
  setUser(response.data);
}
```

---

# Final Note

Consistency is key. When in doubt, look at existing patterns in the codebase and follow them.

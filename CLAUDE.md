# CLAUDE.md

## App Context: HomeCafe

**Application**: HomeCafe - Gamified wellness and productivity app

### Description

HomeCafe is a lifestyle app that helps users structure their daily routine with warmth. Inspired by the cozy café atmosphere, it combines:

**Core Features:**
- **Personal Dashboard**: Overview with progress statistics (goals achieved, percentages, metrics)
- **Calendar & Planning**: Daily tracking with graphical visualization (green/red bars for success/failure)
- **Gamification System**: Badges, rewards, and levels to motivate users
- **Messaging**: Communication between community members
- **Profile & QR Code**: User identification and profile sharing
- **Blog/Articles**: Lifestyle content and tips (coffee, wellness, productivity)
- **Notifications**: Personalized reminders and alerts
- **Settings**: Dark mode, notification preferences, customization

**Visual Theme:**
- Soft palette with pink, beige, and green tones
- Warm illustrations (coffee, plants, cozy elements)
- Rounded and welcoming UI
- Stylized "homecafé" logo

### Design Resources (Figma)

- **Mobile Web**: https://www.figma.com/design/OWDUW6CjzQDvqBTssiwz76/DashBox?node-id=584-13524
- **Desktop Web**: https://www.figma.com/design/OWDUW6CjzQDvqBTssiwz76/DashBox?node-id=584-8655
- **Tablet Web**: https://www.figma.com/design/OWDUW6CjzQDvqBTssiwz76/DashBox?node-id=584-10881

### Development Strategy

1. **Mobile First (Expo)** - Start with native mobile app
2. **Web Later (Next.js)** - Web versions (mobile/tablet/desktop) afterward

## Prerequisites

**Read first:** @packages/ddd-kit/src/ (Result, Option, Entity) • @packages/test/ • @apps/nextjs/src/

## Project Overview

Production-ready monorepo: Clean Architecture + DDD. Optimized for AI development.
Backend server is a RESTful API built with Next.js.

**Stack**: Next.js 15 • Expo • TypeScript • Drizzle • PostgreSQL • BetterAuth • shadcn/ui • Tailwind 4

### Reference Implementation

**Complete auth example** (100% Claude Code): Sign up/in/out, sessions, email verification, protected routes.

Study these files:
- @apps/nextjs/src/domain/user/ - Aggregate, VOs, events
- @apps/nextjs/src/application/use-cases/auth/ - All auth use cases
- @apps/nextjs/src/application/ports/ - IAuthProvider, IUserRepository
- @apps/nextjs/src/adapters/auth/ - BetterAuth service
- @apps/nextjs/src/adapters/guards/ - requireAuth()
- @apps/nextjs/src/pages/ - Pages

## Commands

```bash
pnpm dev          # Dev (runs db:generate)
pnpm build        # Build all
pnpm type-check   # Type check
pnpm fix          # Lint/format
pnpm db           # Start PostgreSQL
pnpm db:push      # Push schema
pnpm test         # Run tests
pnpm ui:add       # Add shadcn component
```

## Architecture (Next.js Backend)

```
Domain (Core)     → Entities, VOs, Aggregates, Events
    ↑
Application       → Use Cases, Ports
    ↑
Adapters          → Controllers, Repositories, Guards
    ↑
Infrastructure    → DB, DI config
```

### Structure

```
apps/nextjs/
├── src/
│   ├── domain/           # Entities, VOs, Events, Errors
│   ├── application/
│   │   ├── use-cases/    # Business logic
│   │   ├── ports/        # Interfaces (IXxxRepository, IXxxProvider)
│   │   └── dto/          # Zod schemas
│   └── adapters/
│       ├── auth/         # Auth provider impl
│       ├── actions/      # Server actions
│       ├── controllers/  # HTTP handlers
│       ├── guards/       # Auth middleware
│       ├── repositories/ # DB impl
│       ├── mappers/      # Domain ↔ DB
│       └── queries/      # CQRS reads with direct DB access
├── common/
│   ├── auth.ts           # BetterAuth config
│   └── di/               # DI container + modules
└── app/api/auth/[...all]/ # BetterAuth route
```

### CQRS

- **Commands**: Controller → Use Case → Domain → Repository
- **Queries**: Controller → Query (direct ORM)

## Core Patterns (ddd-kit)

### Result<T,E>

```typescript
Result.ok(value)              // Success
Result.fail(error)            // Failure
Result.combine([r1, r2, r3])  // First failure or ok()

result.isSuccess / result.isFailure
result.getValue()  // throws if failure
result.getError()  // throws if success
```

### Option<T>

```typescript
Option.some(value)            // Some<T>
Option.none()                 // None<T>
Option.fromNullable(value)    // Some if value, None if null

option.isSome() / option.isNone()
option.unwrap()               // throws if None
option.unwrapOr(default)
option.map(fn) / option.flatMap(fn)
match(option, { Some: v => ..., None: () => ... })
```

### ValueObject<T>

```typescript
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .transform((v) => v.toLowerCase().trim());

export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      return Result.fail(result.error.issues[0]?.message ?? "Invalid email");
    }
    return Result.ok(result.data);
  }
}

const result = Email.create('test@example.com')  // Result<Email>
if (result.isFailure) return Result.fail(result.getError());
result.getValue().value  // 'test@example.com'
```

### Entity & Aggregate

```typescript
export class User extends Aggregate<IUserProps> {
  private constructor(props: IUserProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): UserId {
    return UserId.create(this._id);
  }

  static create(props: ICreateUserProps, id?: UUID<string | number>): Result<User> {
    const newId = id ?? new UUID<string>();
    const user = new User({ ...props, emailVerified: false }, newId);

    if (!id) {
      user.addEvent(new UserCreatedEvent(user.id.value.toString(), props.email.value, props.name.value));
    }
    return Result.ok(user);
  }

  static reconstitute(props: IUserProps, id: UserId): User {
    return new User(props, id);
  }

  verify(): Result<void, DomainError> {
    if (this.get("emailVerified")) {
      return Result.fail(new UserAlreadyVerifiedError());
    }
    this._props.emailVerified = true;
    this.touch();
    this.addEvent(new UserVerifiedEvent(this.id.value.toString()));
    return Result.ok();
  }

  updateName(name: Name): void {
    this._props.name = name;
    this.touch();
  }

  private touch(): void {
    this._props.updatedAt = new Date();
  }
}
```

### BaseRepository<T>

```typescript
interface BaseRepository<T> {
  create(entity, trx?): Promise<Result<T>>
  update(entity, trx?): Promise<Result<T>>
  delete(id, trx?): Promise<Result<id>>
  findById(id): Promise<Result<Option<T>>>
  findAll(pagination?): Promise<Result<PaginatedResult<T>>>
  findMany(props, pagination?): Promise<Result<PaginatedResult<T>>>
  findBy(props): Promise<Result<Option<T>>>
  exists(id): Promise<Result<boolean>>
  count(): Promise<Result<number>>
}

// Pagination
interface PaginationParams { page: number; limit: number }
interface PaginatedResult<T> {
  data: T[];
  pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
}
```

## Error Handling

### Domain Errors

```typescript
// @apps/nextjs/src/domain/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// @apps/nextjs/src/domain/user/errors/user.errors.ts
export class UserAlreadyVerifiedError extends DomainError {
  readonly code = "USER_ALREADY_VERIFIED";
  constructor() {
    super("User is already verified");
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
  constructor() {
    super("User not found");
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";
  constructor() {
    super("Invalid email or password");
  }
}
```

### Usage in Controllers

```typescript
if (result.isFailure) {
  const error = result.getError();

  const statusMap: Record<string, number> = {
    USER_NOT_FOUND: 404,
    USER_ALREADY_VERIFIED: 409,
    INVALID_CREDENTIALS: 401,
  };

  const status = error instanceof DomainError ? (statusMap[error.code] ?? 400) : 500;
  return NextResponse.json({ error: error.message, code: error.code }, { status });
}
```

## Testing (BDD)

Test behaviors via Use Cases, not units.

### Test Setup

```typescript
// @apps/nextjs/src/test/setup.ts
import { Container } from "@packages/di";
import { DI_SYMBOLS } from "@/common/di/symbols";

export function createTestContainer() {
  const container = new Container();
  container.bind(DI_SYMBOLS.IUserRepository).toConstant(createMockUserRepository());
  container.bind(DI_SYMBOLS.IAuthProvider).toConstant(createMockAuthProvider());
  container.bind(DI_SYMBOLS.IEventBus).toConstant(createMockEventBus());
  return container;
}

export function createMockUserRepository(): IUserRepository {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    exists: vi.fn(),
    count: vi.fn(),
  };
}
```

### Use Case Test Example

```typescript
describe("SignInUseCase", () => {
  let useCase: SignInUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = createMockUserRepository();
    mockAuthProvider = createMockAuthProvider();
    useCase = new SignInUseCase(mockUserRepo, mockAuthProvider);
  });

  it("should sign in user when credentials are valid", async () => {
    const user = UserMother.verified();
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(user)));
    mockAuthProvider.signIn.mockResolvedValue(Result.ok({ user, token: "jwt-token" }));

    const result = await useCase.execute({
      email: "test@example.com",
      password: "ValidPass123!",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().token).toBe("jwt-token");
  });

  it("should fail when user not found", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));

    const result = await useCase.execute({
      email: "unknown@example.com",
      password: "ValidPass123!",
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(UserNotFoundError);
  });
});
```

### Test Mothers (Fixtures)

```typescript
// @apps/nextjs/src/test/mothers/user.mother.ts
export class UserMother {
  static default(): User {
    return User.create({
      email: Email.create("test@example.com").getValue(),
      name: Name.create("Test User").getValue(),
      image: Option.none(),
    }).getValue();
  }

  static verified(): User {
    const user = this.default();
    user.verify();
    return user;
  }

  static withEmail(email: string): User {
    return User.create({
      email: Email.create(email).getValue(),
      name: Name.create("Test User").getValue(),
      image: Option.none(),
    }).getValue();
  }
}
```

### Testing Rules

- One test file per Use Case
- Mock at repository/port level
- Test all Result/Option states
- Name tests as behaviors ("should X when Y")
- Use Test Mothers for fixtures

## Use Cases

```typescript
export class SignInUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    const emailResult = Email.create(input.email);
    const passwordResult = Password.create(input.password);
    const combined = Result.combine([emailResult, passwordResult]);
    if (combined.isFailure) return Result.fail(combined.getError());

    const userResult = await this.findUser(emailResult.getValue());
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const authResult = await this.authProvider.signIn(
      userResult.getValue(),
      passwordResult.getValue(),
    );
    if (authResult.isFailure) return Result.fail(authResult.getError());

    return Result.ok(this.toDto(authResult.getValue()));
  }

  private async findUser(email: Email): Promise<Result<User>> {
    const result = await this.userRepo.findByEmail(email.value);
    if (result.isFailure) return Result.fail(result.getError());

    return match<User, Result<User>>(result.getValue(), {
      Some: (user) => Result.ok(user),
      None: () => Result.fail(new UserNotFoundError()),
    });
  }
}
```

## DTOs

```typescript
// common.dto.ts
export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
});

// sign-in.dto.ts
export const signInInputDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const signInOutputDtoSchema = z.object({
  user: userDtoSchema,
  token: z.string(),
});
```

## Ports

```typescript
export interface IAuthProvider {
  signUp(user: User, password: Password): Promise<Result<AuthResponse>>;
  signIn(user: User, password: Password, rememberMe?: boolean): Promise<Result<AuthResponse>>;
  signOut(headers: Headers): Promise<Result<void>>;
  getSession(headers: Headers): Promise<Result<Option<AuthSession>>>;
  verifyEmail(userId: string): Promise<Result<void>>;
}
```

## DI

```typescript
export const createAuthModule = () => {
  const authModule = createModule();

  authModule.bind(DI_SYMBOLS.IUserRepository).toClass(DrizzleUserRepository);
  authModule.bind(DI_SYMBOLS.IAuthProvider).toClass(BetterAuthService);
  authModule.bind(DI_SYMBOLS.SignInUseCase).toClass(SignInUseCase, [
    DI_SYMBOLS.IUserRepository,
    DI_SYMBOLS.IAuthProvider,
  ]);

  return authModule;
};

// Usage
const useCase = getInjection("SignInUseCase");
```

## Guards

```typescript
export async function requireAuth(redirectTo = "/login"): Promise<IGetSessionOutputDto> {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    redirect(redirectTo);
  }

  return guardResult.session;
}
```

## Expo (Mobile Client)

Expo = pure API client. No domain logic, just UI + API calls to Next.js backend.

### Structure

```
apps/expo/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/             # Public routes (login, register)
│   ├── (protected)/        # Authenticated routes
│   └── _layout.tsx         # Root layout + auth provider
├── components/
│   └── ui/                 # NativeWind components (Button, Input, Card...)
├── lib/
│   ├── api/                # API client + hooks
│   │   ├── client.ts       # Fetch wrapper with auth
│   │   └── hooks/          # React Query hooks (useAuth, useUser...)
│   ├── auth/               # Auth context + SecureStore
│   └── utils.ts            # cn(), helpers
└── constants/              # Colors, config
```

### API Client

```typescript
// @apps/expo/lib/api/client.ts
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiClient {
  private async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync("auth_token");
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, error.code, response.status);
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.fetch<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  }
}

export const api = new ApiClient();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
```

### Auth Context

```typescript
// @apps/expo/lib/auth/auth-context.tsx
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        const data = await api.get<{ user: User }>("/api/auth/session");
        setUser(data.user);
      }
    } catch {
      await SecureStore.deleteItemAsync("auth_token");
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const data = await api.post<{ user: User; token: string }>("/api/auth/sign-in", { email, password });
    await SecureStore.setItemAsync("auth_token", data.token);
    setUser(data.user);
  }

  async function signOut() {
    await api.post("/api/auth/sign-out", {});
    await SecureStore.deleteItemAsync("auth_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

### Protected Routes

```typescript
// @apps/expo/app/(protected)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  return <Stack />;
}
```

### React Query Hooks

```typescript
// @apps/expo/lib/api/hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.get(`/api/users/${userId}`),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => api.put("/api/users/profile", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}
```

### UI Components (NativeWind)

```typescript
// @apps/expo/components/ui/button.tsx
import { Pressable, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border-2 border-border bg-transparent",
        ghost: "bg-transparent",
      },
      size: {
        default: "h-14 px-6",
        sm: "h-11 px-4",
        lg: "h-16 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ children, variant, size, onPress, disabled, className }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), disabled && "opacity-50", className)}
    >
      <Text className="font-semibold text-base text-primary-foreground">{children}</Text>
    </Pressable>
  );
}
```

### Expo Rules

- **No domain logic** — Expo is a pure UI client
- **API calls only** — All business logic lives in Next.js
- **SecureStore for tokens** — Never AsyncStorage for sensitive data
- **NativeWind for styling** — Tailwind syntax, native performance
- **Expo Router** — File-based routing like Next.js
- **React Query** — Server state management
- **Match web design** — Follow Figma mockups, adapt for native UX

## Page Structure (Next.js)

Pages = orchestration only. Logic in `_components/`.

```
app/(auth)/login/
├── page.tsx              # Composes LoginForm
└── _components/
    └── login-form.tsx    # Client component with logic
```

**Rules**: Pages compose • Logic in _components • Server by default • Guards in layouts

## UI (Next.js)

**shadcn/ui first**: `pnpm ui:add button form input`

## Monorepo

- `apps/nextjs/` - Web + API (backend)
- `apps/expo/` - Mobile (client only)
- `packages/ddd-kit/` - DDD primitives
- `packages/drizzle/` - DB schema
- `packages/ui/` - Web components

## Key Rules

1. **Domain = zero external imports** (only ddd-kit + Zod)
2. **Never throw** in Domain/Application → use Result<T>
3. **Never null** → use Option<T>
4. **VOs use Zod** for validation
5. **Transactions** managed in controllers, passed to use cases
6. **All deps injected** via DI
7. **No index.ts barrels** → import directly
8. **No comments** → self-documenting code
9. **Expo = client only** → no domain logic, API calls to Next.js

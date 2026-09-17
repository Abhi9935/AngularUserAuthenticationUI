# Angular Authentication Frontend

## Complete Structure, responsibilities, Architecture, Flows, and concepts

---

# 1. Project Overview

The Angular application is the frontend for an existing .NET Core Web API.

The Angular frontend provides:

- Registration screen
- Login screen
- Dashboard
- Authentication state management
- Access token management
- Refresh token management
- Automatic access-token refresh
- Concurrent 401 handling
- Logout
- Logout from all devices
- Protected routes
  
The backend provides:

- User Registration
- User Login
- JWT Access Token
- Refresh Token
- Refresh Token Rotation
- Refresh Token Replay Detection
- Logout
- Logout All Devices
- User APIs protected by JWT Authentication

---

# 2. Authentication Architecture

Both the Access Token and Refresh Token were stored in browser `sessionStorage`.

```text
Browser
│
└── sessionStorage
    │
    ├── Access Token
    │
    └── Refresh Token
```

The overall authentication architecture:

```


                    Angular Application
                           |
                           v
                    Angular Components
                           |
                           v
                     AuthService
                           |
                           v
                       HttpClient
                           |
                           v
                   AuthInterceptor
                           |
                           v
                    .NET Core API


```

Token management:

```
                    Token Management
                           |
             +-------------+-------------+
             |                           |
             v                           v
       Access Token               Refresh Token
             |                           |
             +-------------+-------------+
                           |
                           v
                    sessionStorage
```

---

# 3. Complete Project Structure

```text
src/
│
├── app/
│   │
│   ├── components/
│   │   │
│   │   ├── login/
│   │   │   ├── login.ts
│   │   │   ├── login.html
│   │   │   └── login.css
│   │   │
│   │   ├── register/
│   │   │   ├── register.ts
│   │   │   ├── register.html
│   │   │   └── register.css
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.ts
│   │       ├── dashboard.html
│   │       └── dashboard.css
│   │
│   ├── services/
│   │   │
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── token-refresh.service.ts
│   │   └── auth-state.service.ts
│   │
│   ├── guards/
│   │   │
│   │   └── auth.guard.ts
│   │
│   ├── interceptors/
│   │   │
│   │   └── auth.interceptor.ts
│   │
│   ├── models/
│   │   │
│   │   ├── login-request.ts
│   │   ├── login-response.ts
│   │   ├── register-request.ts
│   │   ├── refresh-token-request.ts
│   │   ├── refresh-token-response.ts
│   │   └── logout-request.ts
│   │
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
│
├── index.html
├── main.ts
└── styles.css
```

---

# 4. Folder Responsibilities

```text
app/
│
├── components/
│   └── User Interface
│
├── services/
│   └── Business and authentication logic
│
├── guards/
│   └── Route protection
│
├── interceptors/
│   └── HTTP authentication processing
│
├── models/
│   └── API request/response definitions
│
├── app.routes.ts
│   └── Application routing
│
└── app.config.ts
    └── Global Angular configuration
```

---

# 5. Components

The component layer is responsible mainly for the user interface.

```text
components/
│
├── Login
├── Register
└── Dashboard
```

## Login Component

Responsibilities:

- Display login form
- Collect username/email and password
- Send login request through AuthService
- Handle successful login
- Update authentication state
- Navigate to dashboard
- Display login errors

The Login Component should not contain:

- JWT implementation
- Refresh-token logic
- Token-refresh coordination
- Direct token-storage implementation

---

## Register Component

Responsibilities:

- Display registration form
- Collect user information
- Send registration request
- Display validation/API errors
- Display successful registration message
- Navigate to login

---

## Dashboard Component

Responsibilities:

- Display authenticated user interface
- Provide application functionality
- Provide Logout option
- Provide Logout All Devices option

The Dashboard should not directly manage token internals.

---

# 6. Services Layer

The services layer contains authentication and token-related application logic.

```text
services/
│
├── AuthService
├── TokenService
├── TokenRefreshService
└── AuthStateService
```

Each service has a separate responsibility.

---

# 7. AuthService

## Responsibility

AuthService acts as the main communication layer between Angular and authentication APIs.

```text
Component
    |
    v
AuthService
    |
    v
HTTP
    |
    v
.NET Core Authentication API
```

Main responsibilities:

```text
AuthService
│
├── Registration
├── Login
├── Refresh Token
├── Logout
└── Logout All Devices
```

It hides the backend API communication details from components.

---

# 8. TokenService

## Responsibility

TokenService manages browser token storage.

```text
TokenService
│
├── Access Token
└── Refresh Token
```

Both tokens are stored in:

```text
sessionStorage
```

Storage structure:

```text
sessionStorage
│
├── access_token
└── refresh_token
```

The rest of the application does not need to directly access browser storage.

Instead:

```text
Component / Service
        |
        v
TokenService
        |
        v
sessionStorage
```

This creates a centralized token-storage mechanism.

---

# 9. AuthStateService

## Responsibility

AuthStateService maintains the current authentication state of the Angular application.

Conceptually:

```text
Authentication State

        |
        +---- Authenticated
        |
        +---- Not Authenticated
```

The service allows different parts of the Angular application to know whether the current user is authenticated.

Example conceptual flow:

```text
Login successful
       |
       v
Authentication State
       |
       v
Authenticated
```

Logout:

```text
Logout
   |
   v
Authentication State
   |
   v
Not Authenticated
```

This state can be consumed by:

- Navbar
- Components
- Guards
- Authentication-related UI

---

# 10. TokenRefreshService

## Responsibility

TokenRefreshService handles automatic Access Token renewal.

Its main purpose is:

```text
Expired Access Token
        |
        v
Get Refresh Token
        |
        v
Refresh API
        |
        v
New Access Token
```

It also handles concurrent refresh requests.

This is important because multiple API requests can expire at approximately the same time.

---

# 11. Single-Flight Refresh

Suppose several API requests return 401 simultaneously.

```text
Request A → 401
Request B → 401
Request C → 401
Request D → 401
```

A poor architecture could produce:

```text
Request A → Refresh API
Request B → Refresh API
Request C → Refresh API
Request D → Refresh API
```

The application instead uses a single refresh operation:

```text
Request A → 401 ─┐
Request B → 401 ─┤
Request C → 401 ─┼──> ONE Refresh Request
Request D → 401 ─┘
                       |
                       v
                New Access Token
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Request A    Request B    Request C/D
```

This architecture is called:

```text
Single-Flight Token Refresh
```

---

# 12. AuthInterceptor

## Responsibility

The AuthInterceptor sits between Angular's HttpClient and the backend API.

```text
Angular
   |
   v
HttpClient
   |
   v
AuthInterceptor
   |
   v
.NET Core API
```

Its main responsibilities are:

- Read the Access Token
- Add the Authorization header
- Detect HTTP 401 responses
- Start token refresh when required
- Retry the failed request
- Prevent repeated retry loops
- Clear authentication state when refresh fails

---

# 13. Normal Authenticated Request

Normal request flow:

```text
Angular Component
        |
        v
HttpClient
        |
        v
AuthInterceptor
        |
        v
Get Access Token
        |
        v
Add Authorization Header
        |
        v
.NET Core API
        |
        v
Successful Response
```

Conceptually:

```text
Authorization: Bearer <AccessToken>
```

The Access Token is used for normal API authentication.

---

# 14. Access Token Expiration Flow

When the Access Token expires:

```text
Angular
   |
   v
API Request
   |
   v
AuthInterceptor
   |
   v
.NET Core API
   |
   v
401 Unauthorized
```

The interceptor detects the 401.

Then:

```text
401
 |
 v
AuthInterceptor
 |
 v
TokenRefreshService
 |
 v
Get Refresh Token
 |
 v
Refresh API
 |
 v
New Access Token
 +
New Refresh Token
 |
 v
Update Token Storage
 |
 v
Retry Original Request
 |
 v
.NET Core API
 |
 v
Success
```

---

# 15. Why the Retry Flag Exists

A failed request should not continuously retry.

Without retry protection:

```text
Request
   |
   v
401
   |
   v
Refresh
   |
   v
Retry
   |
   v
401
   |
   v
Refresh
   |
   v
Retry
   |
   v
401
   |
   v
...
```

This can result in an infinite authentication loop.

The architecture therefore keeps track of whether the request has already been retried.

Conceptually:

```text
First 401
   |
   v
Refresh
   |
   v
Retry
   |
   v
Second 401
   |
   v
Stop
   |
   v
Logout / Authentication Failure
```

---

# 16. AuthGuard

## Responsibility

AuthGuard protects Angular routes from unauthenticated navigation.

Example:

```text
/dashboard
```

The route is protected.

Flow:

```text
User
 |
 v
/dashboard
 |
 v
AuthGuard
 |
 +---- Authenticated ----> Dashboard
 |
 +---- Not Authenticated -> Login
```

The AuthGuard uses the application's authentication state.

---

# 17. Important Security Principle

AuthGuard is a frontend navigation mechanism.

It is NOT the actual security boundary.

The backend must still protect secured APIs using server-side authentication and authorization.

```text
Angular AuthGuard
       |
       v
Frontend Navigation Protection


.NET Core Authentication
       |
       v
Actual API Security
```

A user can modify or bypass frontend JavaScript, but they should still be unable to access protected backend APIs without valid authorization.

---

# 18. Models Layer

The models folder contains the contracts between Angular and the backend API.

```text
models/
│
├── LoginRequest
├── LoginResponse
├── RegisterRequest
├── RefreshTokenRequest
├── RefreshTokenResponse
└── LogoutRequest
```

These represent:

```text
Angular
   |
   | Request / Response Models
   v
.NET Core API
```

---

# 19. LoginRequest

Represents the information Angular sends to the login API.

Conceptually:

```text
LoginRequest
│
├── User Email
└── Password
```

---

# 20. LoginResponse

The login response contains:

```text
LoginResponse
│
├── Access Token
├── Refresh Token
└── Expiration Information
```

Conceptually:

```text
Login API
    |
    v
Access Token
+
Refresh Token
+
Expiration
```

---

# 21. RefreshTokenRequest

Angular sends the Refresh Token in the refresh API request.

Conceptually:

```text
Angular
   |
   v
RefreshTokenRequest
   |
   v
Refresh Token
   |
   v
.NET Core Refresh API
```

The Refresh Token is therefore explicitly available to Angular.

---

# 22. RefreshTokenResponse

The refresh API returns:

```text
RefreshTokenResponse
│
├── New Access Token
├── New Refresh Token
└── Expiration Information
```

The Angular application receives both newly issued tokens.

---

# 23. LogoutRequest

Angular sends the Refresh Token when requesting logout.

Conceptually:

```text
Angular
   |
   v
LogoutRequest
   |
   v
Refresh Token
   |
   v
Logout API
```

The backend then revokes the refresh token.

---

# 24. Routing Architecture

The application has three major routes:

```text
/login
/register
/dashboard
```

Conceptually:

```text
Application
│
├── /login
│   └── Login Component
│
├── /register
│   └── Register Component
│
└── /dashboard
    └── AuthGuard
        └── Dashboard Component
```

The dashboard requires authentication.

---

# 25. Application Configuration

Global Angular configuration is responsible for registering:

```text
Router
HTTP Client
HTTP Interceptor
```

Conceptually:

```text
Application Configuration
│
├── Router
│
├── HttpClient
│
└── AuthInterceptor
```

The interceptor is therefore available to HTTP requests throughout the application.

---

# 26. Complete Login Architecture

The complete login process:

```text
                    User
                      |
                      v
                Login Screen
                      |
                      v
                 AuthService
                      |
                      v
                 Login API
                      |
                      v
              .NET Core Backend
                      |
                      v
             Validate Credentials
                      |
             +--------+--------+
             |                 |
           Failed            Success
             |                 |
             v                 v
          Error        Generate Tokens
                               |
                  +------------+------------+
                  |                         |
                  v                         v
             Access Token             Refresh Token
                  |                         |
                  +------------+------------+
                               |
                               v
                         Angular App
                               |
                               v
                         TokenService
                               |
                               v
                        sessionStorage
```

---

# 27. Token Storage After Login

After successful authentication:

```text
Browser
│
└── sessionStorage
    │
    ├── access_token
    │
    └── refresh_token
```

Both tokens are therefore accessible to application JavaScript.

---

# 28. Normal API Architecture

After login, when the user accesses a protected API:

```text
Dashboard
    |
    v
HttpClient
    |
    v
AuthInterceptor
    |
    v
TokenService
    |
    v
Access Token
    |
    v
Authorization Header
    |
    v
.NET Core API
```

The backend validates the Access Token.

---

# 29. Complete Expired-Token Architecture

```text
                         Angular
                            |
                            v
                      API Request
                            |
                            v
                    AuthInterceptor
                            |
                            v
                     Access Token
                            |
                            v
                       .NET API
                            |
                            v
                         401
                            |
                            v
                    AuthInterceptor
                            |
                            v
                 TokenRefreshService
                            |
                            v
                 TokenService
                            |
                            v
                   Refresh Token
                            |
                            v
                  Refresh Token API
                            |
                            v
                    .NET Core API
                            |
                            v
                 Validate Refresh Token
                            |
                            v
                  Rotate Refresh Token
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          New Access Token      New Refresh Token
                 |                     |
                 +----------+----------+
                            |
                            v
                     TokenService
                            |
                            v
                    sessionStorage
                            |
                            v
                  Retry Original Request
                            |
                            v
                         Success
```

---

# 30. Refresh Token Rotation

The backend rotates refresh tokens.

Example:

```text
Initial Refresh Token
        |
        v
      RT-001
        |
        v
     Refresh
        |
        +---- RT-001 becomes invalid
        |
        +---- New RT-002 issued
```

Angular updates its stored refresh token:

```text
Old:
RT-001

New:
RT-002
```

Next refresh:

```text
RT-002
   |
   v
Refresh
   |
   +---- RT-002 becomes invalid
   |
   +---- RT-003 issued
```

This provides refresh-token rotation.

---

# 31. Refresh Token Replay Detection

If an already-used refresh token is submitted again:

```text
RT-001
   |
   v
Already Used / Revoked
   |
   v
Replay Detection
   |
   v
Backend Rejects Request
```

The Angular application then treats the authentication session as invalid.

Conceptually:

```text
Refresh Failure
      |
      v
Clear Tokens
      |
      v
Set Authentication State
to Not Authenticated
      |
      v
Login
```

---

# 32. Concurrent 401 Architecture

Suppose four requests fail at the same time:

```text
Request A → 401
Request B → 401
Request C → 401
Request D → 401
```

Instead of four refresh calls:

```text
Request A ─┐
Request B ─┤
Request C ─┼──> TokenRefreshService
Request D ─┘           |
                       v
                ONE Refresh Request
                       |
                       v
                New Access Token
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Request A    Request B    Request C/D
          |            |            |
          +------------+------------+
                       |
                       v
                  Continue
```

This prevents unnecessary refresh calls and reduces problems caused by refresh-token rotation.

---

# 33. Logout Architecture

LogOut:

```text
User
 |
 v
Dashboard
 |
 v
Logout
 |
 v
AuthService
 |
 v
Get Refresh Token
 |
 v
Logout API
 |
 v
Backend Revokes Refresh Token
 |
 v
Clear Access Token
 |
 v
Clear Refresh Token
 |
 v
Authentication State = Logged Out
 |
 v
Navigate to Login
```

---

# 34. Logout All Devices Architecture

```text
User
 |
 v
Dashboard
 |
 v
Logout All Devices
 |
 v
AuthService
 |
 v
Logout All Devices API
 |
 v
.NET Core Backend
 |
 v
Revoke All User Refresh Tokens
 |
 v
Angular Cleanup
 |
 +---- Clear Access Token
 |
 +---- Clear Refresh Token
 |
 +---- Authentication State = Logged Out
 |
 v
Login
```

---

# 35. Common Logout Cleanup

Both logout operations eventually perform the same local cleanup.

```text
Logout
   |
   +----------------------+
   |                      |
   v                      v
Logout Current       Logout All Devices
   |                      |
   +----------+-----------+
              |
              v
       Common Cleanup
              |
       +------+------+
       |             |
       v             v
Clear Tokens    Set Logged Out
       |             |
       +------+------+
              |
              v
          Login Page
```

This avoids duplicating authentication cleanup logic.

---

# 36. Complete Responsibility Map

```text
┌────────────────────────┬──────────────────────────────────┐
│ Layer / Component      │ Responsibility                   │
├────────────────────────┼──────────────────────────────────┤
│ Login Component        │ Login UI                         │
│ Register Component     │ Registration UI                  │
│ Dashboard Component    │ Protected UI                     │
├────────────────────────┼──────────────────────────────────┤
│ AuthService            │ Authentication API communication │
│ TokenService           │ Token storage                    │
│ TokenRefreshService    │ Token refresh and coordination   │
│ AuthStateService       │ Authentication state             │
├────────────────────────┼──────────────────────────────────┤
│ AuthInterceptor        │ Token attachment + 401 handling │
│ AuthGuard              │ Frontend route protection        │
├────────────────────────┼──────────────────────────────────┤
│ Models                 │ API request/response contracts   │
├────────────────────────┼──────────────────────────────────┤
│ Routing                │ Application navigation           │
└────────────────────────┴──────────────────────────────────┘
```

---

# 37. Complete Angular Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                  ANGULAR APPLICATION                    │
│                                                         │
│  ┌───────────────┐       ┌────────────────┐             │
│  │ Login         │       │ Register       │             │
│  │ Component     │       │ Component      │             │
│  └───────┬───────┘       └───────┬────────┘             │
│          │                       │                      │
│          └───────────┬───────────┘                      │
│                      v                                  │
│               ┌──────────────┐                          │
│               │ AuthService  │                          │
│               └──────┬───────┘                          │
│                      │                                  │
│                      v                                  │
│                  HttpClient                             │
│                      │                                  │
│                      v                                  │
│               AuthInterceptor                          │
│                      │                                  │
│                      v                                  │
│               .NET Core API                             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Authentication Services              │  │
│  │                                                   │  │
│  │  TokenService                                     │  │
│  │       │                                           │  │
│  │       v                                           │  │
│  │  sessionStorage                                   │  │
│  │       │                                           │  │
│  │   ┌───┴─────────────┐                             │  │
│  │   │                 │                             │  │
│  │   v                 v                             │  │
│  │ Access Token   Refresh Token                      │  │
│  │                                                   │  │
│  │  AuthStateService                                │  │
│  │                                                   │  │
│  │  TokenRefreshService                             │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────┐                              │
│  │ AuthGuard             │                              │
│  │                       │                              │
│  │ Protects Routes       │                              │
│  └───────────────────────┘                              │
│                                                         │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ HTTP
                           v
┌─────────────────────────────────────────────────────────┐
│                  .NET CORE WEB API                      │
│                                                         │
│  Authentication APIs                                    │
│                                                         │
│  ├── Register                                            │
│  ├── Login                                               │
│  ├── Refresh Token                                       │
│  ├── Logout                                              │
│  └── Logout All Devices                                  │
│                                                         │
│  Security                                                │
│                                                         │
│  ├── JWT Access Token                                    │
│  ├── Refresh Token                                       │
│  ├── Refresh Token Rotation                              │
│  ├── Replay Detection                                   │
│  └── Token Revocation                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 38. Complete Token Lifecycle

## Step 1 — Login

```text
User
 |
 v
Login API
 |
 v
Access Token + Refresh Token
 |
 v
sessionStorage
```

---

## Step 2 — Normal API Request

```text
Access Token
 |
 v
Authorization Header
 |
 v
.NET Core API
 |
 v
Success
```

---

## Step 3 — Access Token Expires

```text
API
 |
 v
401 Unauthorized
 |
 v
AuthInterceptor
 |
 v
TokenRefreshService
 |
 v
Refresh Token
 |
 v
Refresh API
```

---

## Step 4 — Refresh Token Rotation

```text
Old Refresh Token
 |
 v
Validate
 |
 v
Revoke Old Token
 |
 v
Generate New Refresh Token
 |
 v
Generate New Access Token
```

---

## Step 5 — Store New Tokens

```text
New Access Token
       +
New Refresh Token
       |
       v
TokenService
       |
       v
sessionStorage
```

---

## Step 6 — Retry Original Request

```text
New Access Token
 |
 v
Authorization Header
 |
 v
Original Request
 |
 v
.NET Core API
 |
 v
Success
```

---

## Step 7 — Logout

```text
Refresh Token
 |
 v
Logout API
 |
 v
Revoke Refresh Token
 |
 v
Clear Local Tokens
 |
 v
Authentication State = Logged Out
 |
 v
Login Page
```

---

# 39. Security Model

The browser storage architecture was:

```text
Browser
│
└── sessionStorage
    │
    ├── Access Token
    │
    └── Refresh Token
```

Both tokens were available to application JavaScript.

Conceptually:

```text
JavaScript
     |
     v
sessionStorage
     |
     +---- Access Token
     |
     +---- Refresh Token
```

This is an important security consideration.

If malicious JavaScript executes in the application's context, browser storage containing authentication tokens can potentially be accessed.

---

# 40. Main Security Concern Addressed by HttpOnly Cookie

Before HttpOnly Cookie:

```text
Refresh Token
      |
      v
sessionStorage
      |
      v
Accessible to JavaScript
```

HttpOnly Cookie changes the refresh-token storage mechanism.

After HttpOnly Cookie:

```text
Refresh Token
      |
      v
HttpOnly Cookie
      |
      v
Not directly readable by JavaScript
```

The Access Token remains managed by the Angular application, while the Refresh Token is moved to a cookie managed by the browser.

---

# 41. Before HttpOnly Cookie vs HttpOnly Cookie

## Before HttpOnly Cookie

```text
Browser
│
└── sessionStorage
    │
    ├── Access Token
    │
    └── Refresh Token
```

Angular can directly access both tokens.

---

##

```text
Browser
│
├── sessionStorage
│   └── Access Token
│
└── HttpOnly Cookie
    └── Refresh Token
```

Angular can directly access:

```text
Access Token
```

Angular cannot directly read:

```text
Refresh Token
```

The browser handles the HttpOnly cookie.

---

# 42. Architecture Evolution

## Current Implementaion

```text
                     Browser
                        |
                        v
                 sessionStorage
                   /          \
                  /            \
                 v              v
          Access Token     Refresh Token
                 |              |
                 +------+-------+
                        |
                        v
                   Angular JS
```

---

## Need to Change

```text
                     Browser
                    /        \
                   /          \
                  v            v
         sessionStorage    HttpOnly Cookie
                |                |
                v                v
         Access Token      Refresh Token
                |                |
                v                |
           Angular JS            |
                                 |
                         Browser Managed
```

---

# 43. Complete Request Flow

```text
                    USER
                     |
                     v
                 COMPONENT
                     |
                     v
                 AuthService
                     |
                     v
                  HttpClient
                     |
                     v
              AuthInterceptor
                     |
             +-------+-------+
             |               |
             v               v
       Access Token     No Access Token
             |               |
             v               v
    Authorization Header   Normal Request
             |               |
             +-------+-------+
                     |
                     v
                 .NET API
                     |
             +-------+-------+
             |               |
            2xx             401
             |               |
             v               v
         Success       TokenRefreshService
                             |
                             v
                       Refresh Token
                             |
                             v
                       Refresh API
                             |
                             v
                        New Tokens
                             |
                             v
                       Retry Request
```

---

# 44. Final Structure

```text
Angular Frontend
│
├── Components
│   ├── Login
│   ├── Register
│   └── Dashboard
│
├── Services
│   ├── AuthService
│   ├── TokenService
│   ├── TokenRefreshService
│   └── AuthStateService
│
├── Guards
│   └── AuthGuard
│
├── Interceptors
│   └── AuthInterceptor
│
├── Models
│   ├── LoginRequest
│   ├── LoginResponse
│   ├── RegisterRequest
│   ├── RefreshTokenRequest
│   ├── RefreshTokenResponse
│   └── LogoutRequest
│
└── Routing
    └── app.routes.ts


Browser Storage
│
└── sessionStorage
    ├── access_token
    └── refresh_token


Backend
│
├── Register
├── Login
├── Refresh Token
├── Logout
├── Logout All Devices
├── JWT Authentication
├── Refresh Token Rotation
├── Replay Detection
└── Token Revocation
```

---

# 45. Key Concepts to Remember

Remember the architecture using these relationships:

```text
Component
    |
    v
AuthService
    |
    v
HTTP API
```

```text
AuthInterceptor
    |
    +---- Adds Access Token
    |
    +---- Detects 401
    |
    +---- Starts Refresh
    |
    +---- Retries Request
```

```text
TokenService
    |
    v
sessionStorage
    |
    +---- Access Token
    |
    +---- Refresh Token
```

```text
TokenRefreshService
    |
    +---- Refresh Access Token
    |
    +---- Rotate Refresh Token
    |
    +---- Handle Concurrent 401
```

```text
AuthStateService
    |
    +---- Authenticated
    |
    └---- Logged Out
```

```text
AuthGuard
    |
    v
Protect Angular Routes
```

---

# 46. One-Page Architecture Summary

```text
                         ANGULAR
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
      Components        AuthService       AuthGuard
          |                 |                 |
          |                 v                 |
          |             HttpClient            |
          |                 |                 |
          |                 v                 |
          |          AuthInterceptor          |
          |                 |                 |
          |        +--------+--------+        |
          |        |                 |        |
          |        v                 v        |
          |   Access Token       401 Error     |
          |        |                 |        |
          |        v                 v        |
          |   TokenService    TokenRefreshService
          |        |                 |
          |        +--------+--------+
          |                 |
          |                 v
          |           Refresh Token
          |                 |
          |                 v
          |          sessionStorage
          |                 |
          +-----------------+
                            |
                            v
                    .NET CORE WEB API
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
            Login       Refresh        Logout
                            |
                            v
                    Token Rotation
                            |
                            v
                    Replay Detection
```

---

# 47. Transition to Angular HttpOnly Cookie

The main architectural change introduced by HttpOnly Cookie is:

```text
BEFORE HttpOnly Cookie

Access Token
     |
     v
sessionStorage

Refresh Token
     |
     v
sessionStorage
```

becomes:

```text
HttpOnly Cookie

Access Token
     |
     v
sessionStorage

Refresh Token
     |
     v
HttpOnly Secure Cookie
```

The major Angular authentication concepts remain the same:

```text
AuthService
TokenService
TokenRefreshService
AuthStateService
AuthInterceptor
AuthGuard
JWT Access Token
Refresh Token Rotation
Replay Detection
Logout
Logout All Devices
Single-Flight Refresh
```

The major change is the **Refresh Token transport and storage mechanism**.

```text

Instead of Session storage , need to implement Browser manages the Refresh Token cookie.
```

```

```

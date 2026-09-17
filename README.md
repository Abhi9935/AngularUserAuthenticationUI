# Angular Authentication Frontend
## Complete Project Structure & Architecture
### Architecture

---

# 1. Project Overview

This Angular application consumes the existing .NET Core Web API.

The backend provides:

- User Registration
- User Login
- JWT Access Token
- Refresh Token
- Refresh Token Rotation
- Refresh Token Replay Detection
- Logout
- Logout All Devices

The Angular frontend provides:

- Registration screen
- Login screen
- Dashboard
- Authentication state management
- Access token management
- Refresh token management
- HTTP authentication interceptor
- Automatic access-token refresh
- Concurrent 401 handling
- Logout
- Logout from all devices
- Route protection

---

# 2. Architecture Used

Before Angular A-19, both tokens were stored in browser `sessionStorage`.

```text
                    ANGULAR APPLICATION
                           |
                           |
                    +------v------+
                    | Components  |
                    +------+------+
                           |
                           v
                    +-------------+
                    | AuthService |
                    +------+------+
                           |
             +-------------+-------------+
             |                           |
             v                           v
      Login/Register              TokenRefreshService
                                         |
                                         v
                                AuthService.refreshToken()
                                         |
                                         v
                                  .NET Core API
Token storage:

Browser sessionStorage
│
├── access_token
│
└── refresh_token

3. Complete Project Structure
A typical Angular project structure:
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

4. Responsibility of Each Folder
components/

Contains UI components.
components/
│
├── login/
├── register/
└── dashboard/

Responsibilities:

LoginComponent
    |
    +-- Login form
    +-- Call AuthService.login()
    +-- Store tokens
    +-- Update authentication state
    +-- Navigate to dashboard
RegisterComponent
    |
    +-- Registration form
    +-- Call AuthService.register()
    +-- Show success/error message
    +-- Navigate to login
DashboardComponent
    |
    +-- Protected page
    +-- Logout
    +-- Logout All Devices

Components should NOT contain authentication logic such as:

JWT validation
Refresh token handling
Token refresh coordination
Token storage implementation

Those responsibilities belong to services/interceptors.

5. services/
services/
│
├── auth.service.ts
├── token.service.ts
├── token-refresh.service.ts
└── auth-state.service.ts

Each service has a specific responsibility.


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

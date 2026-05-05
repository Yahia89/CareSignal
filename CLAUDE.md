# CareSignal API Integration Project

## Overview

React Native (Expo) application for CareSignal with API integration from https://carsignal-api.vercel.app/docs

## Current Status

✅ **Project Foundation Complete**:
- Base API client with interceptors and error handling
- Authentication context and hooks
- Custom hooks for data fetching (useApi) with caching
- Custom hooks for mutations (useMutation) with cache invalidation
- Example screens demonstrating API integration patterns
- TypeScript types and interfaces
- AsyncStorage for token/user persistence
- Performance optimizations (caching, lazy loading, request batching)

⏳ **Pending**:
- Actual API endpoint integration (waiting for Swagger spec details)
- Screen navigation setup
- Feature-specific service implementations

## Architecture

```
src/
├── services/api.ts          - Base API client with axios
├── hooks/                   - Custom React hooks
│   ├── useApi.ts           - GET requests with caching
│   └── useAuth.ts          - Authentication logic
├── contexts/AuthContext    - Global auth state
├── screens/                - UI components (screens)
├── types/                  - TypeScript interfaces
└── utils/storage.ts        - AsyncStorage wrapper
```

## Key Patterns

### API Service Pattern
Create service files for each API domain following the template in `src/services/template.service.ts`

### Data Fetching
Use `useApi()` hook for GET requests:
```typescript
const { data, loading, error, refetch } = useApi('/endpoint', {
  cacheDuration: 300000,  // 5 minutes
  onSuccess: (data) => {},
  onError: (error) => {},
});
```

### Mutations
Use `useMutation()` hook for POST/PUT/PATCH/DELETE:
```typescript
const { mutate, loading, error } = useMutation('post', {
  onSuccess: () => {},
  onError: () => {},
});
await mutate('/endpoint', payload);
```

### Authentication
Use `useAuthContext()` for auth state:
```typescript
const { user, isAuthenticated, login, signup, logout } = useAuthContext();
```

## Integration Steps

1. **Provide API Endpoints** - Share Swagger JSON or endpoint list
2. **Map Screens** - Identify which screens need which endpoints
3. **Create Services** - Add service methods for each endpoint
4. **Update Types** - Add TypeScript interfaces for responses
5. **Implement Screens** - Use hooks to build UI components
6. **Test & Optimize** - Verify API calls and performance

## Performance Features

- **Automatic Caching**: Configurable per-endpoint
- **Cache Invalidation**: Automatic on mutations
- **Request Interceptors**: Token management, error handling
- **Lazy Loading**: Skip requests until conditions met
- **Pagination Support**: Built-in offset/limit handling

## Dependencies

- axios - HTTP client
- react-native-async-storage - Secure storage
- expo - React Native framework
- TypeScript - Type safety

## Notes

- All API responses should follow structure: `{ data: T, message?: string, status: number }`
- Token stored in AsyncStorage with key `@caresignal_auth_token`
- Cache invalidation happens automatically on mutations
- Error handling includes 401 (unauthorized) automatic logout
- Network timeout set to 10 seconds

## Next Steps

Waiting for you to provide the actual API endpoints from the Swagger documentation so I can integrate them one by one following these established patterns.

# API Integration Guide

## Project Structure

```
src/
├── services/
│   ├── api.ts                    # Base API client with interceptors
│   └── [feature].service.ts      # Feature-specific services
├── hooks/
│   ├── useApi.ts                 # Data fetching hook with caching
│   └── useAuth.ts                # Authentication hook
├── contexts/
│   └── AuthContext.tsx           # Auth state management
├── screens/
│   ├── LoginScreen.tsx           # Example login screen
│   ├── ListScreen.tsx            # Example list with pagination & caching
│   └── DetailScreen.tsx          # Example detail with CRUD operations
├── types/
│   └── index.ts                  # TypeScript interfaces
└── utils/
    └── storage.ts                # AsyncStorage utilities
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` file in the root:

```
REACT_APP_API_URL=https://carsignal-api.vercel.app/api
```

### 3. Initialize App with Auth Provider

Update `App.tsx`:

```typescript
import { AuthProvider } from './src/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { ListScreen } from './src/screens/ListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="List" component={ListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
```

## API Integration Patterns

### Pattern 1: Create Feature Service

For each API endpoint group, create a service file:

**Example: `src/services/users.service.ts`**

```typescript
import apiClient from './api';
import { User, PaginationParams } from '../types';

export const usersService = {
  getAll: async (params?: PaginationParams) => {
    const response = await apiClient.get('/users', { params });
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: Partial<User>) => {
    const response = await apiClient.post('/users', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data.data || response.data;
  },
};
```

### Pattern 2: Using useApi Hook for GET Requests

```typescript
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { data, loading, error, refetch } = useApi(
    '/users/123',
    {
      cacheDuration: 300000, // Cache for 5 minutes
      onSuccess: (data) => console.log('Data loaded:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{data?.name}</Text>;
}
```

### Pattern 3: Using useMutation Hook for POST/PUT/DELETE

```typescript
import { useMutation } from '../hooks/useApi';

function MyForm() {
  const { mutate: createUser, loading } = useMutation('post', {
    onSuccess: () => Alert.alert('User created!'),
    onError: (error) => Alert.alert('Error: ' + error.message),
  });

  const handleSubmit = async (data) => {
    await createUser('/users', data);
  };

  return (
    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
      <Text>{loading ? 'Saving...' : 'Save'}</Text>
    </TouchableOpacity>
  );
}
```

### Pattern 4: Authentication Flow

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function LoginComponent() {
  const { login, loading, error } = useAuthContext();

  const handleLogin = async () => {
    const result = await login('email@example.com', 'password');
    if (result.success) {
      // Navigate to home screen
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin} disabled={loading}>
      <Text>{loading ? 'Signing in...' : 'Sign In'}</Text>
    </TouchableOpacity>
  );
}
```

## Performance Optimizations

### 1. Caching Strategy

The `useApi` hook includes built-in caching. Set appropriate `cacheDuration` values:

- **Static content**: 24 hours (86400000 ms)
- **User data**: 5 minutes (300000 ms)  
- **Real-time data**: No cache (0)

```typescript
// Example: Cache user data for 5 minutes
const { data } = useApi('/me', { cacheDuration: 300000 });

// Example: Cache product list for 1 hour
const { data } = useApi('/products', { cacheDuration: 3600000 });
```

### 2. Lazy Loading & Pagination

Use `skip` option to defer API calls:

```typescript
const [userId, setUserId] = useState<string | null>(null);

const { data } = useApi(
  `/users/${userId}`,
  { skip: !userId } // Only fetch when userId is set
);
```

### 3. Request Batching

Combine multiple requests:

```typescript
Promise.all([
  apiClient.get('/users'),
  apiClient.get('/products'),
  apiClient.get('/orders'),
]).then(([users, products, orders]) => {
  // Handle all responses
});
```

### 4. Error Handling

Implement global error handling in `api.ts` interceptor. For specific errors:

```typescript
const { data, error } = useApi('/endpoint', {
  onError: (err) => {
    if (err.status === 401) {
      // Handle unauthorized - redirect to login
    } else if (err.status === 404) {
      // Handle not found
    }
  },
});
```

## Integration Checklist

- [ ] Review Swagger/API documentation
- [ ] Create TypeScript types in `src/types/index.ts`
- [ ] Create service file in `src/services/[feature].service.ts`
- [ ] Create/Update screen components
- [ ] Test API calls in development
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Set appropriate cache durations
- [ ] Test on actual devices
- [ ] Monitor network requests in debugger

## Quick API Integration Steps

1. **Export Swagger JSON** from your API documentation
2. **Identify endpoints** - Map endpoints to screens
3. **Update types** - Add TypeScript interfaces for responses
4. **Create services** - Add service methods for each endpoint
5. **Update screens** - Use hooks to fetch/mutate data
6. **Test thoroughly** - Check all happy paths and error cases

## Common Issues

### Issue: Token not being sent

**Solution**: Ensure token is set via `setAuthToken()` in `useAuth.ts` during login

### Issue: Stale data after mutation

**Solution**: The cache automatically invalidates on mutations. Use `refetch()` if needed

### Issue: Multiple API calls on screen load

**Solution**: Use `skip` option to defer non-critical requests

## Next Steps

Once you provide the actual Swagger endpoints:
1. I'll map each endpoint to the appropriate screen
2. Create specific service files for each API domain
3. Implement proper error handling and loading states
4. Add advanced caching strategies
5. Optimize performance based on your specific needs

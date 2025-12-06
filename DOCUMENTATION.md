# CampusMarket - Technical Documentation

## Project Overview

**CampusMarket** is a peer-to-peer marketplace mobile application designed for university students to buy and sell items within their campus community. This documentation covers the "Vertical Slice" implementation - a fully functional subset of features (Authentication + Home Feed) that demonstrates the complete architecture from frontend to database.

### Development Strategy: Vertical Slice

Instead of building all frontend screens first (horizontal approach), we implemented a **vertical slice** - completing 2-3 features end-to-end:

```
┌─────────────────────────────────────────────────────────┐
│                    VERTICAL SLICE                        │
├─────────────────────────────────────────────────────────┤
│  Feature 1: Auth    │  Feature 2: Home Feed             │
│  ┌───────────────┐  │  ┌───────────────┐                │
│  │   Frontend    │  │  │   Frontend    │                │
│  │  (Login/Reg)  │  │  │  (Product     │                │
│  └───────┬───────┘  │  │   Listing)    │                │
│          │          │  └───────┬───────┘                │
│  ┌───────▼───────┐  │  ┌───────▼───────┐                │
│  │   Backend     │  │  │   Backend     │                │
│  │  (Auth API)   │  │  │ (Products API)│                │
│  └───────┬───────┘  │  └───────┬───────┘                │
│          │          │          │                        │
│  ┌───────▼───────┐  │  ┌───────▼───────┐                │
│  │   Database    │  │  │   Database    │                │
│  │  (Users)      │  │  │  (Products)   │                │
│  └───────────────┘  │  └───────────────┘                │
└─────────────────────────────────────────────────────────┘
```

**Why Vertical Slice?**
- Proves the architecture works end-to-end
- Delivers working features faster
- Easier to demo and get feedback
- Reduces integration risk later

---

## Tech Stack

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | React Native (Expo) | Cross-platform mobile development with managed workflow |
| **Routing** | Expo Router | File-based routing, similar to Next.js |
| **UI Components** | React Native Paper | Material Design components, consistent styling |
| **Icons** | Lucide React Native | Modern, lightweight icon library |
| **Backend** | NestJS | TypeScript-first, modular architecture, enterprise-ready |
| **ORM** | TypeORM | TypeScript decorators, easy MySQL integration |
| **Database** | MySQL (XAMPP) | Relational data, local development simplicity |
| **Auth** | JWT + Passport | Stateless authentication, industry standard |

---

## Project Structure

### Frontend (`/`)

```
campus-market-u1/
├── app/                      # Expo Router pages
│   ├── (auth)/               # Auth group (unauthenticated)
│   │   ├── _layout.tsx       # Auth stack navigator
│   │   ├── login.tsx         # Login screen
│   │   └── register.tsx      # Registration screen
│   ├── (tabs)/               # Main app (authenticated)
│   │   ├── _layout.tsx       # Bottom tab navigator
│   │   ├── index.tsx         # Home feed (products)
│   │   └── profile.tsx       # User profile
│   └── _layout.tsx           # Root layout (providers)
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── services/
│   ├── api.ts                # Axios instance + interceptors
│   ├── auth.service.ts       # Auth API calls
│   └── product.service.ts    # Product API calls
├── types/
│   └── index.ts              # TypeScript type definitions
└── utils/
    └── storage.ts            # Cross-platform secure storage
```

### Backend (`/backend`)

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts   # Passport JWT strategy
│   │   └── jwt-auth.guard.ts # Route protection
│   ├── products/             # Products module
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   ├── entities/             # Database entities
│   │   ├── user.entity.ts
│   │   └── product.entity.ts
│   ├── app.module.ts         # Root module
│   ├── main.ts               # Entry point
│   └── seed.ts               # Database seeder
└── .env                      # Environment variables
```

---

## Implementation Details

### 1. Authentication Flow

#### How it works:

```
┌──────────┐     POST /auth/register     ┌──────────┐
│  Mobile  │ ──────────────────────────► │  NestJS  │
│   App    │                             │  Backend │
│          │ ◄────────────────────────── │          │
└──────────┘   { user, accessToken }     └──────────┘
     │                                        │
     │ Store token                            │ Hash password
     │ in SecureStore                         │ Save to MySQL
     ▼                                        ▼
┌──────────┐                             ┌──────────┐
│  Local   │                             │  MySQL   │
│ Storage  │                             │    DB    │
└──────────┘                             └──────────┘
```

#### Frontend: AuthContext (`contexts/AuthContext.tsx`)

The AuthContext manages authentication state globally:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Key features:**
- **Auto-redirect**: Uses Expo Router's `useSegments()` to detect current route group and redirect based on auth state
- **Token persistence**: Stores JWT in secure storage (SecureStore on native, localStorage on web)
- **Token verification**: On app load, validates stored token by calling `/auth/profile`

```typescript
// Auto-redirect logic
useEffect(() => {
  if (state.isLoading) return;
  const inAuthGroup = segments[0] === '(auth)';
  
  if (!state.isAuthenticated && !inAuthGroup) {
    router.replace('/(auth)/login');  // Force to login
  } else if (state.isAuthenticated && inAuthGroup) {
    router.replace('/(tabs)');        // Go to home
  }
}, [state.isAuthenticated, state.isLoading, segments]);
```

#### Backend: JWT Authentication

**Registration flow (`auth.service.ts`):**
1. Check if email already exists
2. Hash password with bcrypt (salt rounds: 10)
3. Create user in database
4. Generate JWT with user ID and email
5. Return user object + access token

**Login flow:**
1. Find user by email
2. Compare password with bcrypt
3. Generate JWT if valid
4. Return user object + access token

**JWT Strategy (`jwt.strategy.ts`):**
- Extracts token from `Authorization: Bearer <token>` header
- Validates token signature and expiration
- Fetches user from database and attaches to request

---

### 2. Cross-Platform Storage (`utils/storage.ts`)

**Problem:** `expo-secure-store` doesn't work on web browsers.

**Solution:** Platform-specific storage abstraction:

```typescript
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  // ... setItem, removeItem
};
```

**Why?**
- Native apps use encrypted SecureStore
- Web uses localStorage (acceptable for development)
- Single API for all platforms

---

### 3. API Service (`services/api.ts`)

**Platform-aware base URL:**

```typescript
const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',  // Android emulator → host
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000', // Web
});
```

**Why `10.0.2.2` for Android?**
- Android emulator runs in a VM
- `localhost` refers to the emulator itself
- `10.0.2.2` is a special alias to the host machine

**Request interceptor:**
- Automatically attaches JWT token to all requests
- Reads from secure storage on each request

**Response interceptor:**
- Logs errors for debugging
- Could be extended for token refresh logic

---

### 4. Home Feed (`app/(tabs)/index.tsx`)

**Features:**
- Pull-to-refresh
- Search filtering (client-side)
- 2-column grid layout
- Loading and empty states
- Placeholder data fallback (when backend unavailable)

**Data flow:**

```typescript
useEffect(() => {
  fetchProducts();
}, []);

const fetchProducts = async () => {
  try {
    const response = await productService.getProducts({ limit: 20 });
    setProducts(response.data);
  } catch (error) {
    // Fallback to placeholder data for demo
    setProducts(PLACEHOLDER_PRODUCTS);
  }
};
```

**Why placeholder fallback?**
- Allows UI testing without backend
- Graceful degradation
- Better demo experience

---

### 5. Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,      -- bcrypt hash
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Products Table

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('books', 'electronics', 'clothing', 'furniture', 'other'),
  condition ENUM('new', 'like_new', 'good', 'fair'),
  department VARCHAR(255) NOT NULL,
  images TEXT,                          -- Comma-separated URLs
  isAvailable BOOLEAN DEFAULT TRUE,
  sellerId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sellerId) REFERENCES users(id)
);
```

**Why TypeORM with `synchronize: true`?**
- Auto-creates/updates tables from entity definitions
- Great for development (disable in production!)
- No manual migrations needed initially

---

### 6. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/auth/register` | ❌ | Create new user account |
| `POST` | `/auth/login` | ❌ | Authenticate and get token |
| `GET` | `/auth/profile` | ✅ | Get current user info |
| `GET` | `/products` | ❌ | List products (paginated) |
| `GET` | `/products/:id` | ❌ | Get single product |
| `POST` | `/products` | ✅ | Create new listing |
| `PATCH` | `/products/:id` | ✅ | Update listing (owner only) |
| `DELETE` | `/products/:id` | ✅ | Delete listing (owner only) |

**Query parameters for `GET /products`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category
- `department` - Filter by department
- `search` - Search in title/description

---

## Key Design Decisions

### 1. File-based Routing with Route Groups

```
app/
├── (auth)/     ← Unauthenticated routes
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/     ← Authenticated routes (with tab bar)
    ├── index.tsx
    └── profile.tsx
```

**Why route groups `(auth)` and `(tabs)`?**
- Parentheses create logical groups without affecting URL
- Each group can have its own layout (stack vs tabs)
- AuthContext uses `segments[0]` to detect which group user is in

### 2. DTOs with class-validator

```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
  // ...
}
```

**Why?**
- Automatic request validation
- Clear error messages
- Type safety at runtime
- Self-documenting API contracts

### 3. Eager Loading for Seller Info

```typescript
@ManyToOne(() => User, { eager: true })
seller: User;
```

**Why eager loading?**
- Product listings always need seller name
- Avoids N+1 query problem
- Single query fetches product + seller

### 4. Ownership Checks in Service Layer

```typescript
async update(id: number, dto: UpdateProductDto, user: User) {
  const product = await this.findOne(id);
  
  if (product.sellerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenException('You can only update your own products');
  }
  // ...
}
```

**Why in service, not guard?**
- Need to fetch product first to check ownership
- Admins can override ownership check
- Keeps authorization logic centralized

---

## Running the Project

### Prerequisites
- Node.js 18+
- XAMPP (MySQL)
- Android Studio (for emulator) or Expo Go app

### Backend Setup

```bash
cd backend
npm install
# Start MySQL in XAMPP
npm run start:dev
```

### Frontend Setup

```bash
npm install
npx expo start
# Press 'a' for Android or 'w' for web
```

### Seed Demo Data

```bash
cd backend
npx ts-node src/seed.ts
```

### Demo Account
- **Email:** demo@campus.edu
- **Password:** password123

---

## Environment Variables

### Backend (`.env`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=1234
DB_DATABASE=campus_market

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

PORT=3000
```

---

## Component Usage

This project uses components from three main sources:

### 1. React Native Core Components

From `react-native`, used for basic layout and interaction:

```typescript
import { 
  View,           // Container/div equivalent
  StyleSheet,     // CSS-in-JS styling
  FlatList,       // Performant scrollable list
  Pressable,      // Touchable wrapper
  ScrollView,     // Scrollable container
  RefreshControl, // Pull-to-refresh
  KeyboardAvoidingView, // Keyboard-aware container
  Platform,       // OS detection
} from 'react-native';
```

**Example - FlatList with RefreshControl:**
```tsx
<FlatList
  data={products}
  renderItem={renderProductCard}
  keyExtractor={(item) => item.id.toString()}
  numColumns={2}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  ListEmptyComponent={<EmptyState />}
/>
```

### 2. React Native Paper (Material Design)

From `react-native-paper`, provides styled Material Design components:

```typescript
import { 
  Text,           // Typography with variants
  TextInput,      // Material text fields
  Button,         // Material buttons
  Card,           // Elevated card container
  Chip,           // Tag/badge component
  Searchbar,      // Search input
  HelperText,     // Error/helper messages
  ActivityIndicator, // Loading spinner
  Avatar,         // User avatar
  Divider,        // Horizontal line
} from 'react-native-paper';
```

**Example - TextInput with icons:**
```tsx
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  keyboardType="email-address"
  autoCapitalize="none"
  left={<TextInput.Icon icon={() => <Mail size={20} color={Colors.light.icon} />} />}
/>
```

**Example - Text with variants:**
```tsx
<Text variant="headlineLarge" style={styles.title}>CampusMarket</Text>
<Text variant="bodyMedium" style={styles.subtitle}>Buy & sell with students</Text>
```

**Example - Card for product listing:**
```tsx
<Card style={styles.card} mode="elevated">
  <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
  <Card.Content>
    <Text variant="titleMedium">{item.title}</Text>
    <Text variant="titleLarge">${Number(item.price).toFixed(2)}</Text>
    <Chip compact>{item.condition}</Chip>
  </Card.Content>
</Card>
```

### 3. Lucide React Native (Icons)

From `lucide-react-native`, provides SVG icons:

```typescript
import { 
  ShoppingBag,  // App logo
  Mail,         // Email field icon
  Lock,         // Password field icon
  User,         // Profile icon
  Building2,    // Department icon
  MapPin,       // Location indicator
  Tag,          // Category/empty state
  Home,         // Tab bar icon
  LogOut,       // Logout button
  ChevronRight, // List arrow
  Shield,       // Role badge
} from 'lucide-react-native';
```

**Example - Icon in TextInput:**
```tsx
<TextInput
  left={
    <TextInput.Icon 
      icon={() => <Mail size={20} color={Colors.light.icon} />} 
    />
  }
/>
```

**Example - Icon in metadata row:**
```tsx
<View style={styles.metaItem}>
  <MapPin size={14} color={Colors.light.icon} />
  <Text variant="bodySmall">{item.department}</Text>
</View>
```

### 4. Expo & Navigation Components

```typescript
import { Image } from 'expo-image';           // Optimized image loading
import { Link } from 'expo-router';           // Navigation links
import { SafeAreaView } from 'react-native-safe-area-context'; // Safe area handling
```

**Example - Link for navigation:**
```tsx
<Link href="/(auth)/register" asChild>
  <Text style={styles.link}>Sign Up</Text>
</Link>
```

### Component Composition Pattern

Each screen follows this structure:

```tsx
export default function ScreenName() {
  // 1. Hooks (state, context, effects)
  const { user } = useAuth();
  const [data, setData] = useState([]);

  // 2. Event handlers
  const handleSubmit = async () => { /* ... */ };

  // 3. Render helpers (for FlatList items, etc.)
  const renderItem = ({ item }) => (
    <Card>...</Card>
  );

  // 4. Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall">Title</Text>
      </View>
      
      {/* Content */}
      <FlatList data={data} renderItem={renderItem} />
    </SafeAreaView>
  );
}

// 5. Styles at bottom
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#fff' },
});
```

### Styling Approach

We use `StyleSheet.create()` for performance-optimized styles:

```typescript
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Spacing
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // Typography (supplement Paper's variants)
  title: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  
  // Components
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
```

### Theme Colors

Defined in `constants/theme.ts` and used consistently:

```typescript
import { Colors } from '@/constants/theme';

// Usage
<Text style={{ color: Colors.light.text }}>Primary text</Text>
<Icon color={Colors.light.icon} />
<Button buttonColor={Colors.light.tint}>Action</Button>
```

---

## Future Enhancements

1. **Image Upload** - Integrate with cloud storage (S3, Cloudinary)
2. **Real-time Chat** - WebSocket for buyer-seller messaging
3. **Push Notifications** - Expo Push for new messages/offers
4. **Admin Panel** - Web dashboard for moderation
5. **Search Improvements** - Full-text search with Elasticsearch
6. **Payment Integration** - Stripe for secure transactions

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on backend | Start MySQL in XAMPP |
| `Network Error` on mobile | Check API_BASE_URL matches your setup |
| `price.toFixed is not a function` | MySQL decimal returns string, use `Number(price)` |
| `SecureStore not available` on web | Uses localStorage fallback automatically |

---

*Documentation generated for CampusMarket v1.0.0 - Vertical Slice Implementation*

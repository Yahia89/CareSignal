# Neumorphic Design System - CareSignal

Complete design token system for neumorphic UI styling with light/dark theme support.

## 📁 Directory Structure

```
src/shared/design/
├── tokens/
│   ├── index.ts          # Core design tokens
│   ├── utils.ts          # Utility functions for applying tokens
│   └── useTokens.ts      # React hooks for accessing tokens
├── theme/
│   └── ThemeContext.tsx  # Theme provider and context
├── components/
│   ├── NeuButton.tsx     # Neumorphic button component
│   ├── NeuCard.tsx       # Neumorphic card component
│   └── index.ts          # Component exports
└── README.md             # This file
```

## 🎨 Design Token Categories

### 1. **Colors**
```typescript
import { colors } from '@/shared/design/tokens';

// Accent colors
colors.accent.primary      // #FF5555 (coral red)
colors.accent.light        // #FF7777
colors.accent.dark         // #DD3333

// Neutral grays (50-900)
colors.neutral[50]         // #FAFAFA
colors.neutral[500]        // #9E9E9E

// Semantic colors
colors.semantic.success    // #4CAF50
colors.semantic.error      // #F44336
```

### 2. **Shadows & Elevation** (Neumorphic Core)
```typescript
import { shadows } from '@/shared/design/tokens';

// Native shadows (iOS/Android)
shadows.elevation.md.light  // Medium elevation light mode
shadows.elevation.lg.dark   // Large elevation dark mode

// Web CSS shadows
shadows.web.md             // CSS box-shadow string

// Inset shadows (pressed state)
shadows.inset.md           // Inset shadow for pressed buttons
```

**Elevation Levels:**
- `xs` - Subtle, minimal depth
- `sm` - Small depth
- `md` - Medium depth (most common) ⭐
- `lg` - Large depth
- `xl` - Extra large depth

### 3. **Spacing**
```typescript
import { spacing } from '@/shared/design/tokens';

spacing[0]    // 0px
spacing[8]    // 8px
spacing[16]   // 16px
spacing[24]   // 24px
```

### 4. **Border Radius**
```typescript
import { borderRadius } from '@/shared/design/tokens';

borderRadius.xs         // 4px   (subtle)
borderRadius.md         // 12px  (medium)
borderRadius.lg         // 16px  (buttons)
borderRadius.full       // 9999px (circles)
```

### 5. **Typography**
```typescript
import { typography } from '@/shared/design/tokens';

typography.fontSize.sm      // 14px
typography.fontSize.base    // 16px
typography.fontWeight.bold  // 700
```

## 🪝 React Hooks

### `useTokens()`
Access all design tokens in a component.

```typescript
import { useTokens } from '@/shared/design/tokens/useTokens';

const MyComponent = () => {
  const tokens = useTokens();
  
  return (
    <View style={{ padding: tokens.spacing[16] }}>
      {/* content */}
    </View>
  );
};
```

### `useThemeMode()`
Get and control current theme mode.

```typescript
import { useThemeMode } from '@/shared/design/tokens/useTokens';

const ThemeToggle = () => {
  const { mode, isDark, toggleTheme } = useThemeMode();
  
  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
    </TouchableOpacity>
  );
};
```

### `useColors()`
Get theme-aware color palette.

```typescript
import { useColors } from '@/shared/design/tokens/useTokens';

const Card = () => {
  const colors = useColors();
  
  return (
    <View style={{ backgroundColor: colors.surface }}>
      {/* Automatically adapts to light/dark mode */}
    </View>
  );
};
```

### `useShadows()`
Get theme-aware shadows.

```typescript
import { useShadows } from '@/shared/design/tokens/useTokens';

const Button = () => {
  const shadows = useShadows();
  
  return (
    <View style={[shadows.elevation.md]}>
      {/* Automatic elevation for current theme */}
    </View>
  );
};
```

## 🛠️ Utility Functions

### Shadow Utilities
```typescript
import { getShadowStyle, getWebShadow } from '@/shared/design/tokens/utils';

// React Native
const shadowStyle = getShadowStyle('md', isDark);

// Web
const cssString = getWebShadow('lg');
```

### Spacing Utilities
```typescript
import { 
  getSpacing, 
  createPadding, 
  createMargin 
} from '@/shared/design/tokens/utils';

// Single value
const padding = getSpacing('16');  // 16

// Style objects
const padded = createPadding('16');           // All sides
const customPadding = createPadding('16', '20', '12'); // H, V
```

### Border Radius
```typescript
import { 
  getBorderRadius, 
  createBorderRadius 
} from '@/shared/design/tokens/utils';

const radius = getBorderRadius('md');  // 12
const rounded = createBorderRadius('lg'); // { borderRadius: 16 }
```

### Neumorphic Styles
```typescript
import { 
  createButtonStyle, 
  createCardStyle, 
  createInputStyle,
  createNeuButtonStyle 
} from '@/shared/design/tokens/utils';

// Complete button style
const buttonStyle = createButtonStyle('md', isDark);

// Button with state
const pressedButton = createNeuButtonStyle('pressed', 'md', isDark);

// Card container
const cardStyle = createCardStyle(isDark);

// Input field
const inputStyle = createInputStyle(isDark);
```

## 📦 Pre-built Components

### NeuButton
Neumorphic button with automatic theme support.

```typescript
import { NeuButton } from '@/shared/design/components';

<NeuButton
  title="Press Me"
  onPress={() => handlePress()}
  size="md"              // 'sm' | 'md' | 'lg'
  variant="primary"      // 'primary' | 'secondary'
  loading={false}
/>
```

### NeuCard
Neumorphic card container.

```typescript
import { NeuCard } from '@/shared/design/components';

<NeuCard elevated={false}>
  <Text>Card content with automatic shadows</Text>
</NeuCard>
```

## 🎯 Setup Instructions

### 1. Wrap App with ThemeProvider

```typescript
import { ThemeProvider } from '@/shared/design/theme/ThemeContext';
import App from './App';

export default function Root() {
  return (
    <ThemeProvider defaultMode="light">
      <App />
    </ThemeProvider>
  );
}
```

### 2. Use Tokens in Components

```typescript
import { View, Text } from 'react-native';
import { useTokens, useThemeMode } from '@/shared/design/tokens/useTokens';
import { createButtonStyle } from '@/shared/design/tokens/utils';

const MyComponent = () => {
  const tokens = useTokens();
  const { isDark } = useThemeMode();
  
  return (
    <View style={{ padding: tokens.spacing[20] }}>
      <Text style={{ color: tokens.colors.text.primary }}>
        Hello Neumorphic Design!
      </Text>
    </View>
  );
};
```

## 🎨 Design Principles

### Neumorphism
- **Soft shadows** for depth without harshness
- **Subtle gradients** (achieved through shadow layering)
- **Minimal contrast** for softer appearance
- **Rounded corners** for soften edges
- **Monochromatic palette** with accent color

### Token Organization
- **Semantic naming** (background, surface, primary)
- **Scalable levels** (xs → xl for shadows)
- **Theme-aware** (automatic light/dark adaptation)
- **Composable** (combine tokens for complex styles)

## 📊 Color Palette

**Primary Accent:** #FF5555 (Coral Red)
**Grays:** #FAFAFA → #212121 (50-900)
**Semantics:** Success, Error, Warning, Info

## 🌓 Light/Dark Theme

All tokens automatically adapt to theme mode:

```typescript
const { isDark } = useThemeMode();

// Background adapts automatically
const bgColor = isDark ? colors.background.dark : colors.background.light;

// Or use hook
const colors = useColors(); // Returns theme-aware colors
```

## 🔧 Customization

To modify tokens, edit `src/shared/design/tokens/index.ts`:

```typescript
export const colors = {
  accent: {
    primary: '#YOUR_COLOR_HERE',
    // ... other colors
  },
};
```

Changes automatically propagate to all components using the token system.

## 📝 Examples

### Custom Button with Tokens
```typescript
import { TouchableOpacity, Text } from 'react-native';
import { useTokens } from '@/shared/design/tokens/useTokens';
import { createNeuButtonStyle } from '@/shared/design/tokens/utils';

const CustomButton = ({ title, onPress }) => {
  const tokens = useTokens();
  
  return (
    <TouchableOpacity
      style={createNeuButtonStyle('default', 'md')}
      onPress={onPress}
    >
      <Text style={{ color: tokens.colors.text.inverse }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### Themed Container
```typescript
import { View } from 'react-native';
import { useColors, useShadows } from '@/shared/design/tokens/useTokens';
import { createPadding } from '@/shared/design/tokens/utils';

const ThemedContainer = ({ children }) => {
  const colors = useColors();
  const shadows = useShadows();
  
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          ...createPadding('20'),
        },
        shadows.elevation.md,
      ]}
    >
      {children}
    </View>
  );
};
```

## 📚 Additional Resources

- Design tokens follow system design best practices
- Shadow values calibrated for neumorphic aesthetic
- All components auto-adapt to light/dark themes
- Token system extensible for future additions

## 🤝 Contributing

To add new tokens:
1. Add to appropriate section in `src/shared/design/tokens/index.ts`
2. Create utility function if needed in `utils.ts`
3. Update this README
4. Add example components in `components/`

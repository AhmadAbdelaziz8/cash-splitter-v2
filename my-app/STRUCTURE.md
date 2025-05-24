# 📁 Project Structure Guide

## 🎯 Clean Architecture Overview

This Cash Splitter app follows clean architecture principles with clear separation of concerns:

```
my-app/
├── 📱 app/                    # File-based routing (screens)
├── 🧩 components/             # Reusable UI components
│   └── ui/                    # Base UI components
├── 🎣 hooks/                  # Custom React hooks
├── 🏢 services/               # Business logic & API calls
├── 🔧 utils/                  # Pure utility functions
├── 📝 types/                  # TypeScript type definitions
├── ⚙️ config/                 # Configuration files
├── 🎨 constants/              # App constants & magic numbers
└── 🗂️ contexts/               # React Context providers
```

## 📋 File Naming Conventions

### ✅ Good Examples:

- `usePermissions.ts` - Custom hook
- `Button.tsx` - UI component
- `receiptService.ts` - Service class
- `errorUtils.ts` - Utility functions
- `AppConstants.ts` - Constants file

### ❌ Avoid:

- `imageUtils.js` - Use `.ts` for consistency
- `utils.tsx` - Too generic
- `helpers.js` - Use specific names

## 🏗️ Component Architecture

### 1. Smart vs Dumb Components

**Smart Components (Containers):**

```tsx
// app/results.tsx - Contains business logic
export default function ResultsScreen() {
  const { state, actions } = useBillSplitter(contextItems);
  // Screen-specific logic only
}
```

**Dumb Components (Presentational):**

```tsx
// components/ui/Button.tsx - Pure UI logic
export const Button = ({ variant, children, ...props }) => {
  // Only UI rendering logic
};
```

### 2. Custom Hooks Pattern

Extract complex logic into custom hooks:

```tsx
// ✅ Good - Business logic in hook
const { permissions, actions } = usePermissions();
const { state, actions } = useBillSplitter(items);

// ❌ Bad - Business logic in component
const [permission, setPermission] = useState();
const [cameraReady, setCameraReady] = useState();
// ... lots of logic in component
```

## 🔧 Service Layer Pattern

### API Services

```tsx
// services/receiptService.ts
class ReceiptService {
  async parseReceiptImage(base64: string): Promise<ParseResult> {
    // API logic here
  }
}

export const receiptService = new ReceiptService();
```

### Usage in Components

```tsx
// In component
const result = await receiptService.parseReceiptImage(imageData);
```

## 🚨 Error Handling

### Centralized Error Management

```tsx
import { errorHandler, ErrorType } from '@/utils/errorUtils';

// ✅ Good - Structured error handling
try {
  await doSomething();
} catch (error) {
  errorHandler.logError(ErrorType.API, 'Failed to process', error);
}

// ❌ Bad - Scattered console.error
catch (error) {
  console.error('Something failed:', error);
  Alert.alert('Error', 'Something went wrong');
}
```

## 📐 Type Safety

### Centralized Types

```tsx
// types/index.ts
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
  assignedTo: string[];
}
```

### Usage Across App

```tsx
import { ReceiptItem } from "@/types";

// All components use the same types
const items: ReceiptItem[] = [];
```

## 🎨 Styling Strategy

### When to Use What:

1. **NativeWind (95% of cases):**

   ```tsx
   <View className="flex-1 bg-gray-50 p-5">
     <Button variant="primary" size="lg" fullWidth>
       Submit
     </Button>
   </View>
   ```

2. **StyleSheet (Complex layouts only):**
   ```tsx
   const styles = StyleSheet.create({
     cameraOverlay: {
       position: "absolute",
       top: 0,
       left: 0,
       right: 0,
       zIndex: 1,
     },
   });
   ```

## 🧪 Testing Strategy (Future)

### Testable Structure:

- **Services**: Easy to unit test
- **Hooks**: Testable with React Testing Library
- **Utils**: Pure functions, easy to test
- **Components**: Focus on integration tests

## 🚀 Performance Best Practices

### 1. Optimize Heavy Lists

```tsx
// ✅ Good - StyleSheet for FlatList
<FlatList
  style={styles.list}
  renderItem={ItemComponent}
/>

// ❌ Bad - NativeWind on FlatList
<FlatList className="flex-1" />
```

### 2. Memoization

```tsx
// In custom hooks
const calculateTotal = useCallback(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

### 3. Error Boundaries

```tsx
// _layout.tsx already exports ErrorBoundary
export { ErrorBoundary } from "expo-router";
```

## 📊 Code Quality Metrics

After cleanup, your code should have:

- ✅ **Single Responsibility**: Each file has one purpose
- ✅ **DRY Principle**: No duplicated logic
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Consistent Patterns**: Same patterns across the app
- ✅ **Error Handling**: Centralized error management
- ✅ **Maintainability**: Easy to understand and modify

## 🔄 Migration Steps

1. **Replace old patterns gradually:**

   ```tsx
   // Old
   <TouchableOpacity className="bg-sky-400 py-3 px-4">
     <Text>Button</Text>
   </TouchableOpacity>

   // New
   <Button variant="primary" size="md">Button</Button>
   ```

2. **Use new services:**

   ```tsx
   // Old
   import { parseReceiptImage } from "../config/geminiConfig";

   // New
   import { receiptService } from "@/services/receiptService";
   ```

3. **Extract business logic:**

   ```tsx
   // Old - Logic in component
   const [items, setItems] = useState([]);
   const addPerson = () => {
     /* logic */
   };

   // New - Logic in hook
   const { state, actions } = useBillSplitter(items);
   ```

This structure makes your code more maintainable, testable, and scalable! 🎉

# eKYC Feature

eKYC (Electronic Know Your Customer) feature for identity verification using FPT AI SDK.

## 📁 Structure

```
src/features/ekyc/
├── components/           # React components
│   ├── EKYCWebView.tsx          # Main WebView component
│   └── EKYCLoadingOverlay.tsx   # Loading overlay component
├── hooks/               # Custom React hooks
│   ├── useEKYCSession.ts        # Session management hook
│   └── useEKYCWebView.ts        # WebView message handling hook
├── screens/             # Screen components
│   └── EKYCScreen.tsx           # Main eKYC screen
├── services/            # API services
│   └── ekycApi.ts               # Backend API calls
├── types/               # TypeScript types
│   └── index.ts                 # Type definitions
├── utils/               # Utility functions
│   └── ekycInjectedScript.ts    # WebView injected JavaScript
└── index.ts             # Feature exports
```

## 🚀 Usage

### Import the screen in navigation:

```typescript
import { EKYCScreen } from '../features/ekyc';
```

### Use in Settings or any other screen:

```typescript
navigation.navigate('EKYC');
```

## 🔧 Components

### EKYCScreen

Main screen component that handles navigation and callbacks.

**Props:**

- None (uses React Navigation)

**Example:**

```typescript
<Stack.Screen name="EKYC" component={EKYCScreen} />
```

### EKYCWebView

Main WebView component that displays FPT AI eKYC SDK.

**Props:**

```typescript
interface EKYCWebViewProps {
  userId: number;
  onClose: () => void;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: any) => void;
}
```

### EKYCLoadingOverlay

Loading overlay displayed while initializing or processing.

**Props:**

```typescript
interface EKYCLoadingOverlayProps {
  visible: boolean;
  currentStep: EKYCStep;
}
```

## 🎣 Hooks

### useEKYCSession

Manages eKYC session creation and SDK initialization.

**Returns:**

```typescript
{
  sessionId: string | null;
  sdkConfig: EKYCConfig | null;
  loading: boolean;
  error: string | null;
  currentStep: EKYCStep;
}
```

### useEKYCWebView

Handles WebView messages and callbacks.

**Returns:**

```typescript
{
  webViewReady: boolean;
  currentStep: EKYCStep;
  handleWebViewMessage: (event: WebViewMessageEvent) => Promise<void>;
}
```

## 🌐 API Services

### createEKYCSession

Creates a new eKYC session.

```typescript
const session = await createEKYCSession(userId);
```

### initializeEKYCSDK

Initializes SDK and gets configuration.

```typescript
const config = await initializeEKYCSDK(sessionId, 'vi');
```

### sendEKYCCallback

Sends callback events to backend.

```typescript
await sendEKYCCallback(callbackData);
```

### getEKYCSessionStatus

Gets current session status.

```typescript
const session = await getEKYCSessionStatus(sessionId);
```

## 🔐 Backend Integration

The feature integrates with Spring Boot backend at:

- **Base URL:** `http://10.0.2.2:8081` (Android Emulator)
- **Backend Path:** `d:\EBANKING\BACKEND\ekycService`

### API Endpoints:

1. **POST** `/api/ekyc/sessions?userId={userId}` - Create session
2. **POST** `/api/ekyc/sdk/init?sessionId={sessionId}&language={lang}` - Initialize SDK
3. **POST** `/api/ekyc/sdk/callback` - Send callback events
4. **GET** `/api/ekyc/sessions/{sessionId}` - Get session status

## 📊 Flow

```
1. User opens eKYC screen
2. useEKYCSession creates session with backend
3. Backend returns sessionId and SDK config
4. EKYCWebView loads FPT AI SDK with config
5. Injected script auto-clicks "Init Ekyc"
6. User performs:
   - OCR (ID card scanning)
   - Liveness detection
   - Face matching
7. Each step sends callback to backend
8. When completed, onSuccess callback triggers
9. Success message shown and navigate back
```

## 🎨 UI/UX Features

- ✅ Auto-start eKYC (no introduction page)
- ✅ Loading overlay while initializing
- ✅ Smooth transitions
- ✅ No scrollbar visible
- ✅ Step-by-step progress indicators
- ✅ Toast notifications for each step

## 🐛 Troubleshooting

### Issue: Duplicate sessions created

**Solution:** Removed test connection step, only create session once.

### Issue: Introduction page visible

**Solution:** Injected script hides page until eKYC starts.

### Issue: Scrollbar visible

**Solution:** Added CSS to hide all scrollbars.

## 📝 TODO

- [ ] Get userId from Redux store instead of hardcoded
- [ ] Add analytics logging
- [ ] Add retry mechanism for failed API calls
- [ ] Add offline detection
- [ ] Add session timeout handling
- [ ] Implement result caching
- [ ] Add unit tests
- [ ] Add integration tests

## 🔗 Dependencies

- `react-native-webview`: ^13.16.0
- `@react-navigation/native`
- `react-i18next`
- `react-native-dotenv`

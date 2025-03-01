# App Hooks API Documentation

## Overview

This documentation provides an overview of the available hooks in the application. It covers:

- **Notifications Hooks**
- **Pregen Wallet Login Hooks**
- **Dispatch Windows Hooks**
- **Navbar API Hooks**
- **Value Synchronization Hooks**
- **App Routing Hooks**
- **Contract Interactions**
  - **Pregen Contract Write Hooks (`usePregenTransaction`)**

All custom hooks can be imported from the drive index file

## Notifications Hooks

The notifications system exposes a context hook whose API is defined by the following interface:

```typescript
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    notification: Omit<BaseNotification, 'id' | 'timestamp' | 'read'> & 
    Partial<NotificationOptions>
  ) => void
  addSilentNotification: (
    notification: Omit<BaseNotification, 'id' | 'timestamp' | 'read' | 'showToast'> & 
    Omit<Partial<NotificationOptions>, 'showToast'>
  ) => void
  clearNotifications: () => void
  clearAllExceptPersistent: () => void
  markAllAsRead: () => void
  markAsRead: (id: string) => void
  removeNotification: (id: string) => void
  openNotificationPanel: () => void
  unreadCount: number
}
```

### Available Functions

- **`notifications`**: An array of all notifications currently in state.

- **`addNotification(notification)`**: Adds a new notification. The provided object should include properties such as `title`, `message`, and `type` (`'success' | 'error' | 'info' | 'warning'`). An `id`, `timestamp`, and `read` flag are assigned automatically.

Example:
```tsx
addNotification({
  title: 'Success!',
  message: 'Your action was successful.',
  type: 'success',
});
```

- **`addSilentNotification(notification)`**: Adds a notification without triggering a toast display. This is useful for background or log-style notifications.

Example:
```tsx
addSilentNotification({
  title: 'Background Info',
  message: 'This is a silent update.',
  type: 'info',
});
```

- **`clearNotifications()`**: Clears all notifications from the context.

- **`clearAllExceptPersistent()`**: Clears all notifications except those marked as persistent (if your notification options support persistence).

- **`markAllAsRead()`**: Marks every notification as read.

- **`markAsRead(id)`**: Marks a single notification (identified by its `id`) as read.

- **`removeNotification(id)`**: Removes a notification by its `id`.

- **`openNotificationPanel()`**: Opens the notifications panel (typically rendering a UI component that shows the full list of notifications).

- **`unreadCount`**: A number representing how many notifications are unread.

### Usage Example

```tsx
import { useNotifications } from '@/components/pc/drives';

const MyComponent = () => {
  const {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    openNotificationPanel,
    unreadCount,
  } = useNotifications();

  return (
    <div>
      <button onClick={() => addNotification({
          title: 'New Message',
          message: 'You have a new message.',
          type: 'info'
        })}>
        Show Notification
      </button>
      <button onClick={openNotificationPanel}>Open Notifications</button>
      <p>Unread notifications: {unreadCount}</p>
    </div>
  );
};
```

## Pregen Wallet Login Hooks

For managing pre-generated wallet sessions, use the `usePregenSession` hook which provides the following interface:

```typescript
interface PregenContextType {
  pregenWalletSession: PregenWalletData | null;
  isLoginPregenSession: boolean;
  setPregenWalletSession: (value: PregenWalletData | null) => void;
  pregenAddress: string | undefined;
  pregenSmartAccountAddress: string | undefined;
  pregenActiveAddress: string | undefined;
  pregenEncryptedKeyShare: string | undefined;
  pregenWalletId: string | undefined;
  isSmartAccount: boolean;
}
```

### Available Properties and Functions

- **`pregenWalletSession`**: Contains the current pregen wallet session data, or null if no session is active.

- **`isLoginPregenSession`**: A boolean flag indicating if a pregen wallet session is active.

- **`setPregenWalletSession(value)`**: Function to update the wallet session data.

- **`pregenAddress`**: The EOA wallet address from the pregen session (if available).

- **`pregenSmartAccountAddress`**: The smart account address associated with the pregen wallet.

- **`pregenActiveAddress`**: The currently active address (either EOA or smart account).

- **`pregenEncryptedKeyShare`**: The encrypted key share for the pregen wallet (if available).

- **`pregenWalletId`**: A unique identifier for the pregen wallet.

- **`isSmartAccount`**: Boolean indicating if the active address is a smart account.

### Usage Example

```tsx
import { usePregenSession } from '@/components/pc/drives';

const WalletComponent = () => {
  const {
    pregenWalletSession,
    isLoginPregenSession,
    setPregenWalletSession,
    pregenAddress,
    pregenSmartAccountAddress,
    pregenActiveAddress,
    isSmartAccount
  } = usePregenSession();

  return (
    <div>
      {isLoginPregenSession ? (
        <div>
          <p>EOA Address: {pregenAddress}</p>
          <p>Smart Account: {pregenSmartAccountAddress}</p>
          <p>Active Address: {pregenActiveAddress}</p>
          <p>Using Smart Account: {isSmartAccount ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <button onClick={() => setPregenWalletSession(/* login data */)}>
          Login with Pregen Wallet
        </button>
      )}
    </div>
  );
};
```

## Dispatch Windows Hooks

The dispatch windows system provides dynamic window management through the following interface:

```typescript
interface DispatchWindowContextType {
  createDispatchWindow: (config: WindowConfig) => string
  closeDispatchWindow: (id: string) => void
  focusDispatchWindow: (id: string) => void
  activeDispatchWindowId: string | null
  dispatchWindows: ActiveWindow[]
}
```

### Available Functions

- **`createDispatchWindow(config)`**: Creates a new window with the specified configuration and returns its ID.

- **`closeDispatchWindow(id)`**: Closes the window with the specified ID.

- **`focusDispatchWindow(id)`**: Brings the specified window to the front/focus.

- **`activeDispatchWindowId`**: The ID of the currently active window, or null if none.

- **`dispatchWindows`**: An array containing all currently open windows.

### Usage Example

```tsx
import { useDispatchWindows } from '@/components/pc/drives';

const WindowManagerComponent = () => {
  const {
    createDispatchWindow,
    closeDispatchWindow,
    focusDispatchWindow
  } = useDispatchWindows();

  const openGameWindow = () => {
    const id = createDispatchWindow({
      title: 'Snake Game Info',
      content: (
        <div className="">
          Nav bar
        </div>
      ),
      initialPosition: { x: 100, y: 50 },
      initialSize: { width: 220, height: 350 },
      onClose: () => console.log('Window closed'),
    });
    
    // Store the ID if you need to reference this window later
    console.log('Created window with ID:', id);
  };

  return (
    <div>
      <button onClick={openGameWindow}>Open Game Window</button>
      <button onClick={() => closeDispatchWindow('some-window-id')}>
        Close Window
      </button>
    </div>
  );
};
```

## Navbar API Hooks

For controlling the application navbar content dynamically:

```typescript
interface NavbarContextType {
  // Content management
  navbarContent: ReactNode | null
  setNavbarContent: (content: ReactNode) => void
  clearNavbarContent: () => void
  // Window focus management
  activeWindowId: number | null
  setActiveWindowId: (windowId: number | null) => void
}
```

### Available Functions

- **`navbarContent`**: The current content displayed in the navbar.

- **`setNavbarContent(content)`**: Sets the content to be displayed in the navbar.

- **`clearNavbarContent()`**: Clears the navbar content.

- **`activeWindowId`**: The ID of the currently active window.

- **`setActiveWindowId(windowId)`**: Sets which window is considered active.

### Usage Example

```tsx
import { useNavbar } from '@/components/pc/drives';

const NavbarController = () => {
  const { setNavbarContent, clearNavbarContent } = useNavbar();

  const setCustomNavbar = () => {
    setNavbarContent(
      <div className="">
        <span>Custom Info</span>
        <button>Action</button>
      </div>
    );
  };

  return (
    <div>
      <button onClick={setCustomNavbar}>Set Custom Navbar</button>
      <button onClick={clearNavbarContent}>Reset Navbar</button>
    </div>
  );
};
```

## App Routing Hooks

The application provides a lightweight client-side routing system with the following interface:

```typescript
interface RouterContextType {
  navigate: (path: string, params?: Record<string, string>) => void
  back: () => void
  currentRoute: Route | null
  params: Record<string, string>
}

type Route = {
  path: string
  component: ReactComponent
  params?: Record<string, string>
  pattern?: RegExp
}
```

### Core Components

- **`AppRouterProvider`**: Provider component that sets up the routing context.
- **`AppRouteRegistrar`**: Component for registering available routes.
- **`AppRouteRenderer`**: Component that renders the current route.

### Available Functions

- **`navigate(path, params)`**: Navigates to the specified path with optional parameters.

- **`back()`**: Navigates to the previous route in history.

- **`currentRoute`**: The currently active route object.

- **`params`**: An object containing the current route parameters.

### Usage Example

```tsx
import { 
  useAppRouter, 
  AppRouterProvider, 
  AppRouteRegistrar, 
  AppRouteRenderer 
} from '@/components/pc/drives';

// Define your routes
const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/profile/:userId', component: UserProfile },
  { path: '/settings', component: Settings }
];

// Set up the router in your app
const App = () => {
  return (
    <AppRouterProvider>
      <AppRouteRegistrar routes={routes} />
      <Layout>
        <AppRouteRenderer />
      </Layout>
    </AppRouterProvider>
  );
};

// Use the router in a component
const Navigation = () => {
  const { navigate, back, params } = useAppRouter();

  return (
    <nav>
      <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      <button onClick={() => navigate('/profile/123', { tab: 'posts' })}>
        User Profile
      </button>
      <button onClick={() => navigate('/settings')}>Settings</button>
      <button onClick={back}>Back</button>
      
      {params.userId && <p>Current user ID: {params.userId}</p>}
    </nav>
  );
};
```

### Working with Route Parameters

The router supports both URL parameters (like `:userId` in `/profile/:userId`) and additional parameters passed through the navigate function:

```tsx
// Navigate with URL parameters
navigate('/profile/123');

// Navigate with additional parameters
navigate('/profile/123', { tab: 'posts', view: 'grid' });

// Access parameters in your component
const ProfilePage = () => {
  const { params } = useAppRouter();
  
  // params would contain { userId: '123', tab: 'posts', view: 'grid' }
  return (
    <div>
      <h1>User Profile: {params.userId}</h1>
      <Tabs activeTab={params.tab} />
      <ContentView mode={params.view} />
    </div>
  );
};
```

## Value Synchronization Hooks

For easy synchronization of values between components:

### useValue

```typescript
interface ValueHookInterface {
  getValue: () => any
  setValue: (value: any) => void
}
```

### useTypedValue

A typed version of useValue:

```typescript
interface TypedValueHookInterface<T> {
  getValue: () => T
  setValue: (value: T) => void
}
```

### Usage Example

```tsx
import { useValue, useTypedValue } from '@/components/pc/drives';

// Untyped version
const Counter = () => {
  const { getValue, setValue } = useValue();
  
  return (
    <div>
      <p>Current value: {getValue()}</p>
      <button onClick={() => setValue(getValue() + 1)}>Increment</button>
    </div>
  );
};

// Typed version
const TypedCounter = () => {
  const { getValue, setValue } = useTypedValue<number>();
  
  return (
    <div>
      <p>Current value: {getValue()}</p>
      <button onClick={() => setValue(getValue() + 1)}>Increment</button>
    </div>
  );
};
```

## Contract Interactions

### Pregen Contract Write Hooks

For pregen-specific contract interactions, use the custom hook `usePregenTransaction`. This hook is designed to handle write operations that involve the pregen wallet context.

Example:
```tsx
import { usePregenTransaction } from '@/components/pc/drives';

const { writeContract } = usePregenTransaction();

const executePregenWrite = () => {
  writeContract({
    address: '0xPregenContractAddress',
    abi: CONTRACT_ABI,
    functionName: 'pregenFunction',
    args: [/* function arguments */],
    onSuccess: (txHash) => {
      console.log('Pregen transaction hash:', txHash);
    },
    onError: (error) => {
      console.error('Pregen transaction error:', error);
    },
  });
};
```

## Summary

### Notifications Hooks:

**Properties/Methods:**

- `notifications`: Array of notifications.
- `addNotification(notification)`: Adds a new notification.
- `addSilentNotification(notification)`: Adds a notification without a toast.
- `clearNotifications()`: Clears all notifications.
- `clearAllExceptPersistent()`: Clears all notifications except persistent ones.
- `markAllAsRead()`: Marks all notifications as read.
- `markAsRead(id)`: Marks a specific notification as read.
- `removeNotification(id)`: Removes a specific notification.
- `openNotificationPanel()`: Opens the notification panel.
- `unreadCount`: Returns the number of unread notifications.

### Pregen Wallet Login Hooks:

**Properties/Methods:**

- `pregenWalletSession`: The current wallet session data.
- `isLoginPregenSession`: Flag indicating if a session is active.
- `setPregenWalletSession(value)`: Sets the wallet session.
- `pregenAddress`: The EOA wallet address.
- `pregenSmartAccountAddress`: The smart account address.
- `pregenActiveAddress`: The currently active address.
- `pregenEncryptedKeyShare`: The encrypted key share.
- `pregenWalletId`: The wallet ID.
- `isSmartAccount`: Flag indicating if using smart account.

### Dispatch Windows Hooks:

**Properties/Methods:**

- `createDispatchWindow(config)`: Creates a new window.
- `closeDispatchWindow(id)`: Closes a specific window.
- `focusDispatchWindow(id)`: Focuses a specific window.
- `activeDispatchWindowId`: The ID of the active window.
- `dispatchWindows`: Array of all open windows.

### Navbar API Hooks:

**Properties/Methods:**

- `navbarContent`: Current navbar content.
- `setNavbarContent(content)`: Sets navbar content.
- `clearNavbarContent()`: Clears navbar content.
- `activeWindowId`: ID of the active window.
- `setActiveWindowId(windowId)`: Sets the active window.

### App Routing Hooks:

**Properties/Methods:**

- `navigate(path, params)`: Navigates to specified path with optional parameters.
- `back()`: Navigates to previous route.
- `currentRoute`: The currently active route.
- `params`: Parameters for current route.

**Core Components:**

- `AppRouterProvider`: Sets up routing context.
- `AppRouteRegistrar`: Registers available routes.
- `AppRouteRenderer`: Renders current route.

### Value Synchronization Hooks:

**Properties/Methods:**

- `getValue()`: Gets the current value.
- `setValue(value)`: Sets a new value.

### Contract Interactions:

- Pregen Contract Write: Use `usePregenTransaction`.

This README should serve as a comprehensive guide for developers on how to interact with the various hooks in your application. Adjust paths and examples as needed for your specific project setup. Happy coding!
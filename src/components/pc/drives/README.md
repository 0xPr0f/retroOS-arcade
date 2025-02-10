# App Hooks API Documentation

## Overview

This documentation provides an overview of the available hooks in the application. It covers:

- **Notifications Hooks**
- **Pregen Wallet Login Hooks**
- **Contract Interactions**
  - **Contract Read Hooks (via Wagmi)**
  - **Contract Write Hooks (via Wagmi)**
  - **Pregen Contract Write Hooks (`usePregenTransaction`)**

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
import { useNotifications } from 'your-notification-hook-path';

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

For managing pre-generated wallet sessions (pregen wallet login), the following interface is available:

```typescript
interface PregenContextType {
  pregenWalletSession: PregenWalletData | null;
  isLoginPregenSession: boolean;
  setPregenWalletSession: (value: PregenWalletData | null) => void;
  pregenAddress: string | undefined;
  pregenEncryptedKeyShare: string | undefined;
  pregenWalletId: string | undefined;
}
```

### Available Properties and Functions

- **`pregenWalletSession`**: Contains the current pregen wallet session data, or null if no session is active.

- **`isLoginPregenSession`**: A boolean flag indicating if a pregen wallet session is active.

- **`setPregenWalletSession(value)`**: Function to update the wallet session data.

- **`pregenAddress`**: The wallet address from the pregen session (if available).

- **`pregenEncryptedKeyShare`**: The encrypted key share for the pregen wallet (if available).

- **`pregenWalletId`**: A unique identifier for the pregen wallet.

### Usage Example

```tsx
import { usePregenWallet } from 'your-pregen-context-path';

const WalletComponent = () => {
  const {
    pregenWalletSession,
    isLoginPregenSession,
    setPregenWalletSession,
    pregenAddress,
    pregenEncryptedKeyShare,
    pregenWalletId,
  } = usePregenWallet();

  return (
    <div>
      {isLoginPregenSession ? (
        <div>
          <p>Address: {pregenAddress}</p>
          <p>Wallet ID: {pregenWalletId}</p>
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

## Contract Interactions

### Contract Read Hooks

Use the wagmi hook [`useReadContract`](https://wagmi.sh/react/api/hooks/useReadContract) to query data from your contracts.

Example:
```tsx
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

const { data, error, isLoading } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'getSomeData',
  args: [/* your arguments here */],
  query: {
    enabled: true,
    staleTime: 1000,
  },
});
```

### Contract Write Hooks

Use the wagmi hook [`useWriteContract`](https://wagmi.sh/react/api/hooks/useWriteContract) to perform write operations (state-changing functions) on your contracts.

Example:
```tsx
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

const { writeContract } = useWriteContract();

const executeWrite = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'transferFrom',
    args: [
      '0xSenderAddress',
      '0xRecipientAddress',
      123n,
    ],
    onSuccess: (txHash) => {
      console.log('Transaction hash:', txHash);
    },
    onError: (error) => {
      console.error('Error executing contract write:', error);
    },
  });
};
```

### Pregen Contract Write Hooks

For pregen-specific contract interactions, use the custom hook `usePregenTransaction`. This hook is designed to handle write operations that involve the pregen wallet context.

Example:
```tsx
import { usePregenTransaction } from 'your-pregen-hooks-path';

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
- `pregenAddress`: The wallet address.
- `pregenEncryptedKeyShare`: The encrypted key share.
- `pregenWalletId`: The wallet ID.

### Contract Interactions:

- Contract Read: Use `useReadContract` from Wagmi.
- Contract Write: Use `useWriteContract` from Wagmi.
- Pregen Contract Write: Use `usePregenTransaction`.

This README should serve as a comprehensive guide for developers on how to interact with the various hooks in your application. Adjust paths and examples as needed for your specific project setup. Happy coding!
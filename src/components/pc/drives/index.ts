// Toast Notifications for  notifications
export {
  useNotifications,
  NotificationProvider,
} from './Extensions/ToastNotifs'
// Pregen Session for storing and retrieving the Pregen wallet session
export { usePregenSession, PregenProvider } from './Storage&Hooks/PregenSession'
// Pregen Interactions for interactions with the Pregen wallet
export { usePregenTransaction } from './Storage&Hooks/PregenInteractions'
export { useHookTransaction } from './Storage&Hooks/HookInteraction'
// Dispatch Windows for dynamic windows
export { useDispatchWindows, DispatchWindowProvider } from './UI/dispatchWindow'
// Navbar API for dynamic navbar content
export { useNavbar, NavbarProvider } from './Storage&Hooks/NavbarApi'
// Easy syncronization of values between components
export {
  useTypedValue,
  useValue,
  ValueProvider,
} from './Storage&Hooks/ValueProvider'
// Internal App Router for dynamic routing between apps
export { InternalAppRouter } from './Storage&Hooks/InternalAppRouter'
// Provider that uses the InternalAppRouter for easy routing integration
export {
  useAppRouter,
  AppRouteRegistrar,
  AppRouterProvider,
  AppRouteRenderer,
  type ReactComponent,
  type Route,
} from './Storage&Hooks/AppRouterProvider'
//Default colors palette used in the app
export { weirdBlue, darkBlue, lightBlue, lightRed } from './Extensions/colors'
//UI Extensions for grid sizing
export { AutoGrid, GridItem } from './UI/UI_Extensions'
//Utils for clipboard and text shortening
export {
  copyToClipboard,
  shortenText,
  isValidAddress,
  categorizeIdentifier,
  loadExternalURL,
} from './Extensions/utils'

// Provider for storing and retrieving scores
export {
  GameScoreProvider,
  useGameScores,
  GameType,
} from './Storage&Hooks/ScoreProvider'

export { pinata } from './Interactions/pinata'

// Will honestly need to export a lot more but this is ok for now, it is
// what can be used the most for applications

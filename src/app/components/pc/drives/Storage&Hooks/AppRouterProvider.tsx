import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react'
import { InternalAppRouter } from './InternalAppRouter'

type ReactComponent = React.ComponentType<any>

type Route = {
  path: string
  component: ReactComponent
  params?: Record<string, string>
  pattern?: RegExp
}

interface RouterContextType {
  navigate: (path: string, params?: Record<string, string>) => void
  back: () => void
  currentRoute: Route | null
  params: Record<string, string>
}

const RouterContext = createContext<RouterContextType>({
  navigate: () => {},
  back: () => {},
  currentRoute: null,
  params: {},
})

const internalRouter = new InternalAppRouter()

interface RouterProviderProps {
  children: ReactNode
}

export const AppRouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)

  useEffect(() => {
    const unsubscribe = internalRouter.subscribe((route) => {
      setCurrentRoute(route)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    navigate: (path: string, params = {}) => internalRouter.navigate(path, params),
    back: () => internalRouter.back(),
    currentRoute,
    params: currentRoute?.params || {},
  }

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  )
}

export const useAppRouter = () => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useAppRouter must be used within AppRouterProvider')
  }
  return context
}

export const AppRouteRegistrar: React.FC<{
  routes: Array<{ path: string; component: ReactComponent }>
}> = ({ routes }) => {
  const registeredRef = useRef(false)

  useEffect(() => {
    if (!registeredRef.current) {
      routes.forEach(({ path, component }) => {
        internalRouter.register(path, component)
      })
      registeredRef.current = true
    }
  }, [routes])

  return null
}

export const AppRouteRenderer: React.FC = () => {
  const { currentRoute } = useAppRouter()

  if (!currentRoute) {
    return null
  }

  const Component = currentRoute.component
  return <Component {...currentRoute.params} />
}

export { type Route, type ReactComponent }
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { InternalAppRouter } from './InternalAppRouter'

type ReactComponent = React.ComponentType<any>

type Route = {
  path: string
  component: ReactComponent
  params?: Record<string, string>
}
interface RouterContextType {
  navigate: (path: string, params?: Record<string, string>) => void
  back: () => void
  currentRoute: Route | null
  params: Record<string, string>
}

const RouterContext = createContext<RouterContextType | null>(null)

interface RouterProviderProps {
  children: ReactNode
}

export const AppRouterProvider: React.FC<RouterProviderProps> = ({
  children,
}) => {
  const router = new InternalAppRouter()
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)

  useEffect(() => {
    const unsubscribe = router.subscribe((route) => {
      setCurrentRoute(route)
    })

    return () => unsubscribe()
  }, [])

  const contextValue: RouterContextType = {
    navigate: (path, params = {}) => router.navigate(path, params),
    back: () => router.back(),
    currentRoute,
    params: currentRoute?.params || {},
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  )
}

export const useAppRouter = () => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}

export const useAppRoutes = (
  routes: Array<{ path: string; component: ReactComponent }>
) => {
  const router = new InternalAppRouter()

  useEffect(() => {
    routes.forEach(({ path, component }) => {
      router.register(path, component)
    })
  }, [routes])
}

export const RouteRenderer: React.FC = () => {
  const { currentRoute } = useAppRouter()

  if (!currentRoute) {
    return null
  }

  const Component = currentRoute.component
  return <Component {...currentRoute.params} />
}
export { type Route, type ReactComponent }

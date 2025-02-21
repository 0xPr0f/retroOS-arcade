type Route = {
  path: string
  component: any
  params?: Record<string, string>
  pattern?: RegExp
}

export class InternalAppRouter {
  private routes: Map<string, Route>
  private currentRoute: Route | null
  private history: Route[]
  private subscribers: Set<(route: Route) => void>

  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.history = []
    this.subscribers = new Set()
  }

  private createRoutePattern(path: string): RegExp {
    const pattern = path.replace(/:[a-zA-Z]+/g, '([^/]+)').replace(/\//g, '\\/')
    return new RegExp(`^${pattern}$`)
  }

  public register(path: string, component: any): void {
    if (this.routes.has(path)) {
      console.warn(`Route ${path} is already registered. Overwriting...`)
    }

    const route: Route = {
      path,
      component,
      pattern: this.createRoutePattern(path),
    }

    this.routes.set(path, route)
  }

  private findRoute(path: string): Route | null {
    if (this.routes.has(path)) {
      return this.routes.get(path) || null
    }

    for (const route of this.routes.values()) {
      if (route.pattern && route.pattern.test(path)) {
        return route
      }
    }

    return null
  }

  private extractParams(route: Route, path: string): Record<string, string> {
    const params: Record<string, string> = {}

    if (!route.pattern) return params

    const paramNames = route.path.match(/:[a-zA-Z]+/g) || []
    const values = path.match(route.pattern) || []

    paramNames.forEach((param, index) => {
      const paramName = param.slice(1) // Remove : prefix
      params[paramName] = values[index + 1]
    })

    return params
  }

  public navigate(
    path: string,
    additionalParams: Record<string, string> = {}
  ): void {
    const route = this.findRoute(path)

    if (!route) {
      console.error(`Route not found: ${path}`)
      return
    }

    if (this.currentRoute) {
      this.history.push({ ...this.currentRoute })
    }

    const routeParams = this.extractParams(route, path)
    const params = { ...routeParams, ...additionalParams }

    this.currentRoute = {
      ...route,
      params,
    }

    this.notifySubscribers()
  }

  public back(): void {
    if (this.history.length === 0) {
      console.warn('No previous route in history')
      return
    }

    const previousRoute = this.history.pop()!
    this.currentRoute = previousRoute
    this.notifySubscribers()
  }

  public subscribe(callback: (route: Route) => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public getCurrentRoute(): Route | null {
    return this.currentRoute
  }

  public getParams(): Record<string, string> {
    return this.currentRoute?.params || {}
  }

  private notifySubscribers(): void {
    if (!this.currentRoute) return

    this.subscribers.forEach((callback) => {
      callback(this.currentRoute!)
    })
  }
}

import React from 'react'

/*

const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  )
}

const AppContent: React.FC = () => {
  // Register routes
  useRoutes([
    { path: '/', component: Home },
    { path: '/user/:userId', component: UserProfile },
    { path: '/settings', component: Settings },
  ])

  return (
    <div className="app">
      <nav>
        <NavigationButtons />
      </nav>
      <main>
        <RouteRenderer />
      </main>
    </div>
  )
}

// Example components
const Home: React.FC = () => {
  return <h1>Home Page</h1>
}

interface UserProfileProps {
  userId: string
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  return <h1>User Profile {userId}</h1>
}

const Settings: React.FC = () => {
  return <h1>Settings</h1>
}

// Navigation buttons component
const NavigationButtons: React.FC = () => {
  const { navigate, back } = useRouter()

  return (
    <div>
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/user/123')}>User Profile</button>
      <button onClick={() => navigate('/settings')}>Settings</button>
      <button onClick={back}>Back</button>
    </div>
  )
}


*/
const RealmClashGame = () => {
  return <div>RealmClashGame</div>
}

export default RealmClashGame

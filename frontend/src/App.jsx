import { RouterProvider } from 'react-router'
import { router } from './route.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App

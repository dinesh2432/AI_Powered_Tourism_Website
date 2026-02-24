import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import HomeContent from './pages/Home/HomeContent'
import MyTripPage from './pages/Trips/MyTripPage'
import ProfilePage from './pages/Profile/ProfilePage'
import ExplorePage from './pages/Explore/ExplorePage'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/emailVerify" element={<EmailVerify />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Routes - Nested */}
        <Route path="/" element={<Dashboard />}>
          <Route index element={<HomeContent />} />  
          <Route path="trips" element={<MyTripPage />} />      
          <Route path="profile" element={<ProfilePage />} />  
          <Route path="explore" element={<ExplorePage />} />  
        </Route>
      </Routes>
    </>
  )
}

export default App
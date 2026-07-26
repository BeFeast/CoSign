import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './screens/Landing'
import Library from './screens/Library'
import NewWork from './screens/NewWork'
import WorkDetail from './screens/WorkDetail'
import Collaborators from './screens/Collaborators'
import CollaboratorDetail from './screens/CollaboratorDetail'
import Profile from './screens/Profile'
import Notifications from './screens/Notifications'
import CreditPackPublic from './screens/CreditPackPublic'

const withLayout = (el: React.ReactNode) => <Layout>{el}</Layout>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={withLayout(<Library />)} />
      <Route path="/app/new" element={withLayout(<NewWork />)} />
      <Route path="/app/work/:id" element={withLayout(<WorkDetail />)} />
      <Route path="/app/collaborators" element={withLayout(<Collaborators />)} />
      <Route path="/app/collaborators/:id" element={withLayout(<CollaboratorDetail />)} />
      <Route path="/app/profile" element={withLayout(<Profile />)} />
      <Route path="/app/notifications" element={withLayout(<Notifications />)} />
      <Route path="/p/:token" element={<CreditPackPublic />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}

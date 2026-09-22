import { Route, Routes } from 'react-router-dom'
import { Home } from '../pages/Home'
import { Missions } from '../pages/Missions'
import { Tasks } from '../pages/Tasks'
import { TaskDetail } from '../pages/TaskDetail'
import { History } from '../pages/History'
import { Stats } from '../pages/Stats'
import { Settings } from '../pages/Settings'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/tasks/:taskId" element={<TaskDetail />} />
      <Route path="/history" element={<History />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

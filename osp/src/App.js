import { Routes, Route, Redirect } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './members/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Course from './pages/Course'


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} 
          />
          <Route 
            path="/dashboard/topic/:topicName" 
            element={<ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} 
          />
          <Route path="/course" element={<Course/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;

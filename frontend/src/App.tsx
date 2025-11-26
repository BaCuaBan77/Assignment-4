import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import SensorDetail from './pages/SensorDetail';
import Owners from './pages/Owners';
import OwnerDetail from './pages/OwnerDetail';
import Alarms from './pages/Alarms';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/sensors/:id" element={<SensorDetail />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/owners/:id" element={<OwnerDetail />} />
        <Route path="/alarms" element={<Alarms />} />
      </Routes>
    </Layout>
  );
}

export default App;


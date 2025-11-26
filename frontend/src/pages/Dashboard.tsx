import { useEffect, useState } from 'react';
import { sensorApi, SensorWithDetails } from '../api/sensors';
import { alarmApi, Alarm } from '../api/alarms';
import { formatTimestamp } from '../utils/dateUtils';
import './Dashboard.css';

function Dashboard() {
  const [sensors, setSensors] = useState<SensorWithDetails[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sensorsData, alarmsData] = await Promise.all([
          sensorApi.getAll(),
          alarmApi.getAll(),
        ]);

        // Fetch details for each sensor
        const sensorsWithDetails = await Promise.all(
          sensorsData.map(async (sensor) => {
            try {
              return await sensorApi.getById(sensor.id, true) as SensorWithDetails;
            } catch {
              return sensor as SensorWithDetails;
            }
          })
        );

        setSensors(sensorsWithDetails);
        setAlarms(alarmsData.slice(0, 5)); // Show latest 5 alarms
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a map of sensor_id to sensor name for quick lookup
  const sensorNameMap = new Map(sensors.map(s => [s.id, s.name]));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sensors</h3>
          <p className="stat-value">{sensors.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Alarms</h3>
          <p className="stat-value">{alarms.length}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Alarms</h3>
        {alarms.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sensor Name</th>
                <th>Alarm Value</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td>{sensorNameMap.get(alarm.sensor_id) || alarm.sensor_id}</td>
                  <td>{alarm.alarm_value}</td>
                  <td>{formatTimestamp(alarm.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent alarms</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Sensors Overview</h3>
        <div className="sensors-grid">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="sensor-card">
              <h4>{sensor.name}</h4>
              <p><strong>Type:</strong> {sensor.sensor_type}</p>
              <p><strong>Latest Value:</strong> {sensor.latest_value ?? 'N/A'} {sensor.unit}</p>
              <p><strong>Threshold:</strong> {sensor.threshold} {sensor.unit}</p>
              {sensor.location && <p><strong>Location:</strong> {sensor.location}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


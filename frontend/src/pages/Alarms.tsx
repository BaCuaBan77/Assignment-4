import { useEffect, useState } from 'react';
import { alarmApi, Alarm } from '../api/alarms';
import { formatTimestamp } from '../utils/dateUtils';
import './Alarms.css';

function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        setLoading(true);
        const data = await alarmApi.getAll();
        setAlarms(data);
      } catch (err) {
        setError('Failed to load alarms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlarms();
  }, []);

  if (loading) {
    return <div className="loading">Loading alarms...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="alarms-page">
      <div className="page-header">
        <h2>Alarms</h2>
      </div>

      {alarms.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sensor ID</th>
              <th>Alarm Value</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr key={alarm.id} className="alarm-row">
                <td>{alarm.id}</td>
                <td>{alarm.sensor_id}</td>
                <td className="alarm-value">{alarm.alarm_value}</td>
                <td>{formatTimestamp(alarm.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No alarms found</p>
      )}
    </div>
  );
}

export default Alarms;


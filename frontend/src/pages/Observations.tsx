import { useEffect, useState } from 'react';
import { observationApi, Observation } from '../api/observations';
import { formatTimestamp } from '../utils/dateUtils';
import './Observations.css';

function Observations() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        setLoading(true);
        const data = await observationApi.getAll();
        setObservations(data);
      } catch (err) {
        setError('Failed to load observations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, []);

  if (loading) {
    return <div className="loading">Loading observations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="observations-page">
      <div className="page-header">
        <h2>Observations</h2>
      </div>

      {observations.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sensor ID</th>
              <th>Value</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {observations.map((observation) => (
              <tr key={observation.id}>
                <td>{observation.id}</td>
                <td>{observation.sensor_id}</td>
                <td>{observation.value}</td>
                <td>{formatTimestamp(observation.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No observations found</p>
      )}
    </div>
  );
}

export default Observations;


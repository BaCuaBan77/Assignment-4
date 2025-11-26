import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sensorApi, SensorWithDetails } from '../api/sensors';
import { ownerApi, Owner } from '../api/owners';
import { locationApi, Location } from '../api/locations';
import { alarmApi, Alarm } from '../api/alarms';
import { observationApi, Observation } from '../api/observations';
import { formatTimestamp } from '../utils/dateUtils';
import './SensorDetail.css';

interface SensorFormData {
  name: string;
  sensor_type: string;
  unit: string;
  threshold: string;
  owner_id: string;
  location_id: string;
}

function SensorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<SensorWithDetails | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [submittingObservation, setSubmittingObservation] = useState(false);
  const [submittingSensor, setSubmittingSensor] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<SensorFormData>({
    name: '',
    sensor_type: '',
    unit: '',
    threshold: '',
    owner_id: '',
    location_id: '',
  });
  const [observationData, setObservationData] = useState({
    value: '',
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [sensorData, ownersData, locationsData] = await Promise.all([
          sensorApi.getById(id, true) as Promise<SensorWithDetails>,
          ownerApi.getAll(),
          locationApi.getAll(),
        ]);

        setSensor(sensorData);
        setOwners(ownersData);
        setLocations(locationsData);

        // Find owner and location from already fetched data
        if (sensorData.owner_id) {
          const foundOwner = ownersData.find(o => o.id === sensorData.owner_id);
          if (foundOwner) setOwner(foundOwner);
        }

        if (sensorData.location_id) {
          const foundLocation = locationsData.find(l => l.id === sensorData.location_id);
          if (foundLocation) setLocation(foundLocation);
        }

        // Fetch alarms and observations for this sensor
        const [alarmsData, observationsData] = await Promise.all([
          alarmApi.getBySensorId(id),
          observationApi.getBySensorId(id, 50), // Get last 50 observations
        ]);

        setAlarms(alarmsData);
        setObservations(observationsData);

        // Set form data for editing
        setFormData({
          name: sensorData.name,
          sensor_type: sensorData.sensor_type,
          unit: sensorData.unit,
          threshold: sensorData.threshold.toString(),
          owner_id: sensorData.owner_id,
          location_id: sensorData.location_id,
        });
      } catch (err) {
        setError('Failed to load sensor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sensor? This will also delete all related observations and alarms.')) {
      return;
    }

    try {
      await sensorApi.delete(id!);
      navigate('/sensors');
    } catch (err) {
      alert('Failed to delete sensor');
      console.error(err);
    }
  };

  const handleUpdateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmittingSensor(true);
      const sensorPayload = {
        name: formData.name,
        sensor_type: formData.sensor_type,
        unit: formData.unit,
        threshold: parseFloat(formData.threshold),
        owner_id: formData.owner_id,
        location_id: formData.location_id,
      };

      await sensorApi.update(id, sensorPayload);
      
      // Refresh sensor data
      const updatedSensor = await sensorApi.getById(id, true) as SensorWithDetails;
      setSensor(updatedSensor);
      setShowEditModal(false);
    } catch (err) {
      alert('Failed to update sensor');
      console.error(err);
    } finally {
      setSubmittingSensor(false);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmittingObservation(true);
      await observationApi.create({
        sensor_id: id,
        value: parseFloat(observationData.value),
        timestamp: Date.now(),
      });

      // Refresh observations and sensor data
      const [updatedObservations, updatedSensor] = await Promise.all([
        observationApi.getBySensorId(id, 50),
        sensorApi.getById(id, true) as Promise<SensorWithDetails>,
      ]);

      setObservations(updatedObservations);
      setSensor(updatedSensor);

      // Refresh alarms in case a new one was created
      const updatedAlarms = await alarmApi.getBySensorId(id);
      setAlarms(updatedAlarms);

      setShowObservationModal(false);
      setObservationData({
        value: '',
      });
    } catch (err) {
      alert('Failed to add observation');
      console.error(err);
    } finally {
      setSubmittingObservation(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading sensor details...</div>;
  }

  if (error || !sensor) {
    return (
      <div className="error">
        {error || 'Sensor not found'}
        <button className="btn btn-secondary" onClick={() => navigate('/sensors')} style={{ marginLeft: '1rem' }}>
          Back to Sensors
        </button>
      </div>
    );
  }

  return (
    <div className="sensor-detail">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/sensors')}>
          ← Back to Sensors
        </button>
        <div className="header-actions">
          <button className="btn btn-edit" onClick={handleEdit}>
            Edit Sensor
          </button>
          <button className="btn btn-delete" onClick={handleDelete}>
            Delete Sensor
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Sensor Information */}
        <div className="detail-section">
          <h2>{sensor.name}</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Sensor ID</label>
              <p>{sensor.id}</p>
            </div>
            <div className="info-item">
              <label>Type</label>
              <p>{sensor.sensor_type}</p>
            </div>
            <div className="info-item">
              <label>Unit</label>
              <p>{sensor.unit}</p>
            </div>
            <div className="info-item">
              <label>Threshold</label>
              <p>{sensor.threshold} {sensor.unit}</p>
            </div>
            <div className="info-item">
              <label>Latest Value</label>
              <p className={sensor.latest_value && sensor.latest_value > sensor.threshold ? 'value-exceeded' : ''}>
                {sensor.latest_value !== undefined ? `${sensor.latest_value} ${sensor.unit}` : 'N/A'}
              </p>
            </div>
            <div className="info-item">
              <label>Max Value</label>
              <p>{sensor.max_value !== undefined ? `${sensor.max_value} ${sensor.unit}` : 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Min Value</label>
              <p>{sensor.min_value !== undefined ? `${sensor.min_value} ${sensor.unit}` : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="detail-section">
          <h3>Owner Information</h3>
          {owner ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{owner.first_name} {owner.last_name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{owner.email_address}</p>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <p>{new Date(owner.dob).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p>Owner information not available</p>
          )}
        </div>

        {/* Location Information */}
        <div className="detail-section">
          <h3>Location Information</h3>
          {location ? (
            <div className="info-grid">
              <div className="info-item">
                <label>City</label>
                <p>{location.city}</p>
              </div>
              <div className="info-item">
                <label>Country</label>
                <p>{location.country}</p>
              </div>
              <div className="info-item">
                <label>Coordinates</label>
                <p>{location.latitude}, {location.longitude}</p>
              </div>
            </div>
          ) : (
            <p>Location information not available</p>
          )}
        </div>

        {/* Observations Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3>Observations</h3>
            <button className="btn btn-primary" onClick={() => setShowObservationModal(true)}>
              Add Observation
            </button>
          </div>
          {observations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => (
                  <tr key={obs.id}>
                    <td className={obs.value > sensor.threshold ? 'value-exceeded' : ''}>
                      {obs.value} {sensor.unit}
                    </td>
                    <td>{formatTimestamp(obs.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No observations found</p>
          )}
        </div>

        {/* Alarms Section */}
        <div className="detail-section">
          <h3>Alarm History</h3>
          {alarms.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alarm Value</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map((alarm) => (
                  <tr key={alarm.id} className="alarm-row">
                    <td className="alarm-value">{alarm.alarm_value} {sensor.unit}</td>
                    <td>{formatTimestamp(alarm.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No alarms found</p>
          )}
        </div>
      </div>

      {/* Edit Sensor Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !submittingSensor && setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Sensor</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
                disabled={submittingSensor}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateSensor} className="sensor-form">
              <div className="form-group">
                <label htmlFor="edit-name">Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-sensor_type">Sensor Type *</label>
                <input
                  type="text"
                  id="edit-sensor_type"
                  value={formData.sensor_type}
                  onChange={(e) => setFormData({ ...formData, sensor_type: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-unit">Unit *</label>
                <input
                  type="text"
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-threshold">Threshold *</label>
                <input
                  type="number"
                  id="edit-threshold"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-owner_id">Owner *</label>
                <select
                  id="edit-owner_id"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  required
                >
                  <option value="">Select Owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.first_name} {owner.last_name} ({owner.email_address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-location_id">Location *</label>
                <select
                  id="edit-location_id"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.city}, {location.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={submittingSensor}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingSensor}
                >
                  {submittingSensor ? (
                    <>
                      <span className="spinner"></span>
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Observation Modal */}
      {showObservationModal && (
        <div className="modal-overlay" onClick={() => !submittingObservation && setShowObservationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Observation</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowObservationModal(false)}
                disabled={submittingObservation}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddObservation} className="sensor-form">
              <div className="form-group">
                <label htmlFor="obs-value">Value ({sensor.unit}) *</label>
                <input
                  type="number"
                  id="obs-value"
                  step="0.01"
                  value={observationData.value}
                  onChange={(e) => setObservationData({ ...observationData, value: e.target.value })}
                  required
                />
                <small>The observation will be recorded with the current timestamp automatically.</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowObservationModal(false)}
                  disabled={submittingObservation}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingObservation}
                >
                  {submittingObservation ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Observation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorDetail;


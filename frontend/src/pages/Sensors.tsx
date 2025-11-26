import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sensorApi, Sensor } from '../api/sensors';
import { ownerApi, Owner } from '../api/owners';
import { locationApi, Location } from '../api/locations';
import './Sensors.css';

interface SensorFormData {
  name: string;
  sensor_type: string;
  unit: string;
  threshold: string;
  owner_id: string;
  location_id: string;
}

function Sensors() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [ownerNameMap, setOwnerNameMap] = useState<Map<string, string>>(new Map());
  const [locationMap, setLocationMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<SensorFormData>({
    name: '',
    sensor_type: '',
    unit: '',
    threshold: '',
    owner_id: '',
    location_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // First, fetch sensors
        const sensorsData = await sensorApi.getAll();
        setSensors(sensorsData);

        // Extract unique owner and location IDs from sensors
        const uniqueOwnerIds = [...new Set(sensorsData.map(s => s.owner_id))];
        const uniqueLocationIds = [...new Set(sensorsData.map(s => s.location_id))];

        // Fetch only the fullnames/locations we need using batch endpoints (Redis cache)
        const [fullnamesMap, locationStringsMap, ownersData, locationsData] = await Promise.all([
          ownerApi.getFullnamesBatch(uniqueOwnerIds),
          locationApi.getLocationStringsBatch(uniqueLocationIds),
          ownerApi.getAll(), // Still needed for the form dropdown
          locationApi.getAll(), // Still needed for the form dropdown
        ]);

        // Store the maps for display
        setOwners(ownersData);
        setLocations(locationsData);
        
        // Store the cached fullnames and locations in component state for rendering
        // (We'll use these in the render)
        setOwnerNameMap(new Map(Object.entries(fullnamesMap)));
        setLocationMap(new Map(Object.entries(locationStringsMap)));
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (sensorId: string) => {
    navigate(`/sensors/${sensorId}`);
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      sensor_type: '',
      unit: '',
      threshold: '',
      owner_id: '',
      location_id: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      sensor_type: '',
      unit: '',
      threshold: '',
      owner_id: '',
      location_id: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sensorPayload = {
        name: formData.name,
        sensor_type: formData.sensor_type,
        unit: formData.unit,
        threshold: parseFloat(formData.threshold),
        owner_id: formData.owner_id,
        location_id: formData.location_id,
      };

      await sensorApi.create(sensorPayload);

      // Refresh sensors list
      const updatedSensors = await sensorApi.getAll();
      setSensors(updatedSensors);

      // Refresh owner and location maps for the updated sensor list
      const uniqueOwnerIds = [...new Set(updatedSensors.map(s => s.owner_id))];
      const uniqueLocationIds = [...new Set(updatedSensors.map(s => s.location_id))];
      
      const [fullnamesMap, locationStringsMap] = await Promise.all([
        ownerApi.getFullnamesBatch(uniqueOwnerIds),
        locationApi.getLocationStringsBatch(uniqueLocationIds),
      ]);

      setOwnerNameMap(new Map(Object.entries(fullnamesMap)));
      setLocationMap(new Map(Object.entries(locationStringsMap)));

      handleCloseModal();
    } catch (err) {
      alert('Failed to save sensor. Please check all fields are valid.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading sensors...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="sensors-page">
      <div className="page-header">
        <h2>Sensors</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          Add Sensor
        </button>
      </div>

      {sensors.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Unit</th>
              <th>Threshold</th>
              <th>Owner</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
              <tr 
                key={sensor.id} 
                className="clickable-row"
                onClick={() => handleRowClick(sensor.id)}
              >
                <td><strong>{sensor.name}</strong></td>
                <td>{sensor.sensor_type}</td>
                <td>{sensor.unit}</td>
                <td>{sensor.threshold}</td>
                <td>{ownerNameMap.get(sensor.owner_id) || sensor.owner_id}</td>
                <td>{locationMap.get(sensor.location_id) || sensor.location_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No sensors found</p>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Sensor</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="sensor-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sensor_type">Sensor Type *</label>
                <input
                  type="text"
                  id="sensor_type"
                  value={formData.sensor_type}
                  onChange={(e) => setFormData({ ...formData, sensor_type: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <input
                  type="text"
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="threshold">Threshold *</label>
                <input
                  type="number"
                  id="threshold"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner_id">Owner *</label>
                <select
                  id="owner_id"
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
                <label htmlFor="location_id">Location *</label>
                <select
                  id="location_id"
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sensors;


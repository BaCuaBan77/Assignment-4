import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ownerApi, Owner } from '../api/owners';
import { sensorApi, Sensor } from '../api/sensors';
import './OwnerDetail.css';

interface OwnerFormData {
  first_name: string;
  last_name: string;
  email_address: string;
  dob: string;
}

function OwnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingOwner, setSubmittingOwner] = useState(false);
  const [formData, setFormData] = useState<OwnerFormData>({
    first_name: '',
    last_name: '',
    email_address: '',
    dob: '',
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [ownerData, sensorsData] = await Promise.all([
          ownerApi.getById(id),
          sensorApi.getByOwnerId(id),
        ]);

        setOwner(ownerData);
        setSensors(sensorsData);

        // Set form data for editing
        setFormData({
          first_name: ownerData.first_name,
          last_name: ownerData.last_name,
          email_address: ownerData.email_address,
          dob: ownerData.dob,
        });
      } catch (err) {
        setError('Failed to load owner details');
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
    if (!window.confirm('Are you sure you want to delete this owner? This will also delete all related sensors, observations, and alarms.')) {
      return;
    }

    try {
      await ownerApi.delete(id!);
      navigate('/owners');
    } catch (err) {
      alert('Failed to delete owner. Make sure there are no sensors associated with this owner.');
      console.error(err);
    }
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmittingOwner(true);
      const ownerPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        dob: formData.dob,
      };

      const updatedOwner = await ownerApi.update(id, ownerPayload);
      setOwner(updatedOwner);
      setShowEditModal(false);
    } catch (err) {
      alert('Failed to update owner');
      console.error(err);
    } finally {
      setSubmittingOwner(false);
    }
  };

  const handleSensorClick = (sensorId: string) => {
    navigate(`/sensors/${sensorId}`);
  };

  if (loading) {
    return <div className="loading">Loading owner details...</div>;
  }

  if (error || !owner) {
    return (
      <div className="error">
        {error || 'Owner not found'}
        <button className="btn btn-secondary" onClick={() => navigate('/owners')} style={{ marginLeft: '1rem' }}>
          Back to Owners
        </button>
      </div>
    );
  }

  return (
    <div className="owner-detail">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/owners')}>
          ← Back to Owners
        </button>
        <div className="header-actions">
          <button className="btn btn-edit" onClick={handleEdit}>
            Edit Owner
          </button>
          <button className="btn btn-delete" onClick={handleDelete}>
            Delete Owner
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Owner Information */}
        <div className="detail-section">
          <h2>{owner.first_name} {owner.last_name}</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>First Name</label>
              <p>{owner.first_name}</p>
            </div>
            <div className="info-item">
              <label>Last Name</label>
              <p>{owner.last_name}</p>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <p>{owner.email_address}</p>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <p>{new Date(owner.dob).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Sensors Section */}
        <div className="detail-section">
          <h3>Sensors ({sensors.length})</h3>
          {sensors.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sensor Name</th>
                  <th>Type</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((sensor) => (
                  <tr 
                    key={sensor.id} 
                    className="clickable-row"
                    onClick={() => handleSensorClick(sensor.id)}
                  >
                    <td><strong>{sensor.name}</strong></td>
                    <td>{sensor.sensor_type}</td>
                    <td>{sensor.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No sensors found for this owner</p>
          )}
        </div>
      </div>

      {/* Edit Owner Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !submittingOwner && setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Owner</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
                disabled={submittingOwner}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateOwner} className="owner-form">
              <div className="form-group">
                <label htmlFor="edit-first_name">First Name *</label>
                <input
                  type="text"
                  id="edit-first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-last_name">Last Name *</label>
                <input
                  type="text"
                  id="edit-last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email_address">Email Address *</label>
                <input
                  type="email"
                  id="edit-email_address"
                  value={formData.email_address}
                  onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-dob">Date of Birth *</label>
                <input
                  type="date"
                  id="edit-dob"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={submittingOwner}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingOwner}
                >
                  {submittingOwner ? (
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
    </div>
  );
}

export default OwnerDetail;


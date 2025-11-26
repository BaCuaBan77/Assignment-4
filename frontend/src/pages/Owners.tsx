import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerApi, Owner } from '../api/owners';
import './Owners.css';

interface OwnerFormData {
  first_name: string;
  last_name: string;
  email_address: string;
  dob: string;
}

function Owners() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<OwnerFormData>({
    first_name: '',
    last_name: '',
    email_address: '',
    dob: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ownersData = await ownerApi.getAll();
        setOwners(ownersData);
      } catch (err) {
        setError('Failed to load owners');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (ownerId: string) => {
    navigate(`/owners/${ownerId}`);
  };

  const handleOpenModal = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email_address: '',
      dob: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      first_name: '',
      last_name: '',
      email_address: '',
      dob: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerApi.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        dob: formData.dob,
      });

      // Refresh owners list
      const updatedOwners = await ownerApi.getAll();
      setOwners(updatedOwners);
      handleCloseModal();
    } catch (err) {
      alert('Failed to create owner. Please check all fields are valid.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading owners...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="owners-page">
      <div className="page-header">
        <h2>Owners</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          Add Owner
        </button>
      </div>

      {owners.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr 
                key={owner.id} 
                className="clickable-row"
                onClick={() => handleRowClick(owner.id)}
              >
                <td><strong>{owner.first_name}</strong></td>
                <td><strong>{owner.last_name}</strong></td>
                <td>{owner.email_address}</td>
                <td>{new Date(owner.dob).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No owners found</p>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Owner</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="owner-form">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_address">Email Address *</label>
                <input
                  type="email"
                  id="email_address"
                  value={formData.email_address}
                  onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth *</label>
                <input
                  type="date"
                  id="dob"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
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

export default Owners;


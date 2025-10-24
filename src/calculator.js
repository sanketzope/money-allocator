import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MoneyPotAllocator() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Buy Phone', percentage: 30 },
    { id: 2, name: 'Travel', percentage: 25 },
    { id: 3, name: 'Mutual Funds', percentage: 45 }
  ]);
  const [totalAmount, setTotalAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [categories, totalAmount]);

const loadData = () => {
  try {
    const savedData = localStorage.getItem('moneypot-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.categories) setCategories(data.categories);
      if (data.totalAmount) setTotalAmount(data.totalAmount);
    }
  } catch (error) {
    console.log('No saved data found or error loading data');
  } finally {
    setIsLoading(false);
  }
};

const saveData = () => {
  try {
    const data = { categories, totalAmount };
    localStorage.setItem('moneypot-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const resetData = () => {
  if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
    try {
      localStorage.removeItem('moneypot-data');
      setCategories([
        { id: 1, name: 'Buy Phone', percentage: 30 },
        { id: 2, name: 'Travel', percentage: 25 },
        { id: 3, name: 'Mutual Funds', percentage: 45 }
      ]);
      setTotalAmount('');
      alert('Data reset successfully!');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
};


  const calculateAllocation = (percentage) => {
    if (!totalAmount || totalAmount <= 0) return 0;
    return (totalAmount * percentage / 100).toFixed(2);
  };

  const getTotalPercentage = () => {
    return categories.reduce((sum, cat) => sum + (cat.percentage || 0), 0);
  };

  const getRemainingAmount = () => {
    const allocated = categories.reduce((sum, cat) => sum + parseFloat(calculateAllocation(cat.percentage)), 0);
    return (parseFloat(totalAmount) - allocated).toFixed(2);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        percentage: 0
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updatePercentage = (id, percent) => {
    const value = parseFloat(percent) || 0;
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, percentage: Math.min(100, Math.max(0, value)) } : cat
    ));
  };

  const startEditing = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (id) => {
    if (editName.trim()) {
      setCategories(categories.map(cat =>
        cat.id === id ? { ...cat, name: editName.trim() } : cat
      ));
    }
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const totalPercentage = getTotalPercentage();
  const isBalanced = totalPercentage === 100;

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">💰 Money Pot Allocator</h3>
                  <small>Divide your money into different savings goals</small>
                </div>
                <button 
                  className="btn btn-sm btn-light"
                  onClick={resetData}
                  title="Reset all data"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Auto-save indicator */}
              <div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
                <small>💾 <strong>Auto-save enabled!</strong> Your data is automatically saved and will persist after refresh.</small>
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>

              {/* Total Amount Input */}
              <div className="mb-4">
                <label className="form-label fw-bold fs-5">Total Amount Available</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter total amount (e.g., 80000)"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Allocation Status */}
              {totalAmount > 0 && (
                <div className={`alert ${isBalanced ? 'alert-success' : totalPercentage > 100 ? 'alert-danger' : 'alert-warning'} mb-4`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Total Percentage Allocated:</strong> {totalPercentage.toFixed(2)}%
                    </div>
                    <div>
                      {isBalanced ? (
                        <span className="badge bg-success">✓ Perfectly Balanced!</span>
                      ) : totalPercentage > 100 ? (
                        <span className="badge bg-danger">⚠ Over Allocated by {(totalPercentage - 100).toFixed(2)}%</span>
                      ) : (
                        <span className="badge bg-warning text-dark">⚠ Under Allocated by {(100 - totalPercentage).toFixed(2)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Add New Category */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h5 className="card-title">➕ Add New Savings Goal</h5>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Emergency Fund, Vacation, Laptop"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button
                      className="btn btn-success"
                      onClick={addCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Add Goal
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">📊 Money Allocation Breakdown</h5>
                {categories.length === 0 ? (
                  <div className="alert alert-info">
                    No savings goals yet. Add your first goal above!
                  </div>
                ) : (
                  <div className="row g-3">
                    {categories.map((category) => (
                      <div key={category.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 border-success shadow-sm">
                          <div className="card-body">
                            {/* Category Name */}
                            {editingId === category.id ? (
                              <div className="mb-3">
                                <input
                                  type="text"
                                  className="form-control form-control-sm mb-2"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') saveEdit(category.id);
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  autoFocus
                                />
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-success flex-fill"
                                    onClick={() => saveEdit(category.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary flex-fill"
                                    onClick={cancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="card-title mb-0 text-truncate" style={{maxWidth: '70%'}}>
                                  {category.name}
                                </h6>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => startEditing(category.id, category.name)}
                                    title="Rename"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => deleteCategory(category.id)}
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Percentage Input */}
                            <div className="mb-3">
                              <label className="form-label small mb-1">Allocation Percentage</label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={category.percentage || ''}
                                  onChange={(e) => updatePercentage(category.id, e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>

                            {/* Money Allocation Display */}
                            <div className="mt-3 p-3 rounded bg-success bg-opacity-10 border border-success">
                              <div className="text-center">
                                <small className="text-muted d-block mb-1">Amount Allocated</small>
                                <div className="display-6 fw-bold text-success">
                                  ₹{calculateAllocation(category.percentage)}
                                </div>
                                {totalAmount > 0 && (
                                  <small className="text-muted">
                                    ({category.percentage}% of ₹{parseFloat(totalAmount).toFixed(2)})
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Section */}
              {categories.length > 0 && totalAmount > 0 && (
                <div className="card bg-info bg-opacity-10 border-info mt-4">
                  <div className="card-header bg-info bg-opacity-25">
                    <h5 className="mb-0">📈 Allocation Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Goal</th>
                            <th className="text-center">Percentage</th>
                            <th className="text-end">Amount Allocated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat.id}>
                              <td className="fw-bold">{cat.name}</td>
                              <td className="text-center">
                                <span className="badge bg-primary">{cat.percentage}%</span>
                              </td>
                              <td className="text-end fw-bold text-success">
                                ₹{calculateAllocation(cat.percentage)}
                              </td>
                            </tr>
                          ))}
                          <tr className="table-active">
                            <td className="fw-bold">TOTAL</td>
                            <td className="text-center">
                              <span className={`badge ${isBalanced ? 'bg-success' : totalPercentage > 100 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {totalPercentage.toFixed(2)}%
                              </span>
                            </td>
                            <td className="text-end fw-bold">
                              ₹{categories.reduce((sum, cat) => sum + parseFloat(calculateAllocation(cat.percentage)), 0).toFixed(2)}
                            </td>
                          </tr>
                          {!isBalanced && (
                            <tr className={totalPercentage < 100 ? 'table-warning' : 'table-danger'}>
                              <td className="fw-bold">
                                {totalPercentage < 100 ? 'Unallocated' : 'Over Allocated'}
                              </td>
                              <td className="text-center">
                                <span className={`badge ${totalPercentage < 100 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                  {Math.abs(100 - totalPercentage).toFixed(2)}%
                                </span>
                              </td>
                              <td className="text-end fw-bold">
                                ₹{Math.abs(parseFloat(getRemainingAmount())).toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
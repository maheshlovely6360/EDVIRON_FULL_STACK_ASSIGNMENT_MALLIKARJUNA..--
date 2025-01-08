import React, { Component } from 'react';
import axios from 'axios';
import './index.css';

class TransactionStatus extends Component {
  state = {
    customOrderId: '',
    transactionDetails: null,
    loading: false,
    error: null
  };

  handleInputChange = (event) => {
    this.setState({ customOrderId: event.target.value });
  };

  checkStatus = async (event) => {
    event.preventDefault();
    
    this.setState({ loading: true, error: null });
    
    try {
      const response = await axios.get(`/api/check-status/${this.state.customOrderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      this.setState({
        transactionDetails: response.data,
        loading: false
      });
    } catch (error) {
      this.setState({
        error: 'Failed to fetch transaction status',
        loading: false
      });
    }
  };

  render() {
    const { customOrderId, transactionDetails, loading, error } = this.state;

    return (
      <div className="status-checker-container">
        <h2>Check Transaction Status</h2>
        
        <form onSubmit={this.checkStatus} className="status-form">
          <div className="input-group">
            <input
              type="text"
              value={customOrderId}
              onChange={this.handleInputChange}
              placeholder="Enter Custom Order ID"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </form>

        {transactionDetails && (
          <div className="transaction-details">
            <h3>Transaction Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Order ID:</span>
                <span className="value">{transactionDetails.custom_order_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`value status-${transactionDetails.status.toLowerCase()}`}>
                  {transactionDetails.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Amount:</span>
                <span className="value">₹{transactionDetails.transaction_amount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Gateway:</span>
                <span className="value">{transactionDetails.gateway}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TransactionStatus;
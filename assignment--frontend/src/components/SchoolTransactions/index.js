import React, { Component } from 'react';
import axios from 'axios';
import './index.css';

class SchoolTransactions extends Component {
  state = {
    schools: [],
    selectedSchool: '',
    transactions: [],
    loading: false,
    error: null
  };

  componentDidMount() {
    this.fetchSchools();
  }

  fetchSchools = async () => {
    try {
      const response = await axios.get('/api/schools', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.setState({ schools: response.data });
    } catch (error) {
      this.setState({ error: 'Failed to fetch schools' });
    }
  };

  handleSchoolChange = async (event) => {
    const schoolId = event.target.value;
    this.setState({ selectedSchool: schoolId, loading: true, error: null });

    try {
      const response = await axios.get(`/api/transactions/school/${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.setState({ 
        transactions: response.data,
        loading: false 
      });
    } catch (error) {
      this.setState({ 
        error: 'Failed to fetch school transactions',
        loading: false 
      });
    }
  };

  render() {
    const { schools, selectedSchool, transactions, loading, error } = this.state;

    return (
      <div className="school-transactions-container">
        <h2>School Transactions</h2>
        
        <div className="school-selector">
          <select 
            value={selectedSchool} 
            onChange={this.handleSchoolChange}
          >
            <option value="">Select a School</option>
            {schools.map(school => (
              <option key={school._id} value={school._id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading">Loading transactions...</div>}
        {error && <div className="error-message">{error}</div>}

        {selectedSchool && transactions.length > 0 && (
          <div className="transactions-table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Collect ID</th>
                  <th>Gateway</th>
                  <th>Order Amount</th>
                  <th>Transaction Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.collect_id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.collect_id}</td>
                    <td>{transaction.gateway}</td>
                    <td>₹{transaction.order_amount}</td>
                    <td>₹{transaction.transaction_amount}</td>
                    <td>
                      <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSchool && transactions.length === 0 && !loading && (
          <div className="no-transactions">
            No transactions found for this school.
          </div>
        )}
      </div>
    );
  }
}

export default SchoolTransactions;
import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './index.css';

class TransactionDashboard extends Component {
  state = {
    transactions: [],
    filteredTransactions: [],
    selectedStatus: 'all',
    searchTerm: '',
    startDate: null,
    endDate: null,
    currentPage: 1,
    itemsPerPage: 10,
    loading: true,
    error: null
  };

  componentDidMount() {
    this.fetchTransactions();
  }

  fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.setState({ 
        transactions: response.data,
        filteredTransactions: response.data,
        loading: false 
      });
    } catch (error) {
      this.setState({ 
        error: 'Failed to fetch transactions',
        loading: false 
      });
    }
  };

  handleStatusFilter = (event) => {
    const status = event.target.value;
    this.setState({ selectedStatus: status }, this.filterTransactions);
  };

  handleSearch = (event) => {
    this.setState({ searchTerm: event.target.value }, this.filterTransactions);
  };

  handleDateChange = (dates) => {
    const [start, end] = dates;
    this.setState({
      startDate: start,
      endDate: end
    }, this.filterTransactions);
  };

  filterTransactions = () => {
    const { transactions, selectedStatus, searchTerm, startDate, endDate } = this.state;
    
    let filtered = [...transactions];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.collect_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.custom_order_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (startDate && endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    this.setState({ 
      filteredTransactions: filtered,
      currentPage: 1
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { 
      filteredTransactions, 
      selectedStatus, 
      searchTerm, 
      startDate, 
      endDate,
      currentPage,
      itemsPerPage,
      loading,
      error 
    } = this.state;

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
      <div className="dashboard-container">
        <h1>Transactions Dashboard</h1>
        
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={this.handleSearch}
            />
          </div>

          <div className="status-filter">
            <select value={selectedStatus} onChange={this.handleStatusFilter}>
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="date-filter">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={this.handleDateChange}
              placeholderText="Select date range"
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Collect ID</th>
                <th>School ID</th>
                <th>Gateway</th>
                <th>Order Amount</th>
                <th>Transaction Amount</th>
                <th>Status</th>
                <th>Custom Order ID</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(transaction => (
                <tr 
                  key={transaction.collect_id}
                  className={`status-${transaction.status.toLowerCase()}`}
                >
                  <td>{transaction.collect_id}</td>
                  <td>{transaction.school_id}</td>
                  <td>{transaction.gateway}</td>
                  <td>₹{transaction.order_amount}</td>
                  <td>₹{transaction.transaction_amount}</td>
                  <td>
                    <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.custom_order_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => this.handlePageChange(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default TransactionDashboard;
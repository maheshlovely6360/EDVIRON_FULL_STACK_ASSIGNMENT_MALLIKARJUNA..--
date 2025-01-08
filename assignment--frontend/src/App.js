import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import TransactionDashboard from './components/TransactionDashboard';
import TransactionStatus from './components/TransactionStatus';
import SchoolTransactions from './components/SchoolTransactions';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

class App extends Component {
  state = {
    darkMode: false
  };

  toggleDarkMode = () => {
    this.setState(prevState => ({
      darkMode: !prevState.darkMode
    }), () => {
      document.body.classList.toggle('dark-mode', this.state.darkMode);
    });
  };

  render() {
    return (
      <Router>
        <div className={`app ${this.state.darkMode ? 'dark-mode' : ''}`}>
          <nav className="navbar">
            <div className="nav-brand">School Payment Dashboard</div>
            <div className="nav-links">
              <NavLink exact to="/" activeClassName="active">Dashboard</NavLink>
              <NavLink to="/school-transactions" activeClassName="active">School Transactions</NavLink>
              <NavLink to="/check-status" activeClassName="active">Check Status</NavLink>
              <button 
                className="theme-toggle"
                onClick={this.toggleDarkMode}
              >
                {this.state.darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><TransactionDashboard /></PrivateRoute>} />
              <Route path="/school-transactions" element={<PrivateRoute><SchoolTransactions /></PrivateRoute>} />
              <Route path="/check-status" element={<PrivateRoute><TransactionStatus /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
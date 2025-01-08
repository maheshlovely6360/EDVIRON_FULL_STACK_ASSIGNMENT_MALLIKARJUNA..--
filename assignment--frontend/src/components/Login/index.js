import React, { Component } from 'react';
import axios from 'axios';
import './index.css';

class Login extends Component {
  state = {
    email: '',
    password: '',
    error: null,
    loading: false
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: null });

    try {
      const response = await axios.post('/api/auth/login', {
        email: this.state.email,
        password: this.state.password
      });

      localStorage.setItem('token', response.data.token);
      this.props.history.push('/');
    } catch (error) {
      this.setState({
        error: 'Invalid credentials',
        loading: false
      });
    }
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    const { email, password, error, loading } = this.state;

    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={this.handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
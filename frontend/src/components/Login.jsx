import React, {useEffect, useState} from 'react';
import {loginUser} from "../utils/routeData.jsx";
import {Form, Button, Container, Row, Col, Card} from 'react-bootstrap';


function Login({setIsLoggedIn}) {
    // Functional component for Login page
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

const handleSubmit = async (event) => {
   // Handle form submission for login
  event.preventDefault();
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    setError('Please enter both username and password.');
    return;
  }
  try { // Attempt to log in the user
    const authenticateUser = await loginUser(username, password);
    if (authenticateUser.login_status === 'success') {
      localStorage.setItem('access_token', authenticateUser.token);
      setIsLoggedIn(true);
    } else {
      setError('Incorrect username and/or password. Please try again.');
    }
  } catch (err) {
      console.error(err);
    setError('Server error. Please try again later.');
  }
};


	return (<Container className="login-card">
		<Row className="justify-content-md-center">
			<Col md={6}>
				<Card>
					<Card.Body>
						<h2 className="text-center mb-4">Login</h2>
						{error && <div className="alert alert-danger">{error}</div>}
						<Form onSubmit={handleSubmit}>
							<Form.Group className="mb-3" controlId="formBasicEmail">
								<Form.Label>Username</Form.Label>
								<Form.Control
									type="text"
									name='username'
									placeholder="Enter username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									autoComplete="username"
									required
								/>
							</Form.Group>
							<Form.Group className="mb-3" controlId="formBasicPassword">
								<Form.Label>Password</Form.Label>
								<Form.Control
									type="password"
									name='password'
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									required
								/>
							</Form.Group>
							<Button variant="primary" type="submit" className="w-100">
								Login
							</Button>
						</Form>
					</Card.Body>
				</Card>
			</Col>
		</Row>
	</Container>);

}

export default Login;
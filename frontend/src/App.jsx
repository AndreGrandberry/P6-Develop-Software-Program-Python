import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import {getUsername, validateToken} from "./utils/routeData.jsx";
import CMNavbar from "./components/CMNavbar.jsx";

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [username, setUsername] = useState('')
	const handleLogout = () => {
		console.log("Logging out")
		localStorage.removeItem('access_token');
		setIsLoggedIn(false)
	}
	useEffect(() => {

		const isTokenValid = async (token) => {
			const accessToken = localStorage.getItem('access_token');
			const result = await validateToken(accessToken)
			console.log('token_valid: ', result.token_validated)
			if (result.token_validated) {
				setIsLoggedIn(true)
			} else {
				localStorage.removeItem('access_token');
			}

		}
		isTokenValid()

	}, [])

	useEffect(() => {
		const fetchUsername = async () => {
			if (isLoggedIn) {
				const user = await getUsername()
				setUsername(user)
			} else {
				setUsername('')
			}
		}
		fetchUsername()
	}, [isLoggedIn]);
	return (<Router>
		{isLoggedIn && <CMNavbar handleLogout={handleLogout} username={username}/>}
		<Routes>
			<Route path="/"
			       element={isLoggedIn ? <Dashboard username={username}/> : <Navigate to="/login" replace/>}/>
			<Route path="/login"
			       element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn}/> : <Navigate to="/" replace/>}/>
			<Route path="*" element={<h2>404 - Page Not Found</h2>}/>
		</Routes>
	</Router>);
}

export default App;
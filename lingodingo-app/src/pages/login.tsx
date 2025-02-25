import React, { useState } from 'react';
import './Login.css';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = () => {
		console.log('Logging in with:', { username, password });
		// set with                     withCredentials: true,
		const featchData = async () => {
			const response = await fetch('http://localhost:3002/login', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: username, password: password }),
			});
			const data = await response.json();
			console.log(data);
		};

		try {
			featchData().then(() => {
				window.location.href = '/train';
			});
		}
		catch (error) {
			console.error('Error fetching sentences:', error);
		}
	};

	return (
		<div className="level-container">
			<div className="level-card">
				<h2 className="level-instructions">Login</h2>
				<input
					type="text"
					className="input-box"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<br /><br />
				<input
					type="password"
					className="input-box"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<br />
				<button className="play-button" onClick={handleLogin}>
					Log In
				</button>
			</div>
		</div>
	);
};
export default Login;

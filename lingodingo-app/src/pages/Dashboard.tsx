import React, { useEffect, useState } from 'react';
import './Dashboard.css';


type Challenge = {
	character: string;
	lerningPoints: number;
	lvl: number;
};

type DashboardData = {
	challenges: Challenge[];
	level: number;
	progress: number;
};

const DashboardPage: React.FC = () => {
	const [dashboardData, setDashboardData] = useState<DashboardData[] | null>(null);

	useEffect(() => {
		const feachData = async () => {
			const response = await fetch('http://localhost:3002/getdashboard', {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			console.log('data', data);

			const countOfallZeros = data.reduce((acc: number, item: Challenge) => {
				if (item.lerningPoints === 0) {
					return acc + 1;
				}
				return acc;
			}, 0);

			console.log('countOfallZeros', countOfallZeros);

			const newChalllange = data.map((item: Challenge) => {
				return {
					character: item.character,
					learningPoints: item.lerningPoints,
					lvl: item.lvl
				};
			});

			const newDashboardData = {
				challenges: newChalllange,
				level: 1,
				progress: countOfallZeros
			};

			setDashboardData([newDashboardData]);

		};
		feachData();
	}, []);

	useEffect(() => {
		console.log('dashboardData', dashboardData);
	}, [dashboardData]);

	if (!dashboardData) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Dashboard</h1>
			<div className='dashboard'>
				{dashboardData.map((challenge) => (
					<div className='thumbnail-card' key={challenge.level}>
						<h3>level {challenge.level}</h3>
						<p> Your progress:</p>
						<div className='progress-bar'>
							<div
								className='progress'
								style={{ width: `${(challenge.progress / challenge.challenges.length) * 100}%` }}
							></div>
						</div>
						<p
							style={{ textAlign: 'center' }}
						> {challenge.progress} / {challenge.challenges.length} </p>

					</div>
				))}
			</div>
		</div>
	);
};

export default DashboardPage;


















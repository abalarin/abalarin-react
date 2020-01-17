import React from 'react';
import ReactDOM from 'react-dom';

import './styles/index.css';
import './styles/navigation.scss';

import App from './App';

function Menu() {
	return (
		<div>
			<nav className="navigation">
				<section className="container">
					<a className="navigation-title" href="http://localhost:3000">
						austinbalarin
					</a>
					<input type="checkbox" id="menu-toggle" />
					<label className="menu-button float-right" htmlFor="menu-toggle"><i className="fas fa-bars"></i></label>
					<ul className="navigation-list">
						<li className="navigation-item">
							<a className="navigation-link" href="http://localhost:3000/music">Music</a>
						</li>
						<li className="navigation-item menu-separator">
								<span>|</span>
						</li>
						<li className="navigation-item">
							<a className="navigation-link" href="http://localhost:3000/git">Github</a>
						</li>
					</ul>
				</section>
			</nav>
		</div>
	)
}

ReactDOM.render(
		<>
			<Menu/>
			<App />
		</>
		, document.getElementById('root')
);

import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './styles/index.css';
import './styles/navigation.scss';

import App from './App';
import GithubPage from './pages/GithubPage';
import MusicPage from './pages/MusicPage';

function Menu() {
	return (
		<div>
			<nav className="navigation">
				<section className="container">
					<span className="navigation-title">
						<Link to="/">austinbalarin</Link>
					</span>
					<input type="checkbox" id="menu-toggle" />
					<label className="menu-button float-right" htmlFor="menu-toggle"><i className="fas fa-bars"></i></label>
					<ul className="navigation-list">
						<li className="navigation-item">
							<Link to="/music">Music</Link>
						</li>
						<li className="navigation-item menu-separator">
								<span>|</span>
						</li>
						<li className="navigation-item">
							<Link to="/git">Github</Link>
						</li>
					</ul>
				</section>
			</nav>
		</div>
	)
}

ReactDOM.render(
		<Router>
			<Menu/>
			<Switch>
				<Route path="/git">
					<GithubPage />
				</Route>
				<Route path="/music">
					<MusicPage />
				</Route>
				<Route path="/">
					<App />
				</Route>
			</Switch>
		</Router>
		, document.getElementById('root')
);

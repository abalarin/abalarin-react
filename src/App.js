import React from 'react';
import logo from './assests/me.png';
import './styles/App.css';
import './styles/footer.scss';

import Music from './components/Music';
import Github from './components/Github';

import Typography from '@material-ui/core/Typography';

function Footer() {
	return (
		<footer className="footer" >
			<section className="container">
				<p>Init to win it.</p>
			</section>
		</footer>
	)
}

function FrontPage() {
	let top = window.innerHeight / 12;
	return (
		<div style={{height:window.innerHeight}}>
			<img src={logo} className="App-logo" alt="logo" style={{marginTop:top}}/>
			<Typography component="h2" variant="h2" style={{fontFamily: 'Lato', fontSize: 'calc(25px + 2vmin)', fontWeight: 'bold', marginBottom: '20px'}}>
				Austin Balarin
			</Typography>
			<Typography component="h2" variant="h2" style={{fontFamily: 'Lato', fontSize: 'calc(15px + 2vmin)'}}>
				Software Fungineer <a style={{color:"#3f9c46"}} href="https://linode.com">@Linode</a>
			</Typography>
		</div>
	);
}

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<FrontPage/>
				<Footer/>
        <div className='componentRow'>
          <Music count={10}/>
          <Github count={18}/>
        </div>
			</header>
		</div>
	);
}

export default App;
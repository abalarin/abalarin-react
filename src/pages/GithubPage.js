import React from 'react';
import Github from '../components/Github';

function GithubPage() {
  return (
    <div className="App">
      <header className="App-header">
        <Github count={60} style={{paddingBottom:'30px', paddingTop:'0'}}/>
      </header>
    </div>
  );
}

export default GithubPage;

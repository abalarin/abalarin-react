import React from 'react';
import Music from '../components/Music';

function MusicPage() {
  return (
    <div className="App">
      <header className="App-header">
        <Music count={20}/>
      </header>
    </div>
  );
}

export default MusicPage;

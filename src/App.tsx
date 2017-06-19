import * as React from 'react';
import Game from './components/Game';
import './App.css';

const logo = require('./logo.svg');

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Bonjour,</h2>
        </div>
        <p className="App-intro">
          Tripote moi le mesh avec <code>les doigts</code>
        </p>
        <Game />
      </div>
    );
  }
}

export default App;

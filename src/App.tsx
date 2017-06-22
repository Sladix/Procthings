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
          <h2>Eh toi là !</h2>
        </div>
        <p className="App-intro">
          Tu vois cette tronche de vainqueur ? <code>Eh ben c'est toi !</code> approche la des carrés bleus pour qu'elle tire dessus !
        </p>
        <Game />
      </div>
    );
  }
}

export default App;

import * as React from 'react';
import Game from './components/Game';
import './App.css';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          Tu vois cette tronche de vainqueur ? <code>Eh ben c'est toi !</code> approche la des booties pour qu'elle tire dessus !
        </p>
        <Game />
      </div>
    );
  }
}

export default App;

import * as React from 'react';
import Game from './components/Game';
import './App.css';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }
}

export default App;

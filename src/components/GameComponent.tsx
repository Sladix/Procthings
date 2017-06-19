import GameEvent from './GameEvent';
import { GameObject } from './GameObject';

class GameComponent{
  _name = ''; 
  _parent: GameObject; 
  constructor( params: any , _name: string , _parent: GameObject ){ 
    for (let k in params) {
      if (params[k]) {
          this[k] = params[k];
      }    
    }
    this._name = _name;
    this._parent = _parent;
  }
  fireEvent( e: GameEvent ){
    // console.log(e,'fired in component');
    return e;
  }
}

export default GameComponent;
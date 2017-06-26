import GameComponent from '../GameComponent';
import GameEvent from '../GameEvent';
import Physics from './Physics';
// var Matter = require('matter-js');


class SlingshotControl extends GameComponent {
  _body: any;
  active = false;
  fireEvent(e: GameEvent) {
    // Initialisation
    if (e.ID == "generate") {
      let b = this._parent.getComponent('Physics') as Physics;
      if (b) {
        this._body = b._body;
      } else {
        throw new Error('Component PlayerControl needs component Physics');
      }
    }
    return e;
  }
}

export default SlingshotControl;
import GameComponent from '../GameComponent';
import GameEvent from '../GameEvent';
var Matter = require('matter-js');


class Physics extends GameComponent {
  size: number;
  type: string;
  Bodies = Matter.Bodies;
  World = Matter.World;
  position: number[];
  _body: any;

  fireEvent(e: GameEvent) {
    if (e.ID === 'generate') {
      this._body = this.Bodies.circle(this.position[0], this.position[1], this.size);
      this.World.add(e.params._world, this._body);
    }
    return e;
  }
}

export default Physics;
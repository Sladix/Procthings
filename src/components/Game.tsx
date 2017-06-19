import * as React from 'react';
var Matter = require('matter-js');
import { GameObject, GameObjectFactory } from './GameObject';
interface Props { }
interface State { }
class Game extends React.Component<Props, State> {
  // Custom properties
  renderElement: HTMLDivElement;
  gameObjects: GameObject[];
  gof: GameObjectFactory;

  // Matter JS
  Engine = Matter.Engine;
  Render = Matter.Render;
  Runner = Matter.Runner;
  Body = Matter.Body;
  Composites = Matter.Composites;
  Common = Matter.Common;
  Constraint = Matter.Constraint;
  MouseConstraint = Matter.MouseConstraint;
  Mouse = Matter.Mouse;
  World = Matter.World;
  Bodies = Matter.Bodies;

  _engine: any;
  _world: any;
  _render: any;
  _runner: any;
  _mouse: any;
  _mouseConstraint: any;
  componentDidMount() {
    this.gof = new GameObjectFactory();
    this.initGame();
    this.addBodies();
    this.initControls();
  }

  addBodies() {
    let group = this.Body.nextGroup(true);
    var self = this;
    let bridge = this.Composites.stack(150, 300, 9, 1, 10, 10, function(x : number, y : number) {
        return self.Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
    });
    
    this.Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.9 });
    
    let stack = this.Composites.stack(200, 40, 6, 3, 0, 0, function(x: number, y: number) {
        return self.Bodies.polygon(x, y, Math.round(self.Common.random(1, 8)), self.Common.random(20, 40));
    });

    this.World.add(this._world, [
        bridge,
        this.Bodies.rectangle(80, 440, 120, 280, { isStatic: true }),
        this.Bodies.rectangle(720, 440, 120, 280, { isStatic: true }),
        this.Constraint.create({ pointA: { x: 140, y: 300 }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 } }),
        this.Constraint.create({ pointA: { x: 660, y: 300 }, bodyB: bridge.bodies[8], pointB: { x: 25, y: 0 } }),
        stack
    ]);
  }

  initControls() {
    // add mouse control
    this._mouse = this.Mouse.create(this._render.canvas);
    this._mouseConstraint = this.MouseConstraint.create(this._engine, {
            mouse: this._mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    this.World.add(this._world, this._mouseConstraint);

    // keep the mouse in sync with rendering
    this._render.mouse = this._mouse;

    this.Render.lookAt(this._render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
  }

  initGame() {
    this._engine = this.Engine.create();
    this._world = this._engine.world;
    this._render = this.Render.create({
        element: this.renderElement,
        engine: this._engine,
        options: {
            width: Math.min(document.documentElement.clientWidth, 800),
            height: Math.min(document.documentElement.clientHeight, 600),
            showAngleIndicator: true
        }
    });
    this.Render.run(this._render);
    this._runner = this.Runner.create();
    this.Runner.run(this._runner, this._engine);

  }
  render() {
    return (
      <div ref={(c) => { this.renderElement = c; }} />
        );
    }
}

export default Game;
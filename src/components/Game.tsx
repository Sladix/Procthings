import * as React from 'react';
var Matter = require('matter-js');
import { GameObject, GameObjectFactory } from './GameObject';
import GameEvent from './GameEvent';

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
    this.addGameObjects();
    this.initControls();
  };

  addGameObjects() {
    let h = this.gof.createFromBluePrint('human', { position: [document.documentElement.clientWidth / 2, 300] });
    this.gameObjects.push(h as GameObject);
    this.gameObjects.forEach((g: GameObject)=>{
      g.fireEvent(new GameEvent('generate', { _world: this._world }));
    });
    
    
  };

  initControls() {
    // add mouse control
    // this._mouse = this.Mouse.create(this._render.canvas);
    // this._mouseConstraint = this.MouseConstraint.create(this._engine, {
    //         mouse: this._mouse,
    //         constraint: {
    //             stiffness: 0.2,
    //             render: {
    //                 visible: false
    //             }
    //         }
    //     });

    // this.World.add(this._world, this._mouseConstraint);

    // // keep the mouse in sync with rendering
    // this._render.mouse = this._mouse;

    // this.Render.lookAt(this._render, {
    //     min: { x: 0, y: 0 },
    //     max: { x: 800, y: 600 }
    // });
  }

  initGame() {
    this._world = this.World.create({
      gravity: {
        x: 0,
        y: 0
      }
    });
    this._engine = this.Engine.create({ world: this._world });
    
    this._render = this.Render.create({
        element: this.renderElement,
        engine: this._engine,
        options: {
            width: document.documentElement.clientWidth,
            height: Math.min(document.documentElement.clientHeight, 600),
            showAngleIndicator: false
        }
    });
    this.Render.run(this._render);
    this._runner = this.Runner.create();
    this.Runner.run(this._runner, this._engine);
    this.gameObjects = [];
  }
  render() {
    return (
      <div ref={(c) => { this.renderElement = c; }} />
        );
    }
}

export default Game;
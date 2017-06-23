import * as React from 'react';
var Tone = require('tone');
var Matter = require('matter-js');
interface Props { }
interface State {
  won: boolean,
  enemiesLeft: number,
  totalEnemies:number,
  moves: number
 }
class Game extends React.Component<Props, State> {
  // Custom properties
  renderElement: HTMLDivElement;

  // Matter JS
  Engine = Matter.Engine;
  Render = Matter.Render;
  Runner = Matter.Runner;
  Body = Matter.Body;
  Composites = Matter.Composites;
  Composite = Matter.Composite;
  Common = Matter.Common;
  Constraint = Matter.Constraint;
  MouseConstraint = Matter.MouseConstraint;
  Mouse = Matter.Mouse;
  World = Matter.World;
  Bodies = Matter.Bodies;
  Events = Matter.Events;
  Vector = Matter.Vector;

  worldHeight: number;
  worldWidth: number;
  defaultCategory = 0x0008;
  sprinkleCategory = 0x0003;
  particlesCategory = 0x0004;
  collidableCategory = 0x0010;
  bulletCategory = 0x0011;

  synth: any;

  melody = ['E4','B3','F4'];
  currentKey = 0;

  _engine: any;
  _world: any;
  _render: any;
  _runner: any;
  _mouse: any;
  _mouseConstraint: any;
  bonhomme: any; // Player
  stack: any; // Enemies
  moveConstraint: any;

  level = 1;

  initialPlayDelay = 100;
  playDelay: number;
  playerReach = 130;
  bullets = 10;
  shootInterval = 200;

  canPlay = true;

  constructor(props:Props) {
      super(props);
      this.state = { won: false, enemiesLeft : 0, moves : 0, totalEnemies: 0 };
  }
  
  componentDidMount() {
    this.worldHeight = Math.min(document.documentElement.clientHeight, 600);
    this.worldWidth = document.documentElement.clientWidth;
    this.initGame();
    this.generate();
  }
  initGame() {
    this._world = this.World.create({
      gravity: {
        x: 0,
        y: 0
      }
    });
    this._engine = this.Engine.create({
      world : this._world
    });
    this._render = this.Render.create({
        element: this.renderElement,
        engine: this._engine,
        options: {
            width: this.worldWidth,
            height: this.worldHeight,
            showAngleIndicator: false,
            wireframes:false
        }
    });
    this.Render.run(this._render);
    this._runner = this.Runner.create();
    this.Runner.run(this._runner, this._engine);

    this.Render.lookAt(this._render, {
        min: { x: 0, y: 0 },
        max: { x: this.worldWidth, y: this.worldHeight }
    });
    Tone.Transport.bpm.value = 140;
    Tone.Master.volume.value = -12;
    this.synth = new Tone.Synth({
      "oscillator": {
        "type": "pwm",
        "modulationFrequency": 0.2
      },
      "envelope": {
        "attack": 0.02,
        "decay": 0.1,
        "sustain": 0.2,
        "release": 0.1,
      }
    }).toMaster();

  }

  resetGame() {
    this.World.clear(this._world);
    this.Engine.clear(this._engine);
    this._engine.events = {};
    this.setState({ won: false });
    this.generate();
    this.Runner.start(this._runner,this._engine);
    
  }

  winGame() {
    this.setState({ won: true });
    this.level++;
    this.Runner.stop(this._runner);
    console.log("ok");
  }

  generate() {
    this.addBodies();
    this.initControls();
    this.addLogic();
  }

  getEnemy(x:number,y:number,size:number) {
    return this.Bodies.circle(x, y, size, {
        render: {
          sprite: {
            texture: '/booty.png'
          }
        },
        isStatic: true,
        collisionFilter: {
          category: this.sprinkleCategory,
          mask: this.collidableCategory | 1 | this.defaultCategory | this.bulletCategory
        }
      });
  }

  getEnemiesStack(rows: number, level:number) {
    var self = this;
    let space = 10;
    let objDiam = 40;
    let cols = Math.floor((this.worldWidth - 100) / (objDiam + space));
    cols = level;
    var x = this.worldWidth / 2 - ((cols*(objDiam+space))/2);
    let stack = this.Composites.stack(x, 50, cols, rows, space, space, function(x: number, y: number) {
      return self.getEnemy(x, y, objDiam / 2);
    });
    this.setState({ totalEnemies: cols * rows });
    return stack;
  }

  addBodies() {
    this.bonhomme = this.Bodies.circle(this.worldWidth / 2, this.worldHeight / 2, 20, {
      restitution: 1,
      frictionAir:0.05,
      collisionFilter: {
        category: this.defaultCategory
      },
      render: {
        sprite: {
            texture: '/player.png'
        }
      }
    });
    
    this.stack = this.getEnemiesStack(3,this.level);

    this.World.add(this._world, [
        this.bonhomme,
        this.Bodies.rectangle(this.worldWidth/2, 0, this.worldWidth, 50, { isStatic: true, restitution: 1  }),
        this.Bodies.rectangle(this.worldWidth/2, this.worldHeight, this.worldWidth, 50, { isStatic: true, restitution: 1 }),
        this.Bodies.rectangle(0, this.worldHeight/2, 50, this.worldHeight, { isStatic: true, restitution: 1  }),
        this.Bodies.rectangle(this.worldWidth, this.worldHeight/2, 50, this.worldHeight, { isStatic: true, restitution: 1 }),
        this.stack
    ]);
  }

  initControls() {
    // add mouse control
    this._mouse = this.Mouse.create(this._render.canvas);
    this._mouseConstraint = this.MouseConstraint.create(this._engine, {
            mouse: this._mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: true
                }
            }
        });

    this.World.add(this._world, this._mouseConstraint);

    // keep the mouse in sync with rendering
    this._render.mouse = this._mouse;

    this._mouseConstraint.collisionFilter.mask = this.defaultCategory;
  }

  
  addLogic() {
    // this.Engine.on()
    this.moveConstraint = null;
    var anchor: any;
    var dropPoint: any;
    let self = this;
    let dropDistance = 0;
    this.playDelay = this.initialPlayDelay;

    this.Events.on(this._mouseConstraint, 'startdrag', function(event: any) {
      if (event.body === self.bonhomme && self.canPlay) {
        anchor = self.Vector.clone(event.mouse.position);
        self.moveConstraint = self.Constraint.create({ pointA: anchor, bodyB: self.bonhomme, stiffness: 0.05 });
        self.World.add(self._world, self.moveConstraint);
      }
    });

    this.Events.on(this._mouseConstraint, 'enddrag', function(event: any) {
      if (anchor) {
        // Turn starts for the player
        self.stack.bodies.forEach((b: any) => {
          self.Body.setStatic(b, false);
        });
        dropPoint = self.Vector.clone(event.mouse.position);
        dropDistance = self.Vector.magnitude(self.Vector.sub(anchor, dropPoint));

        self.canPlay = false;
        self.playDelay = self.initialPlayDelay;
        self.bonhomme.collisionFilter.category = self.collidableCategory;
        self.setState({ moves: self.state.moves + 1 });
        if (dropDistance < 30) {
          self.World.remove(self._world, self.moveConstraint);
          dropDistance = 0;
          dropPoint = null;
        }
      }
      
    });

    this.Events.on(this._engine, 'afterUpdate', function(event: any) {
      if (self.moveConstraint && self.moveConstraint.bodyB && dropPoint) {
        let dist = self.Vector.magnitude(self.Vector.sub(self.moveConstraint.bodyB.position, dropPoint));
        if (dist >= dropDistance) {
          self.World.remove(self._world, self.moveConstraint);
          dropDistance = 0;
          dropPoint = null;
        }
      }
      if (self.stack.bodies.length <= 0) {
        self.winGame();
      }
      self.setState({ enemiesLeft: self.stack.bodies.length });
    });

    this.Events.on(this._engine, 'beforeUpdate', function(event: any) {
      if (self.playDelay <= 0 && !self.canPlay) {
        // END TURN
        console.log("can play, turn ended");
        self.fireShots();
      }
      if(!self.canPlay && self.playDelay > 0 && self.bonhomme.speed < 1){
        self.playDelay--;
      }
      if (self.canPlay) {
        self.bonhomme.render.sprite.texture = '/player.png';
      } else {
        self.bonhomme.render.sprite.texture =  '/player_test.png';
      }
    });

    this.Events.on(this._engine, 'collisionEnd', function(event: any) {
      event.pairs.forEach((p: any) => {
        if (p.bodyA.collisionFilter.category === self.sprinkleCategory) {
          if (p.bodyB.collisionFilter.category === self.bulletCategory) {
            self.sparkles(p.bodyA.position);
            self.World.remove(self._world, p.bodyB);
            self.Composite.remove(self.stack, p.bodyA);
          }
        }
      });
    });
  }

  sparkles(position: any) {
    let particles: any[];
    particles = [];
    let _NUM_PARTICLES_ = 9;
    let step = 360 / _NUM_PARTICLES_;
    let direction = this.Vector.create(0, 1);
    // Create particles
    for (let index = 0; index < _NUM_PARTICLES_; index++) {
      let part = this.Bodies.circle(position.x, position.y, 3, { friction: 1, collisionFilter: { category: this.particlesCategory, mask: 1 } });
      particles.push(part);
    }
    // Add them
    this.World.add(this._world, particles);
    // Spread them in 360 deg
    particles.forEach((p: any, index: number) => {
      let from = this.Vector.mult(this.Vector.rotate(this.Vector.clone(direction), step*index), 1e-4);
      this.Body.applyForce(p, { x: 0, y: 0 }, from);
    });
    // Play a sound
    this.synth.triggerAttackRelease(this.melody[this.currentKey++], '8n');
    this.currentKey = (this.currentKey >= this.melody.length) ? 0 : this.currentKey;
    // Remove the particles after 5s
    let self = this;
    setTimeout(() => {
      particles.forEach((p:any) => {
        self.World.remove(self._world, p);
      });
    }, 5000);
  }
  fireShots() {
    let self = this;
    this.canPlay = true;
    let enemies = this.stack.bodies;
    let targets: any[];
    targets = [];
    let fired = 0;
    let ppos = this.bonhomme.position;
    let _cbuls = this.bullets;
    // Get the enemies in reach
    enemies.forEach((e: any) => {
      if (this.Vector.magnitude(this.Vector.sub(e.position, ppos)) <= this.playerReach) {
        targets.push(e);
      }
    });
    // Fire a bullet to each enemies if we have enough bullets
    targets.forEach((e: any, index: number) => {
      if (_cbuls > 0) {
        // Do something
        let b = this.Bodies.circle(ppos.x, ppos.y, 2,
          {
            frictionAir: 0,
            render: { fillStyle: 'white' },
            collisionFilter: {
              category: this.bulletCategory,
              mask: 1 | this.sprinkleCategory
            }
          });
        let vec = this.Vector.mult(this.Vector.normalise(this.Vector.sub(e.position, ppos)), 1e-4);
        this.Body.applyForce(b, { x: 0, y: 0 }, vec);
        // Fire the bullets one at a time
        setTimeout(() => {
          self.World.add(self._world, b);
      }, self.shootInterval * index);
        fired++;
        _cbuls--;
      }
    });
    // Wait all the bullets to be fired and reset the player
    setTimeout(() => { 
      self.bonhomme.collisionFilter.category = self.defaultCategory;
      self.stack.bodies.forEach((b: any) => {
        self.Body.setStatic(b, true);
      });
     }, fired * self.shootInterval);
    
  }
  render() {
    let message = null;
    if (this.state.won) {
      message = <h3>Bien joué ma couille !! <button onClick={this.resetGame.bind(this)}>Recommencer</button></h3>
    }
    return (
      <div>
        {message}
        <p className="score">Nombre d'énemis restants : { this.state.enemiesLeft } / { this.state.totalEnemies } | Mouvements effectués : { this.state.moves }</p>
        <div ref={(c) => { this.renderElement = c; }} />
      </div>
        );
    }
}

export default Game;


import GameEvent from './GameEvent';
import GameComponent from './GameComponent';
import Physics from './game-components/Physics';

class GameObject{
  components: GameComponent[];
  _type: string;
  constructor(_type:string){
    this.components = [];
    this._type = _type;
  }
  getComponent(name: string){
    let c = this.components.find( ( c: GameComponent ) => { return c._name === name; } );
    return c;
  }
  fireEvent(e: GameEvent){
    let initialEvent = e;
    this.components.forEach(c => {
      initialEvent = c.fireEvent(initialEvent);
    });
    //console.log(e,'fired in GameObject');
    return e;
  }
}

class GameObjectFactory{
  private blueprints: {};
  private componentList: {};
  constructor(){
    this.loadBluePrints();
  }
  loadBluePrints(){
    this.componentList = {
      Physics
    };
    this.blueprints = {
      human:{
        components:[
          { name:'Physics', params : { weight : 10, size : 150} }
        ]
      } 
    };
  }
  createFromBluePrint(name: string){
    if( !this.blueprints[name] )
    {
      console.log(name+' blueprint does not exist');
      return null;
    }
    var o = new GameObject(name);
    this.blueprints[name].components.forEach((c:any) => {
      if( !this.componentList[c.name] ){
        console.log('Component ' + c.name + ' does not exist');
        return null;
      }
      var comp = new this.componentList[c.name](c.params,c.name,o);
      o.components.push(comp);
      return true;
    });
    return o;
  }
}

export { GameObject, GameObjectFactory };
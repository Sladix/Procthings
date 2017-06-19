class GameEvent{
  ID: string;
  params: any; 
  
  constructor(id: string, params: any){ 
    this.ID = id;
    this.params = (params)?params:{};
  }
}

export default GameEvent;
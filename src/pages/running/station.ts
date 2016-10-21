import {Position} from "../../providers/track-service/track-service";

export class Station {
  position: Position;
  visited: boolean;

  constructor(position: Position){
    this.position = position;
  }

  public setVisited(visited: boolean){
    console.log("station circle clicked!");
    this.visited = visited;
  }

}

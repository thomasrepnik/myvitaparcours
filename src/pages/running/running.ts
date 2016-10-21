import { Component, ViewChildren } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Track} from "../../providers/track-service/track-service";
import {Observable} from 'rxjs/Rx';


@Component({
  templateUrl: 'running.html'
})
export class RunningPage {

  public track: Track;

  @ViewChildren('stationSvg')
  stationSVGs;

  constructor(public navCtrl: NavController, public params:NavParams) {
    this.track = params.get("track");
  }


  ngAfterViewInit(){
    let timer = Observable.timer(2000,5000);
    timer.subscribe(t => this.tickerFunc(t));
  }

  tickerFunc(tick){
    if (this.track.stations.length > 0){
      this.track.stations[0].visited = (tick % 2 === 0);
    }
  }

  setClasses(index: number) {
    let classes =  {
      unvisited: true,
      visited: this.track.stations[index].visited
    };
    return classes;
  }
}

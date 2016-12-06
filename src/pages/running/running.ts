import {Component, ViewChildren} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Position, TrackService} from "../../providers/track-service/track-service";
import {TrackUtil} from "../recording/trackUtil";
import {TrackRunner} from "./trackrunner";
import {isUndefined} from "ionic-angular/util/util";
import {Station} from "./station";


@Component({
  templateUrl: 'running.html'
})
export class RunningPage {

  //public track:Track;
  watch:any;
  trackRunner:TrackRunner;
  stations:Array<Station>;

  currentSpeed: number = 99;
  totalAltitude: number = 99;

  private geolocationOptions = {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: 5000
  };


  @ViewChildren('stationSvg')
  stationSVGs;

  constructor(public navCtrl:NavController, public params:NavParams, public trackService:TrackService) {
    //this.track = params.get("track");

    this.watch = navigator.geolocation.watchPosition((position) => {
      console.log("Current accuracy: " + position.coords.accuracy);
      console.log("Current altitude accuracy: " + position.coords.altitudeAccuracy);
      this.processPosition(TrackUtil.convertToPosition(position), position.coords.speed, position.coords.altitude);
    }, (positionError) => {
      console.log('Error ' + positionError.code + ': ' + positionError.message);
    }, this.geolocationOptions);

  }


  ngAfterViewInit() {
    //let timer = Observable.timer(2000, 5000);
    //timer.subscribe(t => this.tickerFunc(t));
  }

  processPosition(position:Position, speed: number, altitude: number) {
    this.createTrackRunnerIfNecessary(position);

    if (!isUndefined(this.trackRunner)){
      this.trackRunner.processPosition(position, speed, altitude);
    }
  }

  private createTrackRunnerIfNecessary(position:Position) {

    if (isUndefined(this.trackRunner)) {
      this.trackService.getNearestTrack(position).subscribe(nearestTrack => {
        this.trackRunner = new TrackRunner(nearestTrack);
        this.stations = this.trackRunner.track.stations;
        this.currentSpeed = this.trackRunner.currentSpeed;
        this.totalAltitude = this.trackRunner.totalAltitude;
      });
    }
  }



  tickerFunc(tick) {
    if (this.trackRunner.track.stations.length > 0) {
      this.trackRunner.track.stations[0].visited = (tick % 2 === 0);
    }
  }

  setClasses(index:number) {
    let classes = {
      unvisited: true,
      visited: this.trackRunner.track.stations[index].visited
    };
    return classes;
  }
}

import {Component} from '@angular/core';
import { NavController } from 'ionic-angular';
import {TrackService, Track} from "../../providers/track-service/track-service";
import {RunningPage} from "../running/running";


@Component({
  templateUrl: 'tracks.html'
})
export class TracksPage {

  tracks:Array<Track> = [];

  constructor(public trackService:TrackService, public navCtrl:NavController) {

  }


  ngAfterViewInit() {
    this.loadTracks();
  }

  private loadTracks() {
    this.tracks = this.trackService.getTracks();
  }

  goToRunningPage(track: Track) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(RunningPage, { track: track });
  }
}

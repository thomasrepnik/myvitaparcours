import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Track} from "../../providers/track-service/track-service";


@Component({
  templateUrl: 'running.html'
})
export class RunningPage {

  public track: Track;

  constructor(public navCtrl: NavController, public params:NavParams) {
    this.track = params.get("track");
  }

}

import { Component } from '@angular/core';
import {TrackService} from "../../providers/track-service/track-service";
import {Tabs, NavController} from "ionic-angular/index";


@Component({
  templateUrl: 'settings.html'
})
export class SettingsPage {

  gpsAccuracy: number;

  constructor(public trackService:TrackService, public navCtrl:NavController) {

  }

  onGpsAccuracyUpdated(){
    console.log("New GPS Accuracy: " + this.gpsAccuracy);
  }

  public clearDatabase(){
    this.trackService.clearDatabase();
  }


}

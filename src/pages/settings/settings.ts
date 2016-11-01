import { Component } from '@angular/core';
import {TrackService} from "../../providers/track-service/track-service";


@Component({
  templateUrl: 'settings.html'
})
export class SettingsPage {

  gpsAccuracy: number;

  constructor(public trackService:TrackService) {

  }

  onGpsAccuracyUpdated(){
    console.log("New GPS Accuracy: " + this.gpsAccuracy);
  }

  public clearDatabase(){
    this.trackService.clearDatabase();
  }
}

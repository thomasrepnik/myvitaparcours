import { Component } from '@angular/core';
import {TrackService} from "../../providers/track-service/track-service";


@Component({
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public trackService:TrackService) {

  }

  public clearDatabase(){
    this.trackService.clearDatabase();
  }
}

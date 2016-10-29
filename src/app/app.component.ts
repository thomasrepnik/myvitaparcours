import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { StatusBar } from 'ionic-native';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';
import { MapsPage } from '../pages/maps/maps';
import { RecordingPage } from '../pages/recording/recording';
import { TracksPage} from '../pages/tracks/tracks';
import {RunningPage} from "../pages/running/running";
import {SettingsPage} from "../pages/settings/settings";

import {TrackService} from "../providers/track-service/track-service";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  runTab: any;
  parcoursTab: any;
  settingsTab: any;

  // make HelloIonicPage the root (or first) page
  rootPage: any = HelloIonicPage;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    private trackService: TrackService
  ) {
    this.initializeApp();

    this.runTab = RunningPage;
    this.parcoursTab = TracksPage;
    this.settingsTab = SettingsPage;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      this.trackService.init();
    });
  }

}

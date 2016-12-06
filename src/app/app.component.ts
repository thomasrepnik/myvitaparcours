import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/Rx';

import {Platform, MenuController} from 'ionic-angular';

import {StatusBar} from 'ionic-native';

import {HelloIonicPage} from '../pages/hello-ionic/hello-ionic';
import {RecordingPage} from '../pages/recording/recording';
import {TracksPage} from '../pages/tracks/tracks';
import {RunningPage} from "../pages/running/running";
import {SettingsPage} from "../pages/settings/settings";
import { AlertController, LoadingController } from 'ionic-angular';


import {TrackService, Track} from "../providers/track-service/track-service";
declare var google;


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  private readonly HASH_KEY: string = "PARCOURS_HASH";

  runTab:any;
  parcoursTab:any;
  settingsTab:any;
  recordingTab: any;
  loaderDialog: any;
  confirmationDialog: any;

  // make HelloIonicPage the root (or first) page
  rootPage:any = HelloIonicPage;

  constructor(public platform:Platform, public menu:MenuController, private trackService:TrackService, private http:Http,
              public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

    this.initializeApp();

    this.runTab = RunningPage;
    this.parcoursTab = TracksPage;
    this.settingsTab = SettingsPage;
    this.recordingTab = RecordingPage;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      this.trackService.init().subscribe((state) => this.updateDatabase());
    });
  }


  private updateDatabase(){
      this.http.get('https://ed140ztplk.execute-api.us-west-2.amazonaws.com/prod/vitaparcours/hash').map(response => response.text()).subscribe(
        hash => {
          this.trackService.getOption(this.HASH_KEY).subscribe(option => {
            if (option === null || option !== hash){
              //new Download of Parcours needed!
              this.showConfirmationDialog(hash);
            }else{
              //this.showTabs();
            }
          });

              },
              error => {
                  console.error("Error occured: " + error);
              }
          );
      }

  private updateVitaparcours(hash: string){
      this.http.get('https://ed140ztplk.execute-api.us-west-2.amazonaws.com/prod/vitaparcours').map(response => response.text()).subscribe(
        json => {
          let tracks: Array<Track> = JSON.parse(json);
          console.log("Received " + tracks.length + " vitaparcours");

          let observerArray: Array<Observable<string>> = this.trackService.updateAllTracks(tracks);

          Observable.forkJoin(observerArray).subscribe(() => {
            console.log('All Tracks updated successfully');
            this.insertHashKey(hash);
          });
        },
        error => {
          console.error("Error while reading parcours from server: " + error);
        });
      }

  private insertHashKey(hash: string){
      this.trackService.setOption(this.HASH_KEY, hash.toString()).subscribe(() => {
        console.log("Hash Updated successfully");
        this.loaderDialog.dismiss();
      });
    }

  updateTracks(){
    console.log("Updating tracks");
    //this.nav.push(TracksPage);
  }

  showConfirmationDialog(hash: string) {

    this.confirmationDialog = this.alertCtrl.create({
      title: 'Update available',
      message: 'Do you want to update to latest vitaparcours now?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.showLoaderDialog();
            this.updateVitaparcours(hash);
          }
        },
        {
          text: 'No, ask me later',
          handler: () => {
            //TODO: Show normal tab
          }
        }
      ]
    });

    this.confirmationDialog.present();
  }

  showLoaderDialog(){

    this.loaderDialog = this.loadingCtrl.create({
      content: "Updating Database..."
    });

    this.loaderDialog.present();
  }



}

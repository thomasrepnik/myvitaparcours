import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, ToastController, AlertController} from 'ionic-angular';
import {TrackService, Position} from "../../providers/track-service/track-service";
import {MapController} from "./mapcontroller";
import {TrackUtil} from "./trackUtil";


declare var google;

@Component({
  templateUrl: 'recording.html'
})
export class RecordingPage {

  @ViewChild('map')
  mapElement:ElementRef;

  mapController:MapController;

  geolocationOptions = {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: 5000
  };

  toggleIcon:string;
  watch:any;
  markerButtonDisabled = true;


  constructor(public navCtrl:NavController, public trackService:TrackService, public alertCtrl:AlertController, public toastCtrl: ToastController) {


  }

  ngAfterViewInit() {
    this.loadMap();
    this.toggleIcon = "arrow-dropright-circle";
  }


  showSavePrompt(){
    this.mapController.getPostalLocation()
      .then((value) => {
        this.saveTrack(value);
      })
      .catch((value) => {
        console.log("showing save prompt without location: " + value);
        this.showSavePromptDialog();
      })
  }

  private showSavePromptDialog(placeHolder = "") {

    let prompt = this.alertCtrl.create({
      title: 'Speichern',
      message: "Gib deinem Vitaparcours einen Namen",
      inputs: [
        {
          name: 'name',
          placeholder: placeHolder
        },
      ],
      buttons: [
        {
          text: 'Abbrechen',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Speichern',
          handler: data => {
            this.saveTrack(data.name);
          }
        }
      ]
    });
    prompt.present();

  }

  saveTrack(trackName:string) {
    console.log("Saving track: " + trackName);
    this.trackService.saveTrack(this.mapController.createTrack(trackName)).subscribe((state) => {

      this.mapController.reset();

      let toast = this.toastCtrl.create({
        message: "Track saved under '" + trackName + "'",
        position: 'middle',
        showCloseButton: true,
        closeButtonText: 'Ok'
      });

      toast.present();
    });
  }



  toggleRecording() {
    if (this.toggleIcon === "arrow-dropright-circle") {
      this.startRecording();
      this.toggleIcon = "checkmark-circle";
      this.markerButtonDisabled = false;
    } else {
      this.stopRecording();
      this.toggleIcon = "arrow-dropright-circle";
      this.markerButtonDisabled = true;

      if (this.mapController.getStationMarkers().length > 0){
        this.showSavePrompt();
      }
    }
  }

  startRecording() {
    this.mapController.startRecording();
  }


  addExcercisePosition() {
    this.mapController.addStationMarker();
  }

  stopRecording() {
    navigator.geolocation.clearWatch(this.watch);
    this.mapController.stopRecording();
  }


  loadMap() {
    this.mapController = new MapController(this.mapElement.nativeElement);

    this.watch = navigator.geolocation.watchPosition((position) => {
      this.mapController.updatePosition(TrackUtil.convertToPosition(position));
    }, (positionError) => {
      console.log('Error ' + positionError.code + ': ' + positionError.message);
    }, this.geolocationOptions);
  }

}

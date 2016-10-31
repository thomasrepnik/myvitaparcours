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

  stationMarkers:Array<any> = [];

  toggleCaption:any;


  stations:Array<Position> = [];

  vitaparcours:any;
  watch:any;




  constructor(public navCtrl:NavController, public trackService:TrackService, public alertCtrl:AlertController, public toastCtrl: ToastController) {


  }

  ngAfterViewInit() {
    this.loadMap();
    this.toggleCaption = "Start";

    /*this.dataService.getData().then((todos) => {

     if (todos) {
     console.log("Received data from SQL Storage: " + JSON.parse(todos));
     }

     });*/
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
    this.trackService.saveTrack(this.mapController.createTrack(trackName));

    let toast = this.toastCtrl.create({
      message: "Track saved under '" + trackName + "'",
      duration: 3000
    });

    toast.present();
  }



  toggleRecording() {
    if (this.toggleCaption === "Start") {
      this.startRecording();
      this.toggleCaption = "Stop";
    } else {
      this.stopRecording();
      this.toggleCaption = "Start";
    }
  }

  startRecording() {
    this.mapController.startRecording();
  }


  addExcercisePosition() {
    let position:Position = this.mapController.addStationMarker();
    this.stations.push(position);
  }

  deleteExcercise(marker) {
    let position:Position = this.mapController.removeStationMarker(marker);
    let index:number = this.stations.indexOf(position);
    this.stations.splice(index, 1);
  }

  stopRecording() {
    navigator.geolocation.clearWatch(this.watch);
    this.mapController.stopRecording();
  }


  loadMap() {
    this.mapController = new MapController(this.mapElement.nativeElement);
    this.stationMarkers = this.mapController.getStationMarkers();


    this.watch = navigator.geolocation.watchPosition((position) => {
      this.mapController.updatePosition(TrackUtil.convertToPosition(position));
    }, (positionError) => {
      console.log('Error ' + positionError.code + ': ' + positionError.message);
    }, this.geolocationOptions);
  }

}

import {Position, Track} from "../../providers/track-service/track-service";
import {isUndefined} from "ionic-angular/util/util";
import {
  GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, CameraPosition, GoogleMapsMarkerOptions,
  GoogleMapsMarker, GoogleMapsPolyline
} from 'ionic-native';

import 'rxjs/Rx';
import {Station} from "../running/station";
import {TrackUtil} from "./trackUtil";


declare var google;
declare var GeolocationMarker:any; // Magic


export class MapController {
  stationMarkers:any = [];
  map: GoogleMap;
  startPoint:Position;
  wayPoints:Array<GoogleMapsLatLng> = [];
  stationPoints:Array<Station> = [];
  polyline:GoogleMapsPolyline;
  lastPosition:GoogleMapsLatLng;
  recordingEnabled: boolean;

  constructor(mapElement:any) {

    let mapOptions = {
      'controls': {
        'compass': false,
        'myLocationButton': true,
        'indoorPicker': false,
        'zoom': false // Only for Android
      },
      'gestures': {
        'scroll': true,
        'tilt': false,
        'rotate': false,
        'zoom': true
      },
      'camera': {
        'latLng': new GoogleMapsLatLng(47.046203, 8.320191),
        'tilt': 0,
        'zoom': 17,
        'bearing': 50
      }
    }


    this.map = new GoogleMap(mapElement, mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!')

    });

  }

  public getStationMarkers():Array<any> {
    return this.stationMarkers;
  }

  public startRecording(){
   this.recordingEnabled = true;
  }

  public stopRecording(){
    this.recordingEnabled = false;
  }

  public updatePosition(position:Position) {

    let newPosition: GoogleMapsLatLng = new GoogleMapsLatLng(position.lat, position.lng);

    if (this.recordingEnabled){
      this.recordNewPosition(newPosition);
    }else{
      this.map.setCenter(newPosition);
    }
  }

  private recordNewPosition(newPosition: GoogleMapsLatLng){

    if (isUndefined(this.startPoint)) {
      this.startPoint = new Position(newPosition.lat, newPosition.lng, 0);
      console.log("Set Startpoint to " + newPosition.lat + "  " + newPosition.lng);

      //Erster Eintrag im Pfad (Polyline) erstellen für aktuelle startposition
      this.updatePolyLine(newPosition);
    }

    if (isUndefined(this.lastPosition)){
      //Initial die letzte Position auf die aktuelle Position setzen (Distanz = 0m)
      this.lastPosition = new GoogleMapsLatLng(newPosition.lat, newPosition.lng);
    }

    //let distance = google.maps.geometry.spherical.computeDistanceBetween(newPosition, this.currentPositionMarker.getPosition());
    console.log("LastPosition: " + this.lastPosition.lat + " / " + this.lastPosition.lng);
    console.log("NewPosition: " + newPosition.lat + " / " + newPosition.lng);

    let distance = google.maps.geometry.spherical.computeDistanceBetween(TrackUtil.convertToWebApiLatLng(this.lastPosition) , TrackUtil.convertToWebApiLatLng(newPosition));
    if (distance <= 10) {
      console.log("Ignoring new Position --> distance was only " + distance + " meters");
      return;
    }

    console.log("New position: " + newPosition.lat + "  " + newPosition.lng);


    this.updatePolyLine(newPosition);
    this.map.setCenter(newPosition);
    this.lastPosition =  new GoogleMapsLatLng(newPosition.lat, newPosition.lng);
  }

  public addStationMarker():Position {
    let marker = new google.maps.Marker({
      map: this.map,
      position: this.lastPosition
    });

    this.stationMarkers.push(marker);
    this.stationPoints.push(new Station(new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0)));

    return new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0);
  }

  private updatePolyLine(latlng: GoogleMapsLatLng) {
    this.wayPoints.push(latlng);

    if (isUndefined(this.polyline)){
      this.map.addPolyline({
        points: this.wayPoints,
        visible: true,
        color: "red",
        width: 3
      }).then((polyline) => {
        this.polyline = polyline;
        console.log('Polyline initialized!')
      }).catch((value) => {
        console.log("error while initializing polyline: " + value);
      })
    }else{
      this.polyline.setPoints(this.wayPoints);
    }

  }

  public removeStationMarker(marker:any):Position {
    let result:Position = new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0);
    let index:number = this.stationMarkers.indexOf(marker);
    this.stationMarkers[index].setMap(null);
    this.stationMarkers.splice(index, 1);

    let station = this.stationPoints.filter((station) => station.position === result)[0];
    let index2:number = this.stationPoints.indexOf(station);
    this.stationPoints.splice(index2, 1);

    return result;
  }

  public createTrack(trackName:string):Track {
    let distance:number = google.maps.geometry.spherical.computeLength(this.polyline.getPoints());
    return new Track(trackName, this.startPoint, Math.floor(distance), null, this.stationPoints); //TODO!!! null
  }


  public getPostalLocation():Promise<string> {



    // return a Promise
    return new Promise((resolve, reject) => {
      let position = this.startPoint;
      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(position.lat, position.lng);

      console.log("Calling google geocoding with coordinates lat:" + position.lat + " lng:" + position.lng);

      geocoder.geocode({'location': latlng}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            let plzArray = results[0].address_components.filter((adrcomponent) => {
              return (adrcomponent.types.indexOf('postal_code') !== -1);
            });

            let locationArray = results[0].address_components.filter((adrcomponent) => {
              return (adrcomponent.types.indexOf('locality') !== -1);
            });

            if (plzArray[0] && locationArray[0]) {
              let plz = plzArray[0].long_name;
              let city = locationArray[0].short_name;
              console.log("resolved geocoding: " + plz + " " + city);
              resolve(plz + " " + city);
            }

          } else {
            console.log("no geocoding results found");
            resolve("");
          }
        } else {
          console.error("Error returned from geocoding: " + status);
          reject(status)
        }
      });

    });
  }


}

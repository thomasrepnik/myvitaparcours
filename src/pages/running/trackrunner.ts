import {Track, Position} from "../../providers/track-service/track-service";
import {isUndefined} from "ionic-angular/util/util";

declare var google;


export class TrackRunner {

  track: Track;
  currentSpeed: number;
  totalAltitude: number = 0;



  private lastValidAltitude: number = undefined;
  private lastAltitude: number = 0;
  private validAltitudeCounter: number = 0;

  constructor(track: Track){
    this.track = track;
  }

  public processPosition(position: Position, speed: number, altitude: number){
    this.currentSpeed = Math.floor(speed * 3.6); //Umrechnung in km/h
    //this.totalAltitude = this.totalAltitude + Math.abs(isUndefined(this.lastAltitude) ? 0 : this.lastAltitude - Math.floor(altitude));
    //this.lastAltitude = Math.floor(altitude);
    console.log("TrackRunner received new position: " + position.lat + " " + position.lng);

    this.calculateAltitude(Math.floor(altitude));
    this.checkStationsForVisits(position);

    console.log("Current speed3: " + this.currentSpeed);
    console.log("Last altitude3: " + this.lastAltitude);
    console.log("Last valid altitude3: " + this.lastValidAltitude);
    console.log("Total altitude3: " + this.totalAltitude);
  }

  private calculateAltitude(altitude: number){
    if (this.lastAltitude === altitude){
      this.validAltitudeCounter++;

      if (this.validAltitudeCounter === 5){
        if (!isUndefined(this.lastValidAltitude)){
          this.totalAltitude = this.totalAltitude + Math.abs(this.lastValidAltitude - altitude);
        }

        this.lastValidAltitude = altitude;
      }
    }else{
      this.validAltitudeCounter = 0;
    }

    this.lastAltitude = altitude
  }

  private checkStationsForVisits(position: Position){
    this.track.stations.filter(station => {
      let stationPosition = new google.maps.LatLng(station.position.lat, station.position.lng);
      let currentPosition = new google.maps.LatLng(position.lat, position.lng);
      let distance = google.maps.geometry.spherical.computeDistanceBetween(stationPosition, currentPosition);
      return distance < 15;
    }).forEach(station => {
      station.visited = true;
    });
  }
}

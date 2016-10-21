import {IPosition, Position, Track} from "../../providers/track-service/track-service";
import {isUndefined} from "ionic-angular/util/util";

import 'rxjs/Rx';


declare var google;

export class MapController {
  stationMarkers:any = [];
  currentPositionMarker:any;
  map:any;
  startPoint:IPosition;
  wayPoints:Array<IPosition> = [];
  stationPoints:Array<IPosition> = [];
  polyline:any;

  locatorImage:any = {
    url: 'assets/images/locator.png',
    scaledSize: new google.maps.Size(26, 26),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(13, 13)
  };

  constructor(mapElement:any) {

    let mapOptions = {
      //center: latLng,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      draggable: true,
      zoomControl: true,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      mapTypeControl: false,
      streetViewControl: false
    };

    this.map = new google.maps.Map(mapElement, mapOptions);

  }

  public getStationMarkers():Array<any> {
    return this.stationMarkers;
  }

  public updateCurrentPosition(position:IPosition) {

    let latLng = new google.maps.LatLng(position.lat, position.lng);

    this.currentPositionMarker = new google.maps.Marker({
      map: this.map,
      position: latLng,
      icon: this.locatorImage
    });

    this.map.setCenter(latLng);

    this.updatePolyLine(latLng);
  }

  public updateWatchedPosition(position:IPosition) {
    let newPosition = new google.maps.LatLng(position.lat, position.lng);

    let distance = google.maps.geometry.spherical.computeDistanceBetween(newPosition, this.currentPositionMarker.getPosition());
    if (distance <= 10) {
      console.log("Ignoring new Position --> distance was only " + distance + " meters");
      return;
    }

    if (isUndefined(this.startPoint)) {
      this.startPoint = position;
    }

    console.log("New position: " + position.lat + "  " + position.lng);

    this.currentPositionMarker.setPosition(newPosition);

    this.updatePolyLine(newPosition);
  }

  public addStationMarker():IPosition {
    let marker = new google.maps.Marker({
      map: this.map,
      position: this.currentPositionMarker.getPosition()
    });

    this.stationMarkers.push(marker);
    this.stationPoints.push(new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0));

    return new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0);
  }

  private updatePolyLine(latlng:any) {
    this.wayPoints.push(new Position(latlng.lat(), latlng.lng(), 0));

    if (isUndefined(this.polyline)) {

      this.polyline = new google.maps.Polyline({
        path: [latlng],
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillOpacity: 0.0
      });

      this.polyline.setMap(this.map);
    } else {
      this.polyline.getPath().push(latlng);
    }
  }

  public removeStationMarker(marker:any):IPosition {
    let result:IPosition = new Position(marker.getPosition().lat(), marker.getPosition().lng(), 0);
    let index:number = this.stationMarkers.indexOf(marker);
    this.stationMarkers[index].setMap(null);
    this.stationMarkers.splice(index, 1);

    let index2:number = this.stationPoints.indexOf(result);
    this.stationPoints.splice(index2, 1);

    return result;
  }

  public createTrack(trackName:string):Track {
    let distance:number = google.maps.geometry.spherical.computeLength(this.polyline.getPath().getArray());
    return new Track(trackName, this.startPoint, Math.floor(distance), this.wayPoints, this.stationPoints);
  }


  public getPostalLocation():Promise<string> {



    // return a Promise
    return new Promise(function (resolve, reject) {

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

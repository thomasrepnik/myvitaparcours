import {Position} from "../../providers/track-service/track-service";
import {Geoposition, GoogleMapsLatLng} from 'ionic-native';

declare var google;

export class TrackUtil {

  public static convertToPosition(source: Geoposition): Position {
    return new Position(source.coords.latitude, source.coords.longitude, source.coords.altitude);
  }

  public static convertGoogleMapsLatLngToPosition(source: GoogleMapsLatLng) : Position {
    return new Position(source.lat, source.lng, 0);
  }

  public static convertToWebApiLatLng(latlng: GoogleMapsLatLng){
    return new google.maps.LatLng(latlng.lat, latlng.lng);
  }

  public static convertToWebApiLatLngArray(input: Array<GoogleMapsLatLng>) : Array<any>{
    let result = [];
    input.forEach((position: GoogleMapsLatLng) => {
      result.push(this.convertToWebApiLatLng(position));
    });
    return result;
  }

  public static convertToPositionArray(input: Array<GoogleMapsLatLng>) : Array<any>{
    let result = [];
    input.forEach((position: GoogleMapsLatLng) => {
      result.push(this.convertGoogleMapsLatLngToPosition(position));
    });
    return result;
  }

}

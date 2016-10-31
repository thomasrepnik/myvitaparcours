import {Position} from "../../providers/track-service/track-service";
import {Geoposition, GoogleMapsLatLng} from 'ionic-native';

declare var google;

export class TrackUtil {

  public static convertToPosition(source: Geoposition): Position {
    return new Position(source.coords.latitude, source.coords.longitude, source.coords.altitude);
  }

  public static convertToWebApiLatLng(latlng: GoogleMapsLatLng){
    return new google.maps.LatLng(latlng.lat, latlng.lng);
  }

}

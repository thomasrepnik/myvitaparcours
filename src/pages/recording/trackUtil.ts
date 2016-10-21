import {Position} from "../../providers/track-service/track-service";
import {Geoposition} from 'ionic-native';

export class TrackUtil {

  public static convertToPosition(source: Geoposition): Position {
    return new Position(source.coords.latitude, source.coords.longitude, source.coords.altitude);
  }

}

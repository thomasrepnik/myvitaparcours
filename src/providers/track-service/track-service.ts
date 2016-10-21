import {SQLite} from 'ionic-native';
import {Injectable} from '@angular/core';

export interface IPosition {
  lat:number;
  lng:number;
  altitude:number;
}

export class Position implements IPosition {
  lat:number;
  lng:number;
  altitude:number;

  constructor(lat:number, lng:number, altitude:number) {
    this.lat = lat;
    this.lng = lng;
    this.altitude = altitude;
  }
}

export class Track {
  id:number;
  name:string;
  startPoint: IPosition;
  waypoints:Array<IPosition>;
  stations:Array<IPosition>;
  distanceInMeters: number;

  constructor(name:string, startPoint:IPosition, distance: number, waypoints:Array<IPosition>, stations:Array<IPosition>, id?:number) {
    this.id = id;
    this.name = name;
    this.startPoint = startPoint;
    this.waypoints = waypoints;
    this.stations = stations;
    this.distanceInMeters = distance;
  }

}

@Injectable()
export class TrackService {

  db:SQLite;

  // Init an empty DB if it does not exist by now!
  constructor() {

  }

  public init(){
    console.log("init called");

    this.openDatabase();
  }

  private openDatabase() {
    console.log("createAndOpenDatabase called");

    this.db = new SQLite();
    this.db.openDatabase({
      name: 'myparcours.db',
      location: 'default' // the location field is required
    }).then(() => {
      console.log("Database opened successfully");
      this.setUpTables();
    }, (err) => {
      console.error('Unable to open database: ', err);
    });
  }

  private setUpTables(){
    this.db.executeSql('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(50), startpoint VARCHAR(50), distance INTEGER, waypoints TEXT, stations TEXT)', {}).then(() => {
      console.log("Tables successfully created");
    }, (err) => {
      console.error('Unable to execute sql: ', err);
    });
  }

  // Get all notes of our DB
  public getTracks():Array<Track> {

    console.log("getTracks called");
    let tracks:Array<Track> = [];

    this.db.executeSql('SELECT * FROM tracks', {}).then(
      resultSet => {
        if (resultSet.rows.length > 0) {
          for (var i = 0; i < resultSet.rows.length; i++) {
            let item = resultSet.rows.item(i);
            let startPoint: IPosition = JSON.parse(item.startpoint);
            let waypoints: Array<IPosition> = JSON.parse(item.waypoints);
            let stations: Array<IPosition> = JSON.parse(item.stations);

            tracks.push(new Track(item.name, startPoint, item.distance, waypoints, stations, item.id));
          }
        }
      });

    return tracks;
  }

  // Save a new note to the DB
  public saveTrack(track: Track) {
    let sql = 'INSERT INTO tracks (name, startpoint, distance, waypoints, stations) VALUES (?,?,?,?,?)';
    this.db.executeSql(sql, [track.name, JSON.stringify(track.startPoint), track.distanceInMeters, JSON.stringify(track.waypoints), JSON.stringify(track.stations)]).then(() => {
      //evtl. ID zurückgeben?
    }, (err) => {
      console.error('Unable to execute sql: ', err);
    });
  }

  // Remoe a not with a given ID
  public removeNote(track:Track) {
    let sql = 'DELETE FROM tracks WHERE id = \"' + track.id + '\"';
    this.db.executeSql(sql, {});
  }

  public clearDatabase(){
    let sql = "DROP TABLE tracks";
    this.db.executeSql(sql, {}).then( () => {
      console.log("Table successfully dropped");
      this.setUpTables();
    }, (err) => {
      console.error("Error while dropping table: " + err.message);
    });
  }
}

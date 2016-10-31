import {SQLite} from 'ionic-native';
import {Injectable} from '@angular/core';
import {Station} from "../../pages/running/station";
import {Observable} from 'rxjs/Rx';
import 'rxjs/Rx';

export class Position {
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
  startPoint:Position;
  waypoints:Array<Position>;
  stations:Array<Station>;
  distanceInMeters:number;

  constructor(name:string, startPoint:Position, distance:number, waypoints:Array<Position>, stations:Array<Station>, id?:number) {
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

  public init(): Observable<string> {
    console.log("init called");

    return this.openDatabase();
  }

  private setupOptionTable():Observable<string> {
    return new Observable<string>(observer => {
      this.db.executeSql('CREATE TABLE IF NOT EXISTS options (key VARCHAR(50), value VARCHAR(50), UNIQUE(key) ON CONFLICT ABORT)', {}).then(() => {
        console.log("Options Table successfully created");
        observer.next("OK");
        observer.complete();
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        observer.error(err);
      });

    });
  }

  private openDatabase():Observable<string> {
    return new Observable<string>(observer => {

      console.log("createAndOpenDatabase called");

      this.db = new SQLite();
      this.db.openDatabase({
        name: 'myparcours.db',
        location: 'default' // the location field is required
      }).then(() => {
        console.log("Database opened successfully");
        this.setUpTables();
        observer.next("OK");
        observer.complete();
      }, (err) => {
        console.error('Unable to open database: ', err);
        observer.error(err);
      });

    });


  }

  private setUpTables() {
    let observable1 = this.setupTrackTables();
    let observable2 = this.setupOptionTable();

    Observable.forkJoin(observable1, observable2).subscribe(() => console.log('All Tables created successfully'));
  }

  private setupTrackTables():Observable<string> {
    return new Observable<string>(observer => {

      this.db.executeSql('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(50), start_lat NUMERIC, start_lng NUMERIC, distance INTEGER, waypoints TEXT, stations TEXT, builtin INTEGER DEFAULT FALSE)', {}).then(() => {
        console.log("Track Table successfully created");
        observer.next("OK");
        observer.complete();
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        observer.error(err);
      });
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
            let startPoint:Position = new Position(item.start_lat, item.start_lng, 0);
            let waypoints:Array<Position> = JSON.parse(item.waypoints);
            let stations:Array<Station> = JSON.parse(item.stations);

            if (stations === null) {
              stations = new Array<Station>();
            }

            tracks.push(new Track(item.name, startPoint, item.distance, waypoints, stations, item.id));
          }
        }
      });

    return tracks;
  }

  replacer = function (key, value) {
    if (key === "visited") {
      return undefined;
    } else {
      return value;
    }
  };

  // Save a new note to the DB
  public saveTrack(track:Track, builtin = false) {
    return new Observable<string>(observer => {
      let sql = 'INSERT INTO tracks (name, start_lat, start_lng, distance, waypoints, stations, builtin) VALUES (?,?,?,?,?,?,?)';
      this.db.executeSql(sql, [track.name, track.startPoint.lat, track.startPoint.lng, track.distanceInMeters, JSON.stringify(track.waypoints), JSON.stringify(track.stations, this.replacer), builtin]).then(() => {
        observer.next("OK");
        observer.complete();
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        observer.error(err);
      });
    });
  }

  public updateAllTracks(tracks:Array<Track>): Array<Observable<string>> {
    let sql = 'DELETE FROM tracks WHERE builtin = 1';
    this.db.executeSql(sql, []).then(() => {
      //evtl. ID zurückgeben?
    }, (err) => {
      console.error('Unable to execute sql: ', err);
    });

    let observableBatch:Array<Observable<string>> = [];

    tracks.forEach((track) => {
      observableBatch.push(this.saveTrack(track));
    });

    return observableBatch;
  }


  public getOption(key:string):Observable<string> {
    return new Observable<string>(observer => {
      let sql = 'SELECT value FROM options where key = ?';
      this.db.executeSql(sql, [key]).then(
        resultSet => {
          if (resultSet.rows.length === 1) {
            observer.next(resultSet.rows.item(0).value);
          } else {
            observer.next(null);
          }

          observer.complete();
        }, (err) => {
          console.error('Unable to execute sql: ', err);
          observer.error("Error while executing sql. Please check the logs!");
        });
    });
  }

  public setOption(key:string, value:string): Observable<string> {
    return new Observable<string>(observer => {
      let sql = 'INSERT INTO options (key, value) VALUES (?,?)';
      this.db.executeSql(sql, [key, value]).then(() => {
        console.log("Option '" + key + "' with value '" + value + "' set!")
        observer.next("OK");
        observer.complete();
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        observer.error(err);
      });
    });

  }


  public getNearestTrack(position:Position):Observable<Track> {
    console.log("getNearestTrack called: lat: " + position.lat + " lng: " + position.lng);

    return new Observable<Track>(observer => {
      let sql = 'SELECT * FROM tracks ORDER BY ((start_lat-?)*(start_lat-?)) + ((start_lng - ?)*(start_lng - ?)) ASC';
      this.db.executeSql(sql, [position.lat, position.lat, position.lng, position.lng]).then(
        resultSet => {

          if (resultSet.rows.length > 0) {
            let item = resultSet.rows.item(0);

            let startPoint:Position = new Position(item.start_lat, item.start_lng, 0);
            let waypoints:Array<Position> = JSON.parse(item.waypoints);
            let stations:Array<Station> = JSON.parse(item.stations);
            if (stations === null) {
              stations = new Array<Station>();
            }

            console.log("Name: " + item.name);
            console.log("Distance: " + item.distance);

            observer.next(new Track(item.name, startPoint, item.distance, waypoints, stations, item.id));
          } else {
            observer.error("No nearest vitaparcours found");
          }
        }, (err) => {
          console.error('Unable to execute sql: ', err);
          observer.error("Error while executing sql. Please check the logs!");
        });


    });

  }

  // Remoe a not with a given ID
  public removeNote(track:Track) {
    let sql = 'DELETE FROM tracks WHERE id = \"' + track.id + '\"';
    this.db.executeSql(sql, {});
  }

  public clearDatabase() {

    let p1  = this.db.executeSql("DROP TABLE tracks", {}).then(() => {
      console.log("Track table successfully dropped");
    }, (err) => {
      console.error("Error while dropping table: " + err.message);
    });

    let p2  = this.db.executeSql("DROP TABLE options", {}).then(() => {
      console.log("Option table successfully dropped");
    }, (err) => {
      console.error("Error while dropping table: " + err.message);
    });

    Promise.all([p1, p2]).then(values => {
      console.log("Database cleared successfully");
      this.setUpTables();
    });

  }


}

import { Component } from '@angular/core';
import {Station} from "../running/station";
import {Position} from "../../providers/track-service/track-service";

declare var google;


@Component({
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor() {

  }


  public doit2(){

    let station = new Station(new Position(1.1, 2.2, 0));

    let str = JSON.stringify(station);

    let station2 = <Station>JSON.parse(str);

    console.log(station2.position.lat + " / " + station2.position.lng);
  }

  public doit() {
    var geocoder = new google.maps.Geocoder;
    let latlng = new google.maps.LatLng(47.032120,8.318303);

    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          let plzArray = results[0].address_components.filter((adrcomponent) => {
            return (adrcomponent.types.indexOf('postal_code') !== -1);
          });

          let locationArray = results[0].address_components.filter((adrcomponent) => {
            return (adrcomponent.types.indexOf('locality') !== -1);
          });

          if (plzArray[0] && locationArray[0]){
            let plz = plzArray[0].long_name;
            let city = locationArray[0].short_name;
            console.log(plz);
            console.log(city);
          }


        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });


  }
}

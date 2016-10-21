import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Geolocation} from 'ionic-native';

declare var google;

@Component({
  templateUrl: 'maps.html'
})
export class MapsPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  coordinates: Array<{lat: any, lng: any}>;
  vitaparcours: any;

  constructor(public navCtrl: NavController) {
    this.loadMap();
  }


  loadMap(){

    this.coordinates = [
      {lat: 47.0337768, lng: 8.3136141},
      {lat: 47.0336087, lng: 8.3135712},
      {lat: 47.0333381, lng: 8.3135176},
      {lat: 47.0332065, lng: 8.313421},
      {lat: 47.0331041, lng: 8.3133674},
      {lat: 47.032914, lng: 8.3134854},
      {lat: 47.0327385, lng: 8.3136034},
      {lat: 47.0326215, lng: 8.3136356},
      {lat: 47.0324094, lng: 8.3136034},
      {lat: 47.0323143, lng: 8.3135176},
      {lat: 47.0321388, lng: 8.313303},
      {lat: 47.0319268, lng: 8.313024},
      {lat: 47.0318975, lng: 8.313303},
      {lat: 47.0318683, lng: 8.3135927},
      {lat: 47.0318317, lng: 8.3139038},
      {lat: 47.0318098, lng: 8.3143866},
      {lat: 47.0319487, lng: 8.314333},
      {lat: 47.0321462, lng: 8.3142471},
      {lat: 47.0323802, lng: 8.3142042},
      {lat: 47.0325995, lng: 8.3141613},
      {lat: 47.0327823, lng: 8.314054},
      {lat: 47.0329798, lng: 8.313936},
      {lat: 47.0331772, lng: 8.3140111},
      {lat: 47.0333747, lng: 8.3139575},
      {lat: 47.0335575, lng: 8.3138502},
      {lat: 47.0337768, lng: 8.3136141},
    ];

    Geolocation.getCurrentPosition().then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.vitaparcours = new google.maps.Polygon({
        paths: this.coordinates,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillOpacity: 0.0
      });
      this.vitaparcours.setMap(this.map);

    }, (err) => {
      console.log(err);
    });

  }

  addMarker(){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4><br/>lat:" + marker.getPosition().lat() + "<br/>lng:" + marker.getPosition().lng();


    if (google.maps.geometry.poly.isLocationOnEdge(marker.getPosition(), this.vitaparcours, 0.0001)) {
      content = content + "<br/>NEAR VITAPARCOURS!!";
    }



    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }
}

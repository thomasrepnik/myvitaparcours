import {Component} from '@angular/core';
import { NavController } from 'ionic-angular';
import {SettingsPage} from "../settings/settings";

@Component({
  templateUrl: 'tab.html'
})
class TabPage {

  tab1: any;
  tab2: any;
  tab3: any;

  constructor(private navCtrl: NavController) {
    this.tab1 = null;
    this.tab2 = null;
    this.tab3 = SettingsPage;
  }
}

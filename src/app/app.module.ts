import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { MapsPage } from "../pages/maps/maps";
import { RecordingPage } from "../pages/recording/recording";
import { TracksPage } from "../pages/tracks/tracks";
import { Storage } from '@ionic/storage';
import { Data } from '../providers/data';
import {TrackService} from "../providers/track-service/track-service";
import {SettingsPage} from "../pages/settings/settings";
import {RunningPage} from "../../.tmp/pages/running/running";

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    MapsPage,
    RecordingPage,
    TracksPage,
    SettingsPage,
    RunningPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    MapsPage,
    RecordingPage,
    TracksPage,
    SettingsPage,
    RunningPage
  ],
  providers: [Storage, Data, TrackService]
})
export class AppModule {}

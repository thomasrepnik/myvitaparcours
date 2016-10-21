import { Storage } from '@ionic/storage';
import {Injectable} from '@angular/core';

@Injectable()
export class Data {

  constructor(public storage: Storage){

  }

  getData(key: string) {
    return this.storage.get(key);
  }

  save(key: string, data){
    let newData = JSON.stringify(data);
    this.storage.set(key, newData);
  }

}

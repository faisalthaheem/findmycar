import {Injectable} from '@angular/core';
import { Events } from 'ionic-angular';

import { BLE, BLEScanOptions } from '@ionic-native/ble';
import { MapProvider } from './mapprovider';

@Injectable()
export class BluetoothlocationProvider {


  filterKnown = true;
  mapSensors = {}

  constructor(
    private ble: BLE,
    private mapProvider: MapProvider,
    public events: Events
  ) {

    this.mapProvider.loadMap().then((result) => {

      this.mapSensors = JSON.parse(this.mapProvider.getMapProperty('btsensors'));
    });

  }

  start(filterKnown: boolean = true){


    this.filterKnown = filterKnown;

    this.ble.startScanWithOptions([],{'reportDuplicates':true}).subscribe(device => {

      //console.log(device.id, device.rssi);

      if(!this.filterKnown){

        this.events.publish('btloc:device', 0,0, device);
      }

    });

  }

  stop(){

    this.ble.stopScan();

  }

}

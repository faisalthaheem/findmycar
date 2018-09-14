import {Injectable} from '@angular/core';
import { Events } from 'ionic-angular';

import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';
import { MapProvider } from './mapprovider';

@Injectable()
export class WifilocationProvider {

  mapSensors = {}

  //refernces
  wifiScanTimer: any = null;

  constructor(
    private hotspot: Hotspot,
    private mapProvider: MapProvider,
    public events: Events
  ) {

    this.mapProvider.loadMap().then((result) => {

      this.mapSensors = JSON.parse(this.mapProvider.getMapProperty('btsensors'));
    });

  }

  scanWifi(){

    this.hotspot.scanWifi().then((networks: Array<HotspotNetwork>) => {

      //console.log(".........hotspot..........",JSON.stringify(networks));
      //find the network with greatest strenth
      if(networks.length == 0 ){
        return;
      }

      var strongestSignal = -200;
      var atLocation = '';

      //sort descending.. strongest to weakest
      if(networks.length > 1){
        networks.forEach(network => {
          if(network.level > strongestSignal){
            strongestSignal = network.level

            //search in loaded sensors
            Object.keys(this.mapSensors).forEach(kval => {
              //console.log(this.mapSensors[kval], ' =? ', network.BSSID)
              if(this.mapSensors[kval] == network.BSSID){
                atLocation = kval;
              }
            });
          }
        });
      }

      if(atLocation.length > 0){

        var rowAndCol = atLocation.split(":");
        //console.log('updating location to ', JSON.stringify(rowAndCol));
        this.events.publish('wifiloc:device', rowAndCol[0], rowAndCol[1]);
      }

    });
  }

  start(){

    this.wifiScanTimer = setInterval(() => {
      this.scanWifi();
    }, 1000);

    //call once to center in on user
    this.scanWifi();

  }

  stop(){
    //stop scanning
    clearInterval(this.wifiScanTimer);
  }

}

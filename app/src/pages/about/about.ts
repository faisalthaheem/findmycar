import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { BluetoothlocationProvider } from '../../providers/btlocationprovider';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  devices: any = {};
  devicesKeys:any = [];
  currBLESensorId: string = '';
  currBLESensorRssi: any;


  constructor(
    public navCtrl: NavController,
    private btlocation: BluetoothlocationProvider,
    public events: Events
  ) {
    this.devices = {};

    events.subscribe('btloc:device', (locX, locY, device) => {

      //this.devices.push(device);
      //console.log(locX,locY,JSON.stringify(device));

      var highestRssi = -200;
      var highestRssiId = '';
      var loopedTillIndex = 0;

      var found = false;
      this.devicesKeys = Object.keys(this.devices);

      for(var k in this.devicesKeys){

        loopedTillIndex = loopedTillIndex +1;

        if(this.devices[k] != null && this.devices[k].rssi > highestRssi){
          highestRssi = this.devices[k].rssi;
          highestRssiId = k;
        }

         if(k == device.id){
           //update
           this.devices[k].rssi = device.rssi;
           found=true;
           break;
         }
      }

      if(!found){
        this.devices[device.id] = device;

        if(device.rssi > highestRssi){
          highestRssi = device.rssi;
          highestRssiId = device.id;
        }
      }else{
        //we still need to check remaining devices in our list to find the highest rssi
        for(var i = loopedTillIndex; i<this.devicesKeys.length; i++){
          if(this.devices[this.devicesKeys[i]].rssi > highestRssi){
            highestRssi = this.devices[this.devicesKeys[i]].rssi;
            highestRssiId = this.devicesKeys[i];
          }
        }
      }

      this.currBLESensorId = highestRssiId;
      this.currBLESensorRssi = highestRssi;
    });
  }

  ionViewWillEnter(){
    this.btlocation.start(false);
  }

  ionViewDidLeave(){
    this.btlocation.stop();
  }

}

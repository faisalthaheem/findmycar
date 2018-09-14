import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

// DeviceOrientationCompassHeading is an interface for compass
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { Insomnia } from '@ionic-native/insomnia';
import { BLE, BLEScanOptions } from '@ionic-native/ble';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  //subscriptions
  compassSubscription: any;
  // https://stackoverflow.com/questions/40437537/ionic-2-how-to-use-cordova-events-pause-resume
  onResumeSubscription: any;

  //constants
  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: 'rear',
    tapPhoto: false,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  //view bound
  currentHeading: number;
  plstyle: any = {
    top: '-130px',
    left: '-130px'
  };
  targetHeading: number = 57.0;
  trackingInProgress: boolean = false;
  showLeftArrow = false;
  showRightArrow = false;


  trackedPlate: string = '';
  pageTitle: string = 'Find My Car - Cam View';

  devices: any = {};
  devicesKeys:any = [];
  currBLESensorId: string = '';
  currBLESensorRssi: any;

  constructor(
    platform: Platform,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation,
    private cameraPreview: CameraPreview,
    private insomnia: Insomnia,
    private ble: BLE
  ) {

    this.onResumeSubscription = platform.resume.subscribe(() => {

      if(this.trackingInProgress){
      // do something meaningful when the app is put in the foreground
        this.subscribeToEvents();
      }
   });
  }

  newSearch(){

    this.unSubscribeFromEvents();
    this.subscribeToEvents();
    this.trackingInProgress = true;

    this.pageTitle = 'Finding ' + this.trackedPlate;
  }

  stopSearching(){

    this.trackingInProgress = false;
    this.unSubscribeFromEvents();
    this.hidePin();
    this.hideArrows();

    this.pageTitle = 'Find My Car - Cam View';

  }

  ngOnDestroy() {

    this.unSubscribeFromEvents();

    if(null!=this.onResumeSubscription){
      // always unsubscribe your subscriptions to prevent leaks
      this.onResumeSubscription.unsubscribe();
    }
  }

  ionViewWillEnter(){

    if(this.trackingInProgress){
      this.subscribeToEvents();
    }
  }

  ionViewDidLeave(){
    this.unSubscribeFromEvents();
  }

  ionViewCanEnter(){

    this.cameraPreview.startCamera(this.cameraPreviewOpts).then(
      (res) => {
        console.log(res)

        //only show if we are actively tracking
        if(!this.trackingInProgress){
          this.cameraPreview.hide();
        }
      },
      (err) => {
        console.log(err)
      }
    );

  }

  ionViewCanLeave(){

    // Stop the camera preview
    if(null != this.cameraPreview){
      this.cameraPreview.stopCamera();
    }
  }

  hidePin() {

    if(this.plstyle.left == '-130px') {
      return;
    }

    this.plstyle = {
      top: '-130px',
      left: '-130px'
    };
  }

  hideArrows() {
    this.showLeftArrow = false;
    this.showRightArrow = false;
  }

  getHeadingError(current: number, target: number) {

    var diff = target - current;
    var absDiff = Math.abs(diff);

    if (absDiff <= 180)
    {
        return absDiff == 180 ? absDiff : diff;
    }
    else if (target > current)
    {
        return absDiff - 360;
    }
    else
    {
        return 360 - absDiff;
    }

  }

  subscribeToEvents(){
    this.compassSubscription = this.deviceOrientation.watchHeading().subscribe(

      (data: DeviceOrientationCompassHeading) => {

        if(!this.trackingInProgress){
          return;
        }

        this.currentHeading = 359.0 - Math.round(data.magneticHeading);

        //calculate pin
        var threshHold = 50;
        var headingErr = this.getHeadingError(this.currentHeading, this.targetHeading);
        if(Math.abs(headingErr) <= threshHold){
          var locX = window.innerWidth/2 - 64;
          var locY = window.innerHeight/3 - 64;

          //subtract the difference from the mid placement to give hint to user where the object is
          locX = locX - (headingErr*2);


          this.plstyle = {
            top: locY + 'px',
            left: locX + 'px'
          };

          this.hideArrows();

        }else{
          this.hidePin();

          //and show cues to user which way to turn to find the pin
          if(headingErr<0){
            //turn left... show left arrow
            this.showLeftArrow = false;
            this.showRightArrow = true;
          }else if(headingErr>0){
            //show right arrow
            this.showRightArrow = false;
            this.showLeftArrow = true;
          }
        }
      }
    );

    this.cameraPreview.show();

    this.devices = {};

    this.ble.startScanWithOptions([],{'reportDuplicates':true}).subscribe(device => {
      //this.devices.push(device);

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

      //temporary to keep us from showing discovered devices
      this.devicesKeys = [];

    });

    this.insomnia.keepAwake()
    .then(
      () => console.log('success'),
      () => console.log('error')
    );

  }

  unSubscribeFromEvents(){

    this.ble.stopScan();

    // Stop watching heading change
    if(null != this.compassSubscription){
      this.compassSubscription.unsubscribe();
    }

    this.cameraPreview.hide();

    this.insomnia.allowSleepAgain()
    .then(
      () => console.log('success'),
      () => console.log('error')
    );

  }
}

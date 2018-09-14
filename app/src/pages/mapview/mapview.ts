import { Component, ViewChild, ElementRef  } from '@angular/core';
import { NavController, Scroll, Events } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';

import { MapProvider } from '../../providers/mapprovider';
import { BluetoothlocationProvider } from '../../providers/btlocationprovider';
import { WifilocationProvider } from '../../providers/wifilocationprovider';


@Component({
  selector: 'page-mapview',
  templateUrl: 'mapview.html'
})
export class MapviewPage {

  //subscriptions
  compassSubscription: any;
  onResumeSubscription: any;

  //wifi callbback
  wifiLocUpdatedHandle: any;

  currentHeading: number;
  lastHeading: number = 0;

  trackingInProgress: boolean = false;
  trackedPlate: string = '';
  pageTitle: string = 'Find My Car - Map View';

  //map related
  bgMapImg: HTMLImageElement;
  finishImgIcon: HTMLImageElement;
  startImgIcon: HTMLImageElement;
  curPositionIcon: HTMLImageElement;
  tileList: any = [];
  numRows: number;
  numCols: number;
  rowSize: number;
  colSize: number;
  curX: number = 0;
  curY: number = 0;

  @ViewChild('map') canvas: ElementRef;
  @ViewChild('mapscroll') mapScroll: any;
  canvasElement: any = null;

  constructor(
    platform: Platform,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation,
    private insomnia: Insomnia,
    private mapProvider: MapProvider,
    private btlocation: BluetoothlocationProvider,
    private wifiLoc: WifilocationProvider,
    public events: Events
  ) {

      this.onResumeSubscription = platform.resume.subscribe(() => {

        if(this.trackingInProgress){
        // do something meaningful when the app is put in the foreground
          this.subscribeToEvents();
        }
     });

     //happens only once
     this.mapProvider.loadMap().then((result) => {

      this.numRows = parseInt(this.mapProvider.getMapProperty('numRows'));
      this.numCols = parseInt(this.mapProvider.getMapProperty('numCols'));
      this.rowSize = parseInt(this.mapProvider.getMapProperty('pixelsPerRow'));
      this.colSize = parseInt(this.mapProvider.getMapProperty('pixelsPerCol'));

      console.log('numRows',this.numRows,' numCols',this.numCols,' rowSize',this.rowSize,' colSize',this.colSize);

      console.log('FMC Project successfuly loaded.');

    }).catch((err) => {
      console.log('Error loading map: ' + err);
    });



    this.bgMapImg = new Image();
    this.bgMapImg.src = 'assets/map/map.png';

    this.finishImgIcon = new Image();
    this.finishImgIcon.src = 'assets/icon/racing-flag.png';

    this.startImgIcon = new Image();
    this.startImgIcon.src = 'assets/icon/home.png';

    this.curPositionIcon = new Image();
    this.curPositionIcon.src = 'assets/icon/arrow-up.png';
  }

  newSearch(){

    //start scanning for bluetooth sensors
    //this.btlocation.start();
    this.wifiLoc.start();

    this.unSubscribeFromEvents();
    this.subscribeToEvents();
    this.trackingInProgress = true;

    this.pageTitle = 'FMC - Map View - ' + this.trackedPlate;

    //A REST call will be made to locate the car and possibly the caller (or any last known position)

    this.mapProvider.findPath(27,29,13,37).then(tileList => {

      console.log(JSON.stringify(tileList));
      this.tileList = tileList;


      this.updateMap();

      ////enable only in demo mode
      // setTimeout( () => {
      //   //needs to be done just once at start
      //   // in demo mode at beginning, curX and curY are set to the originating grid cell
      //   this.mapScroll._scrollContent.nativeElement.scrollTo({ left: this.curX, top: this.curY, behavior: 'smooth' });
      // }, 500);

    })
    .catch(err => {
      console.log('Error from mapping: ' + err);
    });

  }

  updateMap(){

    if(this.trackingInProgress){

      var time_start: number = (new Date().getTime()/1000);

      //draw the background... the satellite image or site map
      let ctx = this.canvasElement.getContext('2d');
      if(null == ctx){
        console.error('could not get canvas context.');
        return;
      }
      ctx.drawImage(this.bgMapImg,0,0,this.bgMapImg.width, this.bgMapImg.height);
      ctx.scale(1.0,1.0);

      //draw the path to take to reach the destination
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.strokeStyle = 'rgba(0,0,255,0.2)';
      ctx.fillStyle = 'rgba(250,250,210,0.6)';
      ctx.lineWidth = '8';

      ctx.moveTo(0,0);

      var moved: boolean = false;
      var xi: number;
      var yi: number;

      for(var i=1;i<this.tileList.length;i++)
      {

        var tRow = parseInt(this.tileList[i][0]);
        var tCol = parseInt(this.tileList[i][1]);

        xi = tCol * this.colSize;
        yi = tRow * this.rowSize;

        ctx.fillRect(xi,yi,this.colSize,this.rowSize);

        xi = (xi + (xi+this.colSize))/2;
        yi = (yi + (yi+this.rowSize))/2;

        if(!moved){
          ctx.moveTo(xi,yi);
          moved = true;

          //this is for demo only
          //this.curX = xi;
          //this.curY = yi;

          ctx.globalAlpha = 0.3;
          //start icon
          ctx.drawImage(this.startImgIcon,
            xi - (this.startImgIcon.width/2),
            yi - (this.startImgIcon.height/2),
            this.startImgIcon.width,
            this.startImgIcon.height);

          ctx.globalAlpha = 1.0;



        }else{
          ctx.lineTo(xi,yi);
          //console.log('lineTo ', xi, ',', yi);
        }
      }
      ctx.stroke();


      ctx.globalAlpha = 0.3;
      //finish flag
      ctx.drawImage(this.finishImgIcon,
        xi - (this.finishImgIcon.width/2),
        yi - (this.finishImgIcon.height/2),
        this.finishImgIcon.width,
        this.finishImgIcon.height);
      ctx.globalAlpha = 1.0;

      //demo only - draw the current heading
      ctx.save();
      ctx.translate(this.curX,this.curY);
      ctx.rotate(this.currentHeading * Math.PI/180);
      ctx.drawImage(this.curPositionIcon, -this.curPositionIcon.width/2,-this.curPositionIcon.height/2);
      ctx.restore();


      var time_end: number = (new Date().getTime()/1000);
      //console.log('map updated in: ', time_end-time_start);

    }
  }

  stopSearching(){

    //this.btlocation.stop();
    this.wifiLoc.stop();

    this.trackingInProgress = false;
    this.unSubscribeFromEvents();

    this.pageTitle = 'Find My Car - Map View';

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
  }

  ionViewCanLeave(){
  }

  ngAfterViewInit(){
    this.canvasElement = this.canvas.nativeElement;
  }

  subscribeToEvents(){
    this.insomnia.keepAwake()
    .then(
      () => console.log('insomnia awake success'),
      () => console.log('insomnia awake error')
    );

    this.compassSubscription = this.deviceOrientation.watchHeading().subscribe(

      (data: DeviceOrientationCompassHeading) => {

        if(!this.trackingInProgress){
          return;
        }

        this.currentHeading = 359.0 - Math.round(data.magneticHeading);

        if(Math.abs(this.currentHeading - this.lastHeading) > 0){
          //console.log(this.currentHeading);
          this.lastHeading = this.currentHeading;
          this.updateMap();
        }

      }
    );

    this.wifiLocUpdatedHandle = this.wifiSensorLocationUpdated.bind(this);
    this.events.subscribe('wifiloc:device', this.wifiLocUpdatedHandle);
  }

  wifiSensorLocationUpdated(row,col){

    if(!this.trackingInProgress){
      return;
    }

    console.log('position updated from wifi sensing', row, ':' ,col);

    this.curX = col * this.colSize;
    this.curY = row * this.rowSize;

    this.curX = (this.curX + (this.curX+this.colSize))/2;
    this.curY = (this.curY + (this.curY+this.rowSize))/2;

    this.mapScroll._scrollContent.nativeElement.scrollTo({ left: this.curX, top: this.curY, behavior: 'smooth' });

    this.updateMap();
  }

  unSubscribeFromEvents(){

    this.events.unsubscribe('wifiloc:device', this.wifiLocUpdatedHandle);

    this.insomnia.allowSleepAgain()
    .then(
      () => console.log('insomnia sleep success'),
      () => console.log('insomnia sleep error')
    );

    // Stop watching heading change
    if(null != this.compassSubscription){
      this.compassSubscription.unsubscribe();
    }

  }

}

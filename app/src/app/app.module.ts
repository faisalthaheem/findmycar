import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { MapviewPage } from '../pages/mapview/mapview';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DeviceOrientation } from '@ionic-native/device-orientation';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Insomnia } from '@ionic-native/insomnia';
import { BLE } from '@ionic-native/ble';
import { Hotspot } from '@ionic-native/hotspot';
import { File } from '@ionic-native/file';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MapProvider } from '../providers/mapprovider';
import { BluetoothlocationProvider } from '../providers/btlocationprovider';
import { WifilocationProvider } from '../providers/wifilocationprovider';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    MapviewPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    MapviewPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DeviceOrientation,
    CameraPreview,
    Insomnia,
    BLE,
    Hotspot,
    File,
    MapProvider,
    BluetoothlocationProvider,
    WifilocationProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

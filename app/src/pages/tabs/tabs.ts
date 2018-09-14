import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { MapviewPage } from '../mapview/mapview';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MapviewPage;
  tab3Root = AboutPage;

  constructor() {

  }
}

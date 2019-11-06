import { Component } from '@angular/core';
import { Events, NavController } from '@ionic/angular';

import { Native } from '../../services/native';
import { area } from '../../../assets/area/area.js';

@Component({
  selector: 'page-area',
  templateUrl: 'area.html',
  styleUrls: ['area.scss']
})
export class AreaPage {
  areaList: any;
  areaItem: any = null;

  constructor(public events: Events, public navCtrl: NavController, private native: Native) {
    this.areaList = area;
  }

  selectItem(item) {
    this.events.publish('selectarea', item);
    this.native.pop();
  }
}

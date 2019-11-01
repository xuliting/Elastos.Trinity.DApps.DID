import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { area } from '../../../assets/area/area.js';

@Component({
  selector: 'page-area',
  templateUrl: 'area.html',
  styleUrls: ['area.scss']
})
export class AreaPage {
  areaList: any;
  areaItem: any = null;

  constructor(public navCtrl: NavController) {
    this.areaList = area;
  }

  isSelect() {
    return this.areaItem != null;
  }
}

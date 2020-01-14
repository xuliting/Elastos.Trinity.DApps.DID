import { Component } from '@angular/core';
import { Events } from '@ionic/angular';

import { Native } from '../../services/native';
import { area } from '../../../assets/area/area';

@Component({
  selector: 'page-countrypicker',
  templateUrl: 'countrypicker.html',
  styleUrls: ['countrypicker.scss']
})
export class CountryPickerPage {
  areaList: any;
  areaItem: any = null;

  constructor(public events: Events, private native: Native) {
    this.areaList = area;
  }

  selectItem(item) {
    this.events.publish('selectarea', item);
    this.native.pop();
  }
}

import { Component } from '@angular/core';
import { Events, NavController } from '@ionic/angular';

import { area } from '../../../assets/area/area';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-countrypicker',
  templateUrl: 'countrypicker.html',
  styleUrls: ['countrypicker.scss']
})
export class CountryPickerPage {
  areaList: any;
  areaItem: any = null;

  constructor(
            public events: Events,
            private navCtrl: NavController,
            private translate: TranslateService
  ) {
    this.areaList = area;
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('country'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);
  }

  selectItem(item) {
    this.events.publish('selectarea', item);
    this.navCtrl.back();
  }
}

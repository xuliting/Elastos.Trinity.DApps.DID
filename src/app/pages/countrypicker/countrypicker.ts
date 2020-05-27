import { Component } from '@angular/core';
import { Events, NavController } from '@ionic/angular';

import { area } from '../../../assets/area/area';
import { TranslateService } from '@ngx-translate/core';
import { UXService } from 'src/app/services/ux.service';

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
            private translate: TranslateService,
            private uxService: UXService
  ) {
    this.areaList = area;
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('country'));
    this.uxService.setTitleBarBackKeyShown(true);
  }

  ionViewWillLeave() {
    this.uxService.setTitleBarBackKeyShown(false);
  }

  selectItem(item) {
    this.events.publish('selectarea', item);
    this.navCtrl.back();
  }
}

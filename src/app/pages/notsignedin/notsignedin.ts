import { Component } from '@angular/core';

import { Native } from '../../services/native';
import { TranslateService } from '@ngx-translate/core';
import { UXService } from 'src/app/services/ux.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-notsignedin',
  templateUrl: 'notsignedin.html',
  styleUrls: ['notsignedin.scss']
})
export class NotSignedInPage {
  constructor(private native: Native, private translate: TranslateService, private uxService: UXService) {
  }

  ionViewWillEnter() {
    this.uxService.makeAppVisible();
    titleBarManager.setTitle("Error");
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
  }
}

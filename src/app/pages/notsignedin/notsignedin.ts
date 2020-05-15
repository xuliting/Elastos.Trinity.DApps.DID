import { Component } from '@angular/core';

import { Native } from '../../services/native';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-notsignedin',
  templateUrl: 'notsignedin.html',
  styleUrls: ['notsignedin.scss']
})
export class NotSignedInPage {
  constructor(private native: Native, private translate: TranslateService) {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(null);
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { UXService } from 'src/app/services/ux.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'page-backupdid',
    templateUrl: 'backupdid.html',
    styleUrls: ['backupdid.scss']
})
export class BackupDIDPage {
    public mnemonicList: string[] = [];
    public isCreation = false;

    constructor(
      private native: Native,
      private didService: DIDService,
      public router: Router,
      private translate: TranslateService,
      private uxService: UXService,
      public theme: ThemeService
    ) {
        console.log("Entering BackupDID page");
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state) && (navigation.extras.state['create'] == false)) {
            console.log("Saving an existing DID");

            this.isCreation = false;

            // TODO
        }
        else {
            console.log("Saving mnemonics for the first time");

            // Creation
            this.isCreation = true;
            this.generateMnemonic();
        }
    }

    ionViewWillEnter() {
      this.theme.getTheme();
      titleBarManager.setTitle('Mnemonic');
      this.uxService.setTitleBarBackKeyShown(true);
    }

    generateMnemonic() {
        this.didService.generateMnemonic(this.native.getMnemonicLang()).then((ret) => {
            this.didService.didBeingCreated.mnemonic = ret;
            this.mnemonicList = this.didService.didBeingCreated.mnemonic.split(/[\u3000\s]+/).map((word) => {
                return word;
            });
        });
    }

    nextClicked() {
        if (this.isCreation) {
            // Next button pressed: go to mnemonic verification screen.
            this.native.go("/verifymnemonics", { mnemonicStr: this.didService.didBeingCreated.mnemonic });
        }
        else {
            // TODO
        }
    }
}

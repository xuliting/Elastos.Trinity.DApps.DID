import { Component } from '@angular/core';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';

@Component({
  selector: 'page-backupdid',
  templateUrl: 'backupdid.html',
  styleUrls: ['backupdid.scss']
})
export class BackupDIDPage {
  public mnemonicList = [];
  public mnemonicStr: string = "";

  constructor(private native: Native, private didService: DIDService) {
    this.onExportMnemonic();
  }

  onExportMnemonic() {
    //TODO
    this.didService.generateMnemonic(this.native.getMnemonicLang()).then((ret) => {
        this.mnemonicStr = ret;
        let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
        for (var i = 0; i < mnemonicArr.length; i++) {
            this.mnemonicList.push({ "text": mnemonicArr[i], "selected": false });
        }
    });
  }

  nextClicked() {
    // Next button pressed: go to mnemonic verification screen.
    this.native.go("/verifymnemonics", { mnemonicStr: this.mnemonicStr, mnemonicList: JSON.stringify(this.mnemonicList) });
  }
}

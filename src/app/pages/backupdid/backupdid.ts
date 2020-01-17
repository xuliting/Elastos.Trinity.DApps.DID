import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
    selector: 'page-backupdid',
    templateUrl: 'backupdid.html',
    styleUrls: ['backupdid.scss']
})
export class BackupDIDPage {
    public mnemonicList: string[] = [];
    public isCreation = false;

    constructor(private native: Native, private didService: DIDService, public router: Router) {
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

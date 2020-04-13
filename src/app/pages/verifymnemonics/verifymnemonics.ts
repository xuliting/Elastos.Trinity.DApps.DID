import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { UXService } from 'src/app/services/ux.service';
import { Config } from '../../services/config';
import { DIDURL } from 'src/app/model/didurl.model';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

type MnemonicWord = {
    text: string;
    selected: boolean;
}

@Component({
    selector: 'page-verifymnemonics',
    templateUrl: 'verifymnemonics.html',
    styleUrls: ['verifymnemonics.scss']
})
export class VerifyMnemonicsPage {
    mnemonicList: Array<MnemonicWord> = [];
    selectedList: Array<string> = [];
    mnemonicStr: string;

    constructor(public router: Router,
                public zone: NgZone,
                private didService: DIDService,
                private authService: AuthService,
                private native: Native,
                private translate: TranslateService,
                private uxService: UXService
                ) {
        this.init();
    }

    ionViewWillEnter() {
      titleBarManager.setTitle(this.translate.instant('verification'));
      titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);
    }

    init() {
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.mnemonicStr = this.native.clone(navigation.extras.state["mnemonicStr"]);
            this.mnemonicList = this.mnemonicStr.split(" ").map((word)=>{
                return {text: word, selected: false}
            });
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        }
    }

    public addButton(index: number, item: MnemonicWord): void {
        this.selectedList.push(item.text);
        this.mnemonicList[index].selected = true;
    }

    /*public removeButton(index: number, item: any): void {
        this.zone.run(() => {
            this.selectedList.splice(index, 1);
            this.mnemonicList[item.prevIndex].selected = false;
        });
    }*/

    nextClicked() {
        this.createDid();
    }

    async createDid() {
        // Create a new identity, without any mnemonic passphrase, only a did store password.
        await this.didService.getActiveDidStore().createPrivateIdentity(null, this.didService.didBeingCreated.password, this.native.getMnemonicLang(), this.mnemonicStr);
        this.native.showLoading('loading-msg').then(() => {
            this.didService.finalizeDidCreation(this.didService.didBeingCreated.password).then(()=> {
                this.native.hideLoading();
                // Save password for later use
                this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.didService.didBeingCreated.password);

                let suggestedIdentityProfileName = null;
                let nameCredential = this.didService.getActiveDidStore().getActiveDid().getCredentialById(new DIDURL("#name"));
                if (nameCredential) {
                    suggestedIdentityProfileName = nameCredential.pluginVerifiableCredential.getSubject()["name"];
                }

                console.log("Identity creation completed. Sending indent response");
                this.uxService.sendIntentResponse("createdid", {
                    didStoreId: this.didService.getActiveDidStore().getId(),
                    didString: this.didService.getActiveDidStore().getActiveDid().getDIDString(),
                    name: suggestedIdentityProfileName
                }, Config.requestDapp.intentId);

                // Close the app, operation completed.
                this.uxService.close();
            })
        });
    }

    allWordsMatch() {
        //return true; // for test

        let selectComplete = this.selectedList.length === this.mnemonicList.length ? true : false;
        if (selectComplete) {
            let mn = "";
            for (let i = 0; i < this.selectedList.length; i++) {
                mn += this.selectedList[i];
            }
            if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
                return true;
            }
        }
        return false;
    }
}

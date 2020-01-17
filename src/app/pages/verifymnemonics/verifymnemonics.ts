import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';

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

    constructor(public route: Router,
                public zone: NgZone,
                private didService: DIDService,
                private authService: AuthService,
                private native: Native) {
        this.init();
    }

    init() {
        this.mnemonicStr = this.native.clone(this.route.getCurrentNavigation().extras.state["mnemonicStr"]);
        this.mnemonicList = this.mnemonicStr.split(" ").map((word)=>{
            return {text: word, selected: false}
        });
        this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
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
            this.didService.finalizeDidCreation().then(()=> {
                this.native.hideLoading();
                // Save password for later use
                this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.didService.didBeingCreated.password);

                console.log("Redirecting user to his profile page");
                this.native.setRootRouter("/home/myprofile");
            })
        });
    }

    allWordsMatch() {
        // return true;// for test
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

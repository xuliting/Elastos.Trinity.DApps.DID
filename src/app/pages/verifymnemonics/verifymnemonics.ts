import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Config } from '../../services/config';
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

    constructor(public route: ActivatedRoute,
                public zone: NgZone,
                private didService: DIDService,
                private authService: AuthService,
                private native: Native) {
        this.init();
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
            this.mnemonicList = this.mnemonicStr.split(" ").map((word)=>{
                return {text: word, selected: false}
            });
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        });
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
        await this.didService.getActiveDidStore().createPrivateIdentity(this.didService.didBeingCreated.password, this.native.getMnemonicLang(), this.mnemonicStr);
        await this.didService.finalizeDidCreation();

        // Save password for later use
        this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.didService.didBeingCreated.password);

        console.log("Redirecting user to his profile page");
        this.native.setRootRouter("/home/myprofile");
    }

    allWordsMatch() {
        return true;// for test
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

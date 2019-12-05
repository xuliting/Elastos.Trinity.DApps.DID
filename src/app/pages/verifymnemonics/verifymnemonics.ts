import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Config } from '../../services/config';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
    selector: 'page-verifymnemonics',
    templateUrl: 'verifymnemonics.html',
    styleUrls: ['verifymnemonics.scss']
})
export class VerifyMnemonicsPage {
    mnemonicList: Array<any> = [];
    selectList: Array<any> = [];
    mnemonicStr: string;

    constructor(public route: ActivatedRoute,
                public zone: NgZone,
                private native: Native) {
        this.init();
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
            this.mnemonicList = JSON.parse(data["mnemonicList"]);
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        });
    }

    public addButton(index: number, item: any): void {
        var newWord = {
            text: item.text,
            prevIndex: index
        };
        this.zone.run(() => {
            this.selectList.push(newWord);
            this.mnemonicList[index].selected = true;
        });
    }

    public removeButton(index: number, item: any): void {
        this.zone.run(() => {
            this.selectList.splice(index, 1);
            this.mnemonicList[item.prevIndex].selected = false;
        });
    }

    nextClicked() {
        this.createDid();
    }

    async createDid() {
        console.log("Creating a new DID");
        await Config.didStoreManager.getActiveDidStore().addNewDidWithProfile(Config.didBeingCreated, this.native.getMnemonicLang(), this.mnemonicStr);
        await Config.didStoreManager.finalizeDidCreation();
        
        console.log("Redirecting user to his profile page");
        this.native.setRootRouter("/profile/myprofile");
    }

    allWordsMatch() {
        return true;// for test
        let selectComplete = this.selectList.length === this.mnemonicList.length ? true : false;
        if (selectComplete) {
            let mn = "";
            for (let i = 0; i < this.selectList.length; i++) {
                mn += this.selectList[i].text;
            }
            if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
                return true;
            }
        }
        return false;
    }
}

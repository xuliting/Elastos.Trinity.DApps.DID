import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { LocalStorage } from '../../services/localstorage';
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
    password:string = "";

    constructor(public route: ActivatedRoute, public zone: NgZone,
            private didService: DIDService, private localStorage: LocalStorage, private native: Native) {
        this.init();
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
            this.mnemonicList = JSON.parse(data["mnemonicList"]);
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        });
        this.localStorage.getPassword().then( (ret)=> {
            this.password = ret;
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
        //create did & credential
        this.createDidAndCredential();

    }

    async createDidAndCredential() {
        console.log("createDidAndCredential");
        let didString = "";
        this.didService.initPrivateIdentity(this.mnemonicStr, this.password, true);
        await this.didService.createDid(this.password, "").then ( (ret)=> {
            didString = ret.DidString;
        });
        let types = new Array();
        // types[0] = "BasicProfileCredential";
        types[0] = "SelfProclaimedCredential";

        let props = {
            fullname: Config.profile.fullname,
            email: Config.profile.email,
            phonenumber: Config.profile.phonenumber,
            gender: Config.profile.gender,
            area: Config.profile.area
        }

        let credential = null;
        await this.didService.createCredential(didString, "cred-1", types, 15, props, this.password).then ( (ret)=> {
            credential = ret;
        });
        await this.didService.storeCredential(credential.objId);
        await this.didService.addCredential(credential.objId);

        this.native.go("/myprofile");
    }

    allWordsMatch() {
        // return true;//TODO
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

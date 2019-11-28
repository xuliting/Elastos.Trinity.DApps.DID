
import { Injectable } from '@angular/core';

@Injectable()
export class Config {
    public static requestDapp: any;
    public static modifyId = "";
    public static initialized: boolean = false;

    public static curDidStoreId: string = "-1";
    public static credentialInfos: any = {};

    public static curDidStore: any = {
        id: "",
        name: "",
        password: "",
        mnemonic: "",
        didList: [],
    };
    public static didStoreManager: any = {};

    public static uuid(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data. At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }

    public static objtoarr(obj) {
        let arr = [];
        for (let key in obj) {
            arr.push(obj[key]);
        }
        return arr;
    }

    public static getCurDidStoreId() {
        return this.didStoreManager.getcurDidStoreId;
    }

    public static setCurDidStoreId(id) {
        this.didStoreManager.setcurDidStoreId(id);
    }

    public static getCurDidId() {
        return this.didStoreManager.getcurDidId();
    }

    public static setCurDidId(id) {
        this.didStoreManager.setcurDidId(id);
    }

    public static getCurDid(id) {
        return Config.didStoreManager.masterWallet[id].chainList || null;
    }

    public static getDidList() {
        var didList = [];
        let didStoreId = Config.getCurDidStoreId();
        let did = Config.getCurDid(didStoreId);
        if (did != null) {
            for (let index in did) {
                let coin = did[index];
                if (coin != 'ELA') {
                    didList.push({ name: coin });
                }
            }
        }

        return didList;
    }
}

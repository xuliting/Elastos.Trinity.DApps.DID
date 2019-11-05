import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class LocalStorage {

    constructor(private storage: Storage) {
        console.log("LocalStorage init")
    }

    public add(key: string, value: any): any {
        console.log("LocalStorage::add");
        return this.get(key).then((val) => {
            let id = value['id'];
            if (val === null) {
                let initObj = {};
                initObj[id] = value;
                return this.storage.set(key, JSON.stringify(initObj));
            }
            let addObj = JSON.parse(val);
            addObj[id] = value;
            return this.storage.set(key, JSON.stringify(addObj));
        });
    }

    public set(key: string, value: any): any {
        return this.storage.set(key, JSON.stringify(value));
    }

    public get(key: string): Promise<any> {
        return this.storage.get(key);
    }

    public getVal(key, func) {
        this.storage.get(key).then((val) => {
            if (typeof(val) == "string") {
                val = JSON.parse(val);
            }
            func(val);
        });
    }

    public remove(key: string): any {
        return this.storage.remove(key);
    }

    public clear(): any {
        return this.storage.clear();
    }

    public setPassword(value: any): any {
        let key = "Did-password";
        return this.storage.set(key, value);
    }

    public getPassword(): Promise<any> {
        let key = "Did-password";
        return this.get(key);
    }

    public setMnemonic(value: any): any {
        let key = "Did-mnemonic";
        return this.storage.set(key, value);
    }

    public getMnemonic(func): any {
        let key = "Did-mnemonic";
        this.getVal(key, func);
    }

    public setCurrentDid(value: any): any {
        // TODO
        let key = "Did-string";
        return this.storage.set(key, value);
    }

    public getCurrentDid(func): any {
        // TODO
        let key = "Did-string";
        this.getVal(key, func);
    }

    public getWalletLanguage(func): any {
        let key = "Did-language";
        this.getVal(key, func);
    }
}



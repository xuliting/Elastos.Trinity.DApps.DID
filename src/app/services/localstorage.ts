import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { DIDStoreEntry } from '../model/didstoreentry.model';
import { BrowserSimulation, BrowserSimulationConfig } from './browsersimulation';

@Injectable()
export class LocalStorage {

    constructor(private storage: Storage) {
        console.log("LocalStorage init")
    }

    public add(key: string, value: any): any {
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

    public getAsJson<T>(key) : Promise<T> {
        return new Promise(async (resolve, reject)=>{
            try {
                let val = await this.storage.get(key)
                resolve(JSON.parse(val));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    // @deprecated
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

    public getWalletLanguage(func): any {
        let key = "Did-language";
        this.getVal(key, func);
    }

    public setPassword(value: any): any {
        let key = "Did-password";
        return this.storage.set(key, JSON.stringify(value));
    }

    public getPassword(): Promise<any> {
        let key = "Did-password";
        return this.get(key);
    }

    public setMnemonic(value: any): any {
        let key = "Did-mnemonic";
        return this.storage.set(key, JSON.stringify(value));
    }

    public getMnemonic(func): any {
        let key = "Did-mnemonic";
        this.getVal(key, func);
    }

    public setCurrentDid(value: any): any {
        // TODO
        let key = "Did-string";
        return this.storage.set(key, JSON.stringify(value));
    }

    public getCurrentDid(func): any {
        // TODO
        let key = "Did-string";
        this.getVal(key, func);
    }

    public saveDidStoreEntries(entries: DIDStoreEntry[]) {
        console.log("Setting DID store entries", entries);
        let key = "didstores";
        this.storage.set(key, JSON.stringify(entries));
    }

    public getDidStoreEntries(): Promise<DIDStoreEntry[]> {
        let key = "didstores";
        return this.getAsJson(key);
    }

    public saveCurrentDidStoreId(value: string): any {
        // TODO
        let key = "cur-didstoreId";
        return this.storage.set(key, JSON.stringify(value));
    }

    public getCurrentDidStoreId(): Promise<string> {
        /*if (BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve)=>{
                if (BrowserSimulationConfig.hasDIDStores())
                    resolve("store-abcedf");
                else
                    resolve(null);
            });
        }
        else {*/
            let key = "cur-didstoreId";
            return this.getAsJson(key);
        //}
    }
}



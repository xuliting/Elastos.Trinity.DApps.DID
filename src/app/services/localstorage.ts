import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { DIDEntry } from '../model/didentry.model';
import { BrowserSimulation, BrowserSimulationConfig } from './browsersimulation';

@Injectable()
export class LocalStorage {

    constructor(private storage: Storage) {
        console.log("LocalStorage init")
    }

    private add(key: string, value: any): any {
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

    private set(key: string, value: any): any {
        return this.storage.set(key, JSON.stringify(value));
    }

    private get(key: string): Promise<any> {
        return this.storage.get(key);
    }

    private getAsJson<T>(key) : Promise<T> {
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

    private remove(key: string): any {
        return this.storage.remove(key);
    }

    private clear(): any {
        return this.storage.clear();
    }

    public saveDidEntries(entries: DIDEntry[]) {
        console.log("Setting DID entries", entries);
        let key = "didentries";
        this.storage.set(key, JSON.stringify(entries));
    }

    public getDidEntries(): Promise<DIDEntry[]> {
        let key = "didentries";
        return this.getAsJson(key);
    }

    public saveCurrentDidStoreId(value: string): any {
        let key = "cur-didstoreId";
        return this.storage.set(key, value);
    }

    public getCurrentDidStoreId(): Promise<string> {
        let key = "cur-didstoreId";
        return this.get(key);
    }

    public setCurrentDid(value: string): any {
        let key = "cur-didstring";
        return this.storage.set(key, value);
    }

    public getCurrentDid(): Promise<string> {
        let key = "cur-didstring";
        return this.get(key);
    }

}



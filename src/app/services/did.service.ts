import { Injectable, NgZone } from '@angular/core';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { Native } from "./native";

declare let appService: any;
declare let DIDPlugin: any;
let selfDIDService: DIDService = null;

@Injectable({
    providedIn: 'root'
})
export class DIDService {
    selfDidStore: any;
    selfDidDucument: any;
    curDIDString: string = "";

    constructor(
        private platform: Platform,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private native: Native,
        private navController: NavController) {
            selfDIDService = this;
    }

    init() {
        console.log("DID Service is initializing...");

        // Load app manager only on real device, not in desktop browser - beware: ionic 4 bug with "desktop" or "android"/"ios"
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            this.initDidStore().then((ret) => {
                console.log("initDidStore().then " + ret.objId);
                this.selfDidStore = ret;
                this.hasPrivateIdentity().then((ret) => {
                    console.log("hasPrivateIdentity:" + ret);
                    if (ret == "true") {
                        this.showDID();
                    }
                    else {
                        this.handleEmptyDID();
                    }
                })
            })
        }
        else {
            this.handleEmptyDID();
        }
    }

    showDID() {
        this.native.setRootRouter('/didsettings');
    }

    handleEmptyDID() {
        this.native.setRootRouter('/noidentity');
        // this.native.setRootRouter('/backupdid');
    }

    getCurrentDIDString() {
        return this.curDIDString;
    }

    /**
     * Creates a new local user identity.
     */
    createIdentity() {
        return new Promise((resolve, reject)=>{
           resolve()
        });
    }

    //
    initDidStore(): Promise<any> {
        return new Promise((resolve, reject)=>{
            DIDPlugin.initDidStore(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    generateMnemonic(language): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (this.platform.platforms().indexOf("cordova") >= 0) {
                DIDPlugin.generateMnemonic(
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                    language
                );
            }
            else {//for test
                resolve("abandon ability able about above absent absorb abstract bike bind bird blue");
            }
        });
    }

    isMnemonicValid(language, mnemonic): Promise<any> {
        return new Promise((resolve, reject)=>{
            DIDPlugin.isMnemonicValid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                language, mnemonic
            );
        });
    }

    //DIDStore
    initPrivateIdentity(mnemonic, password, force): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.initPrivateIdentity(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                mnemonic, password, password, force
            );
        });
    }

    hasPrivateIdentity(): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.hasPrivateIdentity(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    deleteDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString
            );
        });
    }

    createDid(passparase, hint = ""): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.newDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                passparase, hint
            );
        });
    }

    listDids(filter): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.listDids(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                filter
            );
        });
    }

    loadDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString
            );
        });
    }

    publishDid(didDocumentId, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.publishDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didDocumentId, didUrlString, storepass
            );
        });
    }

    resolveDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.resolveDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString
            );
        });
    }

    storeDid(didDocumentId, hint): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didDocumentId, hint
            );
        });
    }

    updateDid(didDocumentId, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.updateDid(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didDocumentId, didUrlString, storepass
            );
        });
    }

    createCredential(didString, credentialId, type, expirationDate, properties, passphrase): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.createCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, credentialId, type, expirationDate, properties, passphrase
            );
        });
    }

    deleteCredential(didString, didUrlString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, didUrlString
            );
        });
    }

    listCredentials(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.listCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString
            );
        });
    }

    loadCredentials(didString, credId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, credId
            );
        });
    }

    storeCredentials(credentialId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                credentialId
            );
        });
    }

    //DIDDocument

    //Credential

    // Fun(ret, okFun = null) {
    //     if (okFun != null) {
    //         return okFun(ret);
    //     }
    // }

    // errorFun(err, errorFun = null) {
    //     this.native.info("errorFun:" + err);
    //     if (errorFun != null) {
    //         return errorFun(err);
    //     }
    // }
}

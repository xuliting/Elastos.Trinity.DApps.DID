import { Injectable, NgZone } from '@angular/core';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { LocalStorage } from "./localstorage";
import { Native } from "./native";

declare let appService: any;
declare let DIDPlugin: any;
let selfDIDService: DIDService = null;

@Injectable({
    providedIn: 'root'
})
export class DIDService {
    selfDidStore: any;
    selfDidDocument: any;
    curDidString: string = "";

    constructor(
        private platform: Platform,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private localStorage: LocalStorage,
        private native: Native,
        private navController: NavController) {
            selfDIDService = this;
    }

    init() {
        console.log("DID Service is initializing...");

        // Load app manager only on real device, not in desktop browser - beware: ionic 4 bug with "desktop" or "android"/"ios"
        // if (this.platform.platforms().indexOf("cordova") >= 0) {
        //     this.localStorage.getPassword().then( (ret)=> {
        //         if (null == ret) {
        //             this.handleEmptyDID();
        //         }
        //         else {
        //             this.initDidStore(ret).then ( (ret)=> {
        //                 this.hasPrivateIdentity().then((ret) => {
        //                     console.log("hasPrivateIdentity:" + ret);
        //                     if (ret == "true") {
        //                         this.showDID();
        //                     }
        //                     else {
        //                         //go editprofile?
        //                         this.handleEmptyDID();
        //                     }
        //                 })
        //             })
        //             .catch( (error)=> {
        //                 console.log("initDidStore error:" + error.message);
        //             })
        //         }
        //     })
        // }
        // else {
            this.handleEmptyDID();
        // }
    }

    showDID() {
        this.native.setRootRouter('/didsettings');
    }

    handleEmptyDID() {
        this.native.setRootRouter('/noidentity');
        // this.native.setRootRouter('/backupdid');
    }

    getCurrentDidString() {
        console.log("didservice  this.curDidString:" + this.curDidString);
        return this.curDidString;
    }

    // updateDidString() {
    //     this.getDidDocumentSubject().then( (ret)=> {
    //         ret.toString(
    //             (ret)=>{this.curDidString = ret;},
    //             (error) => {console.log("Did toString error:" + error.message)}
    //         )
    //     });
    // }

    /**
     * Creates a new local user identity.
     */
    createIdentity() {
        return new Promise((resolve, reject)=>{
           resolve()
        });
    }

    //
    initDidStore(password): Promise<any> {
        return new Promise((resolve, reject)=>{
            DIDPlugin.initDidStore(
                (ret) => {this.selfDidStore = ret;resolve(ret);},
                (err) => {reject(err)},
                password
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
                (ret) => {
                    this.selfDidDocument = ret;
                    this.curDidString = ret.DidString;
                    console.log("createDid this.curDidString:" + this.curDidString);
                    resolve(ret)
                },
                (err) => {reject(err)},
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

    loadCredential(didString, credId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, credId
            );
        });
    }

    storeCredential(credentialId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                credentialId
            );
        });
    }

    //DIDDocument
    getDidDocumentSubject() : Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidDocument.getSubject(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });

    }

    //Did
    addCredential(credentialObjId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidDocument.addCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                credentialObjId
            );
        });

    }

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

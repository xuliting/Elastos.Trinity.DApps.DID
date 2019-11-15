import { Injectable, NgZone } from '@angular/core';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { LocalStorage } from "./localstorage";
import { Native } from "./native";

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
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            this.localStorage.getPassword().then( (ret)=> {
                if (null == ret) {
                    this.handleEmptyDID();
                }
                else {
                    this.initDidStore(ret)
                    .then (()=>{return this.hasPrivateIdentity()})
                    .then((ret) => {
                        console.log("hasPrivateIdentity:" + ret);
                        if (ret == "true") {
                            this.showDID();
                        }
                        else {
                            this.handleEmptyDID();
                        }
                    })
                    .catch( (error)=> {
                        console.log("initDidStore error:" + error.message);
                    })
                }
            })
        }
        else {
            this.handleEmptyDID();
        }
    }

    showDID() {
        this.listDids(DIDPlugin.DIDStoreFilter.DID_ALL).then( (ret)=> {
            console.log("listDids count: " + ret.items.length + "<br>" + JSON.stringify(ret.items));

            this.curDidString = ret.items[0]['did'];
            this.loadDid(this.curDidString).then( (ret)=> {
                this.selfDidDocument = ret;
            })

            // this.native.setRootRouter('/didsettings');
            this.native.setRootRouter('/myprofile', {id:"only-profile"});
        });
    }

    handleEmptyDID() {
        // this.native.setRootRouter('/noidentity');
        // this.native.setRootRouter('/credentiallist');
        // this.native.setRootRouter('/editprofile');
        this.native.setRootRouter('/myprofile', {id:"only-profile"});
    }

    getCurrentDidString() {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return "did:ela:azeeza786zea67zaek221fxi9";
        }
        console.log("didservice  this.curDidString:" + this.curDidString);
        return this.curDidString;
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
    initDidStore(password): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

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
        console.log("deleteCredential:" + didUrlString);
        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, didUrlString
            );
        });
    }

    listCredentials(didString): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
                let did = [{'didurl':'did:ela:azeeza786zea67zaek221fxi9'}]
                let ret = {
                    items:did,
                }
               resolve(ret)
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.listCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString
            );
        });
    }

    loadCredential(didString, didUrlString): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
                let ret = {"objId":191979659,"clazz":5,
                        "info":{"id":191979659,"fragment":"trinity","type":"[SelfProclaimedCredential]",
                            "issuance":"Thu Nov 07 12:00:00 GMT+08:00 2019",
                            "expiration":"Tue Nov 07 12:00:00 GMT+08:00 2034",
                            "props":{"email":"","fullname":"trinity","phonenumber":"","remark":"remarkddd","url":"url"}
                            }}
               resolve(ret)
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadCredential(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
                didString, didUrlString
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
    backupCredential(credential): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
                let ret = "{\"id\":\"did:elastos:ikoWcH4HJYGsHFzYH3VEVL7iMeL6NGm8VF#test\",\"type\":[\"SelfProclaimedCredential\"],\"issuanceDate\":\"2019-11-11T08:00:00Z\",\"expirationDate\":\"2034-11-11T08:00:00Z\",\"credentialSubject\":{\"id\":\"did:elastos:ikoWcH4HJYGsHFzYH3VEVL7iMeL6NGm8VF\",\"remark\":\"ttttttttt\",\"title\":\"test\",\"url\":\"tst\"},\"proof\":{\"verificationMethod\":\"#primary\",\"signature\":\"foJZLqID4C27eDheK/VDYjaGlxgTzy88s+o95GL4KwFbxLYechjOQ/JjMv7UFTYByOg84dECezeqjR7pjHeu1g==\"}}"
                resolve(ret)
            });
        }

        return new Promise((resolve, reject)=>{
            credential.toString(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

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

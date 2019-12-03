import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';

declare let didManager: DIDPlugin.DIDManager;
//declare let didManager: any;
@Injectable({
    providedIn: 'root'
})
export class DIDService {
    selfDidStore: DIDPlugin.DIDStore;
    selfDidDocument: DIDPlugin.DIDDocument;
    curDidString: string = "";

    constructor(
        private platform: Platform,
        public zone: NgZone,
        public toastCtrl: ToastController) {
            console.log("DIDService created");
    }

    getCurrentDidString() {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return "did:elastos:azeeza786zea67zaek221fxi9";
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
    initDidStore(location): Promise<DIDPlugin.DIDStore> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }
        return new Promise((resolve, reject)=>{
            didManager.initDidStore(
                location,
                (ret) => {this.selfDidStore = ret;resolve(ret);},
                (err) => {reject(err)},
            );
        });
    }

    generateMnemonic(language): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (this.platform.platforms().indexOf("cordova") >= 0) {
                didManager.generateMnemonic(
                    language,
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                );
            }
            else {//for test
                resolve("abandon ability able about above absent absorb abstract bike bind bird blue");
            }
        });
    }

    isMnemonicValid(language, mnemonic): Promise<any> {
        return new Promise((resolve, reject)=>{
            didManager.isMnemonicValid(
                language, mnemonic,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    //DIDStore
    initPrivateIdentity(language, mnemonic, password, force): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve("true")
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.initPrivateIdentity(
                language, mnemonic, password, password, force,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    hasPrivateIdentity(): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve("true")
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.hasPrivateIdentity(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    deleteDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteDid(
                didString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    createDid(passparase, hint = ""): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               let ret = {
                   did: "did:elastos:azeeza786zea67zaek221fxi9",
               }
               resolve(ret);
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.newDid(
                passparase, hint,
                (ret) => {
                    this.selfDidDocument = ret;
                    this.curDidString = ret.did;
                    console.log("createDid this.curDidString:" + this.curDidString);
                    resolve(ret)
                },
                (err) => {reject(err)},
            );
        });
    }

    listDids(): Promise<any> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               let ret = {
                   items: [
                   { did: "did:elastos:azeeza786zea67zaek221fxi9"},
                   ],
               }
               resolve(ret);
            });
        }
        console.log("listDids");
        return new Promise((resolve, reject)=>{
            this.selfDidStore.listDids(
                DIDPlugin.DIDStoreFilter.DID_ALL,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    loadDid(didString): Promise<any> {
        console.log("loadDid:" + didString);
        this.curDidString = didString;

        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               let ret = { did: "did:elastos:azeeza786zea67zaek221fxi9"};
               resolve(ret);
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadDid(
                didString,
                (ret) => {
                    this.selfDidDocument = ret;
                    resolve(ret)
                },
                (err) => {reject(err)},
            );
        });
    }

    publishDid(didDocumentId, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.publishDid(
                didDocumentId, didUrlString, storepass,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    resolveDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.resolveDid(
                didString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    storeDid(didDocumentId, hint): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeDid(
                didDocumentId, hint,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    updateDid(didDocumentId, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.updateDid(
                didDocumentId, didUrlString, storepass,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    createCredential(didString, credentialId, type, expirationDate, properties, passphrase): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.createCredential(
                didString, credentialId, type, expirationDate, properties, passphrase,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    deleteCredential(didString, didUrlString): Promise<any> {
        console.log("deleteCredential:" + didUrlString);
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteCredential(
                didString, didUrlString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
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
                didString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
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
                didString, didUrlString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    storeCredential(credentialId): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeCredential(
                credentialId,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
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
                credentialObjId,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    //Credential
    credentialToJSON(credential: DIDPlugin.VerifiableCredential): Promise<string> {
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

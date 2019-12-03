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
    initPrivateIdentity(language, mnemonic, password, force): Promise<void> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.initPrivateIdentity(
                language, mnemonic, password, password, force,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    hasPrivateIdentity(): Promise<boolean> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve(false)
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.hasPrivateIdentity(
                (hasPrivId) => {resolve(hasPrivId)}, (err) => {reject(err)},
            );
        });
    }

    deleteDid(didString): Promise<void> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.deleteDid(
                didString,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    createDid(passparase, hint = ""): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.newDid(
                passparase, hint,
                (didString, didDocument) => {
                    this.selfDidDocument = didDocument;
                    this.curDidString = didString;
                    console.log("createDid this.curDidString:" + this.curDidString);
                    resolve({didString:didString, didDocument:didDocument})
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
            this.selfDidStore.loadDidDocument(
                didString,
                (ret) => {
                    this.selfDidDocument = ret;
                    resolve(ret)
                },
                (err) => {reject(err)},
            );
        });
    }

    publishDid(didDocument: DIDPlugin.DIDDocument, storepass: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            didDocument.publish(
                storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    /**
     * didString to DID object.
     */
    _resolveDid(didString: DIDPlugin.DIDString): Promise<DIDPlugin.DID> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.loadDidDocument(didString, (didDocument: DIDPlugin.DIDDocument)=>{
                didDocument.getSubject((did: DIDPlugin.DID)=>{
                    resolve(did);
                });
            });
        });
    }

    resolveDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.resolveDidDocument(
                didString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    storeDid(didDocumentId, hint): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.storeDidDocument(
                didDocumentId, hint,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    updateDid(didDocument: DIDPlugin.DIDDocument, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidStore.updateDidDocument(
                didDocument, storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    createCredential(didString, credentialId, type, expirationDate, properties, passphrase): Promise<any> {
        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            did.issueCredential(
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

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            did.deleteCredential(
                didUrlString,
                () => {resolve()}, (err) => {reject(err)},
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

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            did.listCredentials(
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

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            did.loadCredential(
                didUrlString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    storeCredential(didString, credential: DIDPlugin.VerifiableCredential): Promise<void> {
        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            did.storeCredential(
                credential,
                () => {resolve()}, (err) => {reject(err)},
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

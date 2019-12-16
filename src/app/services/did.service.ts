import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';

import { SimulatedDID, SimulatedDIDStore, BrowserSimulation, SimulatedCredential } from '../services/browsersimulation';
import { resolve } from 'path';

declare let appManager: AppManagerPlugin.AppManager;
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

    createIdTransactionCallback(payload: string, memo: string) {
        let params = {
            didrequest: payload,
        }
        appManager.sendIntent('didtransaction', params, (ret)=> {
            //TODO
            console.log('sendIntent didtransaction:', ret);
        });
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
    initDidStore(didStoreId: string): Promise<DIDPlugin.DIDStore> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve(new SimulatedDIDStore());
            });
        }
        return new Promise((resolve, reject)=>{
            didManager.initDidStore(
                didStoreId,
                this.createIdTransactionCallback,
                (ret) => {
                    console.log("Initialized DID Store is ",ret);
                    this.selfDidStore = ret;
                    resolve(ret);
                },
                (err) => {reject(err)},
            );
        });
    }

    deleteDidStore(didStoreId: string): Promise<any> {
        console.log("deleteDidStore:",didStoreId);
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve();
            });
        }
        return new Promise((resolve, reject)=>{
            didManager.deleteDidStore(
                didStoreId,
                () => {resolve()}, (err) => {reject(err)},
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
               resolve(true)
            });
        }

        return new Promise((resolve, reject)=>{
            this.selfDidStore.containsPrivateIdentity(
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
        console.log("Creating DID");
        return new Promise((resolve, reject)=>{
            if (!BrowserSimulation.runningInBrowser()) {
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
            }
            else {
                resolve({
                    didString: "did:elastos:azeeza786zea67zaek221fxi9",
                    didDocument: null
                })
            }
        });
    }

    listDids(): Promise<DIDPlugin.UnloadedDID[]> {
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
                let ret = [
                   {did:"elastos:azeeza786zea67zaek221fxi9", alias:""}
                ];
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
        console.log("Resolving DID object for DID", didString);

        return new Promise((resolve, reject)=>{
            if (!BrowserSimulation.runningInBrowser()) {
                this.selfDidStore.loadDidDocument(didString, (didDocument: DIDPlugin.DIDDocument)=>{
                    //console.log(didString, didDocument);
                    didDocument.getSubject((did: DIDPlugin.DID)=>{
                        resolve(did);
                    }, (err)=>{
                        console.error(err);
                        resolve(null);
                    });
                }, (err)=>{
                    console.error(err);
                    resolve(null);
                });
            }
            else {
                resolve(new SimulatedDID())
            }
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

    createCredential(didString: DIDPlugin.DIDString, credentialId, type, expirationDate, properties, passphrase): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                did.issueCredential(
                    didString, credentialId, type, expirationDate, properties, passphrase,
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                );
            }
        });
    }

    deleteCredential(didString: DIDPlugin.DIDString, didUrlString): Promise<any> {
        console.log("deleteCredential:" + didUrlString);
        if (this.platform.platforms().indexOf("cordova") < 0) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                did.deleteCredential(
                    didUrlString,
                    () => {resolve()}, (err) => {reject(err)},
                );
            }
        });
    }

    listCredentials(didString: DIDPlugin.DIDString): Promise<DIDPlugin.UnloadedVerifiableCredential[]> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let fakeDID = new SimulatedDID()
                fakeDID.listCredentials((credentials)=>{
                    resolve(credentials);
                })
            });
        }

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                did.listCredentials(
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                );
            }
        });
    }

    loadCredential(didString: DIDPlugin.DIDString, didUrlString): Promise<any> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let ret = SimulatedCredential.makeForCredentialId(didUrlString)
                resolve(ret)
            });
        }

        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                did.loadCredential(
                    didUrlString,
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                );
            }
        });
    }

    storeCredential(didString: DIDPlugin.DIDString, credential: DIDPlugin.VerifiableCredential): Promise<void> {
        console.log("DIDService - storeCredential", didString, credential);
        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                console.log("DIDService - Calling real storeCredential");
                did.storeCredential(
                    credential,
                    () => {
                        console.log("DIDService - storeCredential responded");
                        resolve()
                    }, (err) => {reject(err)},
                );
            }
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
    addCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.selfDidDocument.addCredential(
                credential,
                storePass,
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

        return credential.toString();
    }

    createVerifiablePresentationFromCredentials(didString: DIDPlugin.DIDString, credentials: DIDPlugin.VerifiableCredential[], storePass: string): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise(async (resolve, reject)=>{
            let did = await this._resolveDid(didString);
            if (!did) {
                reject("Unable to resolve DID");
            }
            else {
                did.createVerifiablePresentation(credentials, "no-realm", "no-nonce", storePass, (presentation: DIDPlugin.VerifiablePresentation)=>{
                    resolve(presentation);
                }, (err)=>{
                    reject(err);
                });
            }
        });
    }
}

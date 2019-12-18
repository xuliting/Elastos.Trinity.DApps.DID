import { Events } from '@ionic/angular';

import { NewDID } from './newdid.model';
import { DID } from './did.model';
import { BrowserSimulation, SimulatedDID, SimulatedDIDStore } from '../services/browsersimulation';
import { Config } from '../services/config';
import { WrongPasswordException } from './exceptions/wrongpasswordexception.exception';

declare let didManager: DIDPlugin.DIDManager;
declare let appManager: AppManagerPlugin.AppManager;

export class DIDStore {
    public pluginDidStore: DIDPlugin.DIDStore = null;
    public unloadedDids: DIDPlugin.DID[] = [];
    public dids: DID[] = [];
    private activeDid: DID = null;

    constructor(private events: Events) {}

    public getActiveDid(): DID {
        return this.activeDid
    }

    public setActiveDid(did: DID) {
        console.log("DID store "+this.getId()+" is setting its active DID to "+(did?did.getDIDString():null));
        this.activeDid = did;
    }

    public getId(): string {
        return this.pluginDidStore.getId();
    }

    /**
     * Right after its creation, a DID store needs to define a private root key (private identity)
     */
    public async createPrivateIdentity(password: string, mnemonicLang: DIDPlugin.MnemonicLanguage, mnemonic: string) : Promise<boolean> {
        let hasPrivId = await this.hasPrivateIdentity();
        if (hasPrivId) {
            console.error("Private identity already exists!")
            return false; // Unable to load store data correctly
        }

        // Create a private root key
        console.log("Creating private root key");
        await this.initPluginPrivateIdentity(mnemonicLang, mnemonic, password, true);
        
        return true;
    }

    public async initNewDidStore() {
        let didStoreId = Config.uuid(6, 16);
        
        console.log("Initializing a new DID Store with ID "+didStoreId);
        await this.initDidStore(didStoreId);
    }

    private async initDidStore(didStoreId: string) {
        this.pluginDidStore = await this.initPluginDidStore(didStoreId);
    }

    /**
     * Fills this object model by loading a plugin DID store with all its contained DIDs, credentials, etc.
     */
    public static async loadFromDidStoreId(didStoreId: string, events: Events) : Promise<DIDStore> {
        console.log("loadFromDidStoreId "+didStoreId);

        let didStore;
        try {
            didStore = new DIDStore(events);
            await didStore.initDidStore(didStoreId);
            
            let pluginDids = await didStore.listPluginDids();

            console.log("Plugin DIDs:", pluginDids);
            if (pluginDids.length == 0) {
                // Something went wrong earlier, no DID in the DID store...
                console.warn("No DID in the DID Store, that's a bit strange but we want to continue here.")
            }

            await didStore.loadAllDids(pluginDids);
        }
        catch (e) {
            console.error("Fatal error while loading from DID Store id.", e);
            return null;
        }

        return didStore;
    }

    protected async loadAllDids(pluginDids: DIDPlugin.DID[]) {
        this.dids = [];
        for(let pluginDid of pluginDids) {
            let did = new DID(pluginDid, this.events);
            await did.loadAll();
            this.dids.push(did);
        }
        console.log("Loaded DIDs:", this.dids);
    }

    /**
     * Finds a loaded DID in the DID list, from its DID string.
     */
    public findDidByString(didString: string): DID {
        console.log("Searching DID from did string "+didString);

        if (!didString)
            return null;

        return this.dids.find((did)=>{
            return did.getDIDString() == didString;
        })
    }

    /**
     * Converts the DID being created into a real DID in the DID store, with some credentials
     * for user's default profile.
     */
    public async addNewDidWithProfile(newDid: NewDID): Promise<string> {
        let createdDid: {did: DIDPlugin.DID, didDocument: DIDPlugin.DIDDocument};
        try {
            // Create and add a DID to the DID store in physical storage.
            createdDid = await this.createPluginDid(newDid.password, "");
            console.log("Created DID:", createdDid);
        }
        catch (e) {
            console.error("Create DID exception - assuming wrong password", e);
            throw new WrongPasswordException();
        }

        // Add DID to our memory model.
        let did: DID;
        if (BrowserSimulation.runningInBrowser())
            did = new DID(new SimulatedDID(), this.events);
        else
            did = new DID(createdDid.did, this.events);
        this.dids.push(did);

        // Now create credentials for each profile entry
        await did.writeProfile(newDid.profile, newDid.password);

        // This new DID becomes the active one.
        await this.setActiveDid(did);

        return did.getDIDString();
    }

    public async deleteDid(did: DID) {
        // Delete for real
        await this.deletePluginDid(did.getDIDString());

        // Delete from our local model
        let didIndex = this.dids.findIndex(d=>d==did);
        this.dids.splice(didIndex, 1);

        console.log("Deleted DID");

        await this.setActiveDid(null);
    }

    private initPluginDidStore(didStoreId: string): Promise<DIDPlugin.DIDStore> {
        if (BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve, reject)=>{
               resolve(new SimulatedDIDStore());
            });
        }
        return new Promise((resolve, reject)=>{
            didManager.initDidStore(
                didStoreId,
                this.createIdTransactionCallback,
                (pluginDidStore: DIDPlugin.DIDStore) => {
                    console.log("Initialized DID Store is ", pluginDidStore);
                    resolve(pluginDidStore);
                },
                (err) => {reject(err)},
            );
        });
    }

    private createIdTransactionCallback(payload: string, memo: string) {
        let params = {
            didrequest: payload,
        }
        appManager.sendIntent('didtransaction', params, (ret)=> {
            //TODO
            console.log('sendIntent didtransaction:', ret);
        });
    }

    private initPluginPrivateIdentity(language, mnemonic, password, force): Promise<void> {
        if (BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve, reject)=>{
                resolve()
            });
        }

        return new Promise((resolve, reject)=>{
            this.pluginDidStore.initPrivateIdentity(
                language, mnemonic, password, password, force,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    hasPrivateIdentity(): Promise<boolean> {
        if (BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve, reject)=>{
               resolve(true)
            });
        }

        return new Promise((resolve, reject)=>{
            this.pluginDidStore.containsPrivateIdentity(
                (hasPrivId) => {resolve(hasPrivId)}, (err) => {reject(err)},
            );
        });
    }

    deletePluginDid(didString): Promise<void> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.deleteDid(
                didString,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    createPluginDid(passphrase, hint = ""): Promise<{did:DIDPlugin.DID, didDocument:DIDPlugin.DIDDocument}> {
        console.log("Creating DID");
        return new Promise((resolve, reject)=>{
            if (!BrowserSimulation.runningInBrowser()) {
                this.pluginDidStore.newDid(
                    passphrase, hint,
                    (did, didDocument) => {
                        console.log("Created DID:", did);
                        resolve({did:did, didDocument:didDocument})
                    },
                    (err) => {reject(err)},
                );
            }
            else {
                resolve({did:new SimulatedDID(), didDocument: null})
            }
        });
    }

    listPluginDids(): Promise<DIDPlugin.DID[]> {
        if (BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve, reject)=>{
               resolve([new SimulatedDID(), new SimulatedDID(), new SimulatedDID()]);
            });
        }
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.listDids(
                DIDPlugin.DIDStoreFilter.DID_ALL,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    resolveDid(didString): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.resolveDidDocument(
                didString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    storeDid(didDocumentId, hint): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.storeDidDocument(
                didDocumentId, hint,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    updateDid(didDocument: DIDPlugin.DIDDocument, didUrlString, storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.updateDidDocument(
                didDocument, storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    setResolverUrl(resolverUrl): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.setResolverUrl(
                resolverUrl,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    synchronize(storepass): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidStore.synchronize(
                storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }
}
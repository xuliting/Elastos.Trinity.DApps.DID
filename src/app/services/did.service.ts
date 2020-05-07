import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController, Events } from '@ionic/angular';

import { SimulatedDID, SimulatedDIDStore, BrowserSimulation, SimulatedCredential } from '../services/browsersimulation';
import { resolve } from 'path';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from './localstorage';
import { PopupProvider } from './popup';
import { Native } from './native';
import { DIDStore } from '../model/didstore.model';
import { DIDEntry } from '../model/didentry.model';
import { DID } from '../model/did.model';
import { NewDID } from '../model/newdid.model';
import { WrongPasswordException } from '../model/exceptions/wrongpasswordexception.exception';
import { DIDPluginException } from '../model/exceptions/didplugin.exception';

declare let didManager: DIDPlugin.DIDManager;
declare let appManager: AppManagerPlugin.AppManager;

@Injectable({
    providedIn: 'root'
})
export class DIDService {
    public static instance: DIDService = null;

    public activeDidStore: DIDStore;
    public didBeingCreated: NewDID = null;

    constructor(
        private platform: Platform,
        public zone: NgZone,
        private translate: TranslateService,
        public toastCtrl: ToastController,
        public events: Events,
        public localStorage: LocalStorage,
        private popupProvider: PopupProvider,
        public native: Native) {
            console.log("DIDService created");
            DIDService.instance = this;

            this.subscribeEvents();
    }

    private subscribeEvents() {
      this.events.subscribe("did:namechanged", ()=>{
        // Name profile item was changed in a DID? Rebuild our DID menu entries
        DIDService.instance.rebuildDidEntries();
      });
    }

    public async displayDefaultScreen() {
        let didStoreId = await this.localStorage.getCurrentDidStoreId();
        let didString = await this.localStorage.getCurrentDid();

        console.log("Existing DID Store ID found:", didStoreId);
        let couldActivate = await this.activateSavedDid();
        if (couldActivate)
            this.showDid(didStoreId, didString);
        else
            this.handleNull();
    }

    /**
     * Activate the DID saved from a previous session.
     */
    public async activateSavedDid(): Promise<boolean> {
      let storeId = await this.localStorage.getCurrentDidStoreId();
      let didString = await this.localStorage.getCurrentDid();
      return this.activateDid(storeId, didString);
    }

    public async activateSavedDidStore(): Promise<boolean> {
      let storeId = await this.localStorage.getCurrentDidStoreId();
      return this.activateDidStore(storeId);
    }

    public activateDidStore(storeId: string): Promise<boolean> {
      return new Promise(async (resolve, reject)=>{
          if (storeId == null) {
              console.error("Impossible to activate a null store id!");
              resolve(false);
              return;
          }

          if (storeId == this.getCurDidStoreId()) {
              console.log("DID Store ID hasn't changed - not loading the DID Store");
              resolve(true); // Nothing changed but considered as successful.
              return;
          }

          let didStore = await DIDStore.loadFromDidStoreId(storeId, this.events);
          if (!didStore) {
            this.popupProvider.ionicAlert("Store load error", "Sorry, we were unable to load your DID store...");
            resolve(false);
            return;
          }

          console.log("Setting active DID store", didStore);
          this.activeDidStore = didStore;

          this.localStorage.saveCurrentDidStoreId(didStore.getId());

          this.events.publish('did:didchanged');

          resolve(true);
      });
    }

    /**
     * Make the given DID store becoming the active one for all further operations.
     * Redirects to the right screen after activation, if a switch is required.
     */
    public activateDid(storeId: string, didString: string): Promise<boolean> {
      console.log("Activating DID using DID store ID "+storeId+" and DID "+didString);

      return new Promise(async (resolve, reject)=>{
          if (didString == null) {
              console.error("Impossible to activate a null did string!");
              resolve(false);
              return;
          }

          let couldActivateStore = await this.activateDidStore(storeId);
          if (!couldActivateStore) {
              resolve(false);
              return;
          }

          try {
              let did = this.getActiveDidStore().findDidByString(didString);
              if (!did) { // Just in case, should not happen but for robustness...
                  console.error("No DID found! Failed to activate DID");
                  resolve(false);
                  return;
              }
              await this.localStorage.setCurrentDid(did.getDIDString());
              await this.getActiveDidStore().setActiveDid(did);

              this.events.publish('did:didchanged');

              resolve(true);
        }
        catch (e) {
          // Failed to load this full DID content
          console.error(e);
          resolve(false);
        }
      });
    }

    public async showDid(storeId:string, didString: string) {
      console.log("Showing DID Store "+storeId+" with DID "+didString);
      let couldEnableStore = await this.activateDid(storeId, didString);
      if (!couldEnableStore) {
        console.error("Unable to load the previously selected DID store");
        this.handleNull(); // TODO: go to DID list instead
      }
      else {
          if (this.getActiveDid() !== null)
           this.native.setRootRouter('/myprofile');
           // this.native.setRootRouter('/noidentity');
          else {
              // Oops, no active DID...
              console.warn("No active DID in this store!");
              this.native.setRootRouter('/choosedid');
          }
      }
    }

    private handleNull() {
      // this.native.setRootRouter('/newpassword');
      this.native.setRootRouter('/noidentity');
    }

    public async newDidStore() {
      let didStore = new DIDStore(this.events);
      await didStore.initNewDidStore();

      return didStore;
    }

    /**
     * Called at the beginning of a new DID creation process.
     */
    public async addDidStore() {
      console.log("Adding DID store");

      let didStore = await this.newDidStore();

      // Activate the DID store, without DID
      await this.activateDidStore(didStore.getId());
    }

    /**
     * Called at the end of the DID creation process to finalize a few things.
     */
    public async finalizeDidCreation(storePass: string) {
      console.log("Finalizing DID creation");

      // First, synchronize with chain to make sure we don't mess up with DID indexes. The DID SDK has to
      // create the new DID at the right location.
      console.log("Synchronizing DID store before adding the new DID");
      await this.getActiveDidStore().synchronize(storePass);
      console.log("Synchronization completed");

      let createdDidString = await this.getActiveDidStore().addNewDidWithProfile(this.didBeingCreated);
      let name = this.didBeingCreated.profile.getEntryByKey("name").value;
      await this.addDidEntry(new DIDEntry(createdDidString, name));

      await this.activateDid(this.getCurDidStoreId(), createdDidString);

      console.log("Finalized DID creation for did string "+createdDidString+" - with name "+name);
    }

    /**
     * Create a new simple DIDStoreEntry to save it to local storage, just to maintain
     * a list of existing stores and their names/ids
     */
    private async addDidEntry(didEntry: DIDEntry) {
      console.log("Adding DID entry:", didEntry);

      // Simpel check: make sure the DID entry doesn't already exist
      let existingEntry = await this.searchDIDEntry(didEntry.didString);
      if (existingEntry) {
        console.log("Not adding DIDEntry because it already exists", didEntry);
        return;
      }

      let existingDidEntries = await this.getDidEntries();
      existingDidEntries.push(didEntry);

      await this.localStorage.saveDidEntries(existingDidEntries);
    }

    public async getDidEntries(): Promise<DIDEntry[]> {
      let entries = await this.localStorage.getDidEntries();
      if (!entries)
        return [];

      return entries;
    }

    /**
     * Look for the given did string in the did entries
     */
    public async searchDIDEntry(didString: DIDPlugin.DIDString): Promise<DIDEntry> {
      let entries = await this.localStorage.getDidEntries();
      if (!entries)
        return null;

      return entries.find((e)=>{
        return (e.didString == didString);
      });
    }

    /**
     * Used after importing a DID store from chain in order to update our local storage list of DIDs.
     */
    public async rebuildDidEntries() {
      console.log("Rebuilding DID entries from store DIDs:", this.activeDidStore.dids);

      let entries: DIDEntry[] = [];

      for (let did of this.activeDidStore.dids) {
        let profile = did.getBasicProfile();

        let entry = new DIDEntry(did.getDIDString(), profile.getName());
        entries.push(entry);
      }

      await this.localStorage.saveDidEntries(entries);
    }

    public getCurDidStoreId() {
      if (!this.activeDidStore)
        return null;

      return this.activeDidStore.pluginDidStore.getId();
    }

    public getActiveDidStore() : DIDStore {
      return this.activeDidStore;
    }

    public getActiveDid(): DID {
      return this.activeDidStore.getActiveDid();
    }

    async deleteDid(did: DID) {
      let storeId = this.getActiveDidStore().getId();
      await this.getActiveDidStore().deleteDid(did);

      // Remove DID from DidStoreEntry list
      let entries = await this.localStorage.getDidEntries();
      for (let i = 0; i < entries.length; i++) {
          if (entries[i].didString === did.getDIDString()) {
              entries.splice(i, 1);
              break;
          }
      }
      this.localStorage.saveDidEntries(entries);

      // Switch current store to use the first did in the DID list, or go to new identity creation screen.
      if (entries.length > 0) {
        this.showDid(storeId, entries[0].didString);
      } else {
        this.localStorage.setCurrentDid(null);
        this.activeDidStore.setActiveDid(null);
        this.handleNull();
      }
    }

    generateMnemonic(language): Promise<any> {
        return new Promise((resolve, reject)=>{
            if (!BrowserSimulation.runningInBrowser()) {
                didManager.generateMnemonic(
                    language,
                    (ret) => {resolve(ret)}, (err) => {reject(err)},
                );
            }
            else {
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

    //Credential
    credentialToJSON(credential: DIDPlugin.VerifiableCredential): Promise<string> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let ret = "{\"id\":\"did:elastos:ikoWcH4HJYGsHFzYH3VEVL7iMeL6NGm8VF#test\",\"type\":[\"SelfProclaimedCredential\"],\"issuanceDate\":\"2019-11-11T08:00:00Z\",\"expirationDate\":\"2034-11-11T08:00:00Z\",\"credentialSubject\":{\"id\":\"did:elastos:ikoWcH4HJYGsHFzYH3VEVL7iMeL6NGm8VF\",\"remark\":\"ttttttttt\",\"title\":\"test\",\"url\":\"tst\"},\"proof\":{\"verificationMethod\":\"#primary\",\"signature\":\"foJZLqID4C27eDheK/VDYjaGlxgTzy88s+o95GL4KwFbxLYechjOQ/JjMv7UFTYByOg84dECezeqjR7pjHeu1g==\"}}"
                resolve(ret)
            });
        }

        return credential.toString();
    }


    /**
     * We maintain a list of hardcoded basic profile keys=>user friendly string, to avoid
     * always displaying credential keys to user, and instead, show him something nicer.
     */
    getUserFriendlyBasicProfileKeyName(key: string): string {
      let translationKey = "credential-info-type-"+key;
      let translated = this.translate.instant(translationKey);
      if (!translated || translated == "" || translated == translationKey)
        return key;

      return translated;
    }
}

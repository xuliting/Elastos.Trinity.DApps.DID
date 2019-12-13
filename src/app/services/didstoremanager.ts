
import { NgZone } from '@angular/core';
import { Events, Platform } from '@ionic/angular';

import { Config } from "./config";
import { DIDService } from "./did.service";
import { LocalStorage } from './localstorage';
import { Profile } from '../model/profile.model';
import { DIDStoreEntry } from '../model/didstoreentry.model';
import { DIDStore } from '../model/didstore.model';
import { Native } from "./native";
import { Util } from "./util";
import { BrowserSimulation } from './browsersimulation';
import { PopupProvider } from './popup';

declare let didManager: DIDPlugin.DIDManager;

export class DidStoreManager {
  public subWallet = {};
  public name: string = '';

  public activeDidStore: DIDStore;

  public didInfos: any = {};

  constructor(
      public event: Events,
      public zone: NgZone,
      public platform: Platform,
      public localStorage: LocalStorage,
      public didService: DIDService,
      private popupProvider: PopupProvider,
      public native: Native) {
    console.log("DidStoreManager created");
  }

  public async displayDefaultScreen() {
    console.log("DidStoreManager init");

    let id = await this.localStorage.getCurrentDidStoreId();
    console.log("Current DID Store ID:", id);

    if (null == id) {
      this.handleNull();
    }
    else {
      let info = await this.localStorage.getDidStoreEntries();
      console.log("DidStoreManager getDidStoreEntries:", info);

      if (info == null || info.length == 0) {
        this.handleNull();
      }
      else {
        await this.showDidStore(id);
      }
    }

    console.log("DidStoreManager initialization completed");
  }

  /**
   * Activate the DID store saved from a previous session.
   */
  public async activateSavedDidStore() {
    let id = await this.localStorage.getCurrentDidStoreId();
    await this.activateDidStore(id);
  }

  /**
   * Make the given DID store becoming the active one for all further operations.
   * Redirects to the right screen after activation, if a switch is required.
   */
  public activateDidStore(id: string) {
    console.log("Activating DID store using DID store ID", id);

    return new Promise(async (resolve, reject)=>{
      if (id == this.getCurDidStoreId()) {
        console.log("DID Store ID hasn't changed - not loading the DID Store");
        return;
      }

      try {
        let didStore = new DIDStore(this.didService, this.event);
        let couldFullyLoadDidStore = await didStore.loadFromDidStoreId(id);
        if (!couldFullyLoadDidStore) {
          this.popupProvider.ionicAlert("Load DID error", "Sorry, we were unable to load your DID...");
          resolve(false);
          return;
        }

        console.log("Setting active DID store", didStore);
        this.activeDidStore = didStore;

        this.event.publish('did:didstorechanged');

        this.localStorage.saveCurrentDidStoreId(this.activeDidStore.pluginDidStore.getId());

        resolve(true);
      }
      catch (e) {
        // Failed to load this full DID store content
        console.error(e);
        resolve(false);
      }
    });
  }

  public async showDidStore(id:string) {
    console.log("Showing DID Store "+id);
    let couldEnableStore = await this.activateDidStore(id);
    if (!couldEnableStore) {
      console.error("Unable to load the previously selected DID store");
      this.handleNull(); // TODO: go to DID list instead
    }
    else {
      this.native.setRootRouter('/home/myprofile', {create:false});
      //this.native.setRootRouter('/choosedid');
      //this.native.setRootRouter('/home/didsettings');
      //this.native.setRootRouter('/newpasswordset');
      //this.native.setRootRouter('/noidentity');
      //this.native.setRootRouter('/editprofile');
      /*this.native.setRootRouter('/verifymnemonics', {
        mnemonicStr:"a b c d e f g h k l m o",
      });*/
      /*this.native.setRootRouter('/backupdid', {
        mnemonicStr:"a b c d e f g h k l m o",
      });*/
      //this.native.setRootRouter('/home/credentiallist');
    }
  }

  handleNull() {
    this.native.setRootRouter('/noidentity');
    //this.native.setRootRouter('/devpage');
    //this.native.setRootRouter('/editprofile');
  }

  /**
   * Called at the beginning of a new DID creation process.
   */
  public async addDidStore() {
    let didStoreId = Config.uuid(6, 16);

    console.log("Adding a new DID Store with ID "+didStoreId);
    await this.didService.initDidStore(didStoreId);
    await this.activateDidStore(didStoreId);
  }

  /**
   * Called at the end of the DID creation process to finalize a few things.
   */
  public async finalizeDidCreation() {
    let didStoreId = this.activeDidStore.pluginDidStore.getId();
    let name = Config.didBeingCreated.profile.name;

    console.log("Finalizing store creation for store ID "+didStoreId+" with name "+name);

    await this.addDidStoreEntry(new DIDStoreEntry(didStoreId, name));

    this.event.publish('did:didstorechanged');
  }

  /**
   * Create a new simple DIDStoreEntry to save it to local storage, just to maintain
   * a list of existing stores and their names/ids
   */
  public async addDidStoreEntry(didStoreEntry: DIDStoreEntry) {
    let existingStoreEntries = await this.getDidStoreEntries();
    existingStoreEntries.push(didStoreEntry);

    this.localStorage.saveDidStoreEntries(existingStoreEntries);
  }

  public async getDidStoreEntries(): Promise<DIDStoreEntry[]> {
    let entries = await this.localStorage.getDidStoreEntries();
    if (!entries)
      return [];

    return entries;
  }

  public getCurDidStoreId() {
    if (!this.activeDidStore)
      return null;

    return this.activeDidStore.pluginDidStore.getId();
  }

  public getActiveDidStore() : DIDStore {
    return this.activeDidStore;
  }

  public async deleteDidStore(didStore: DIDStore) {
    this.didService.deleteDidStore(didStore.pluginDidStore.getId());

    // Remove store from DidStoreEntry list
    let entries = await this.localStorage.getDidStoreEntries();
    let storeId = didStore.pluginDidStore.getId();
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].storeId === storeId) {
            entries.splice(i, 1);
            break;
       }
    }
    this.localStorage.saveDidStoreEntries(entries);

    // Switch current store to the first one in the DID list, or go to new identity creation screen.
    if (entries.length > 0) {
      this.showDidStore(entries[0].storeId);
    } else {
      this.localStorage.saveCurrentDidStoreId('');
      this.activeDidStore = null;
      this.handleNull();
    }
  }
}



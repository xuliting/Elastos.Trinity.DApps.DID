
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

export class DidStoreManager {
  public subWallet = {};
  public name: string = '';

  public masterDidStore: DIDPlugin.DIDStore[] = [];
  public activeDidStore: DIDStore;

  public didInfos: any = {};

  constructor(
      public event: Events,
      public zone: NgZone,
      public platform: Platform,
      public localStorage: LocalStorage,
      public didService: DIDService,
      public native: Native) {
    console.log("DidStoreManager created");
    this.init();
  }

  async init() {
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
        this.masterDidStore = [];
        for (let i in info) {
          let storeEntry = info[i];
          let didStore = await this.didService.initDidStore(storeEntry.storeId);
          this.masterDidStore.push(didStore);
        }

        let couldEnableStore = await this.activateDidStore(id);
        if (!couldEnableStore) {
          console.error("Unable to load the previously selected DID store");
          this.handleNull(); // TODO: go to DID list instead
        }
        else {
          this.native.setRootRouter('/profile/myprofile', {create:false});
        }
      }
    }
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
          resolve(false);
          return;
        }

        console.log("Setting active DID store", didStore);
        this.activeDidStore = didStore;

        this.event.publish('did:didstorechanged');
        
        if (!BrowserSimulation.runningInBrowser()) {
          this.localStorage.saveCurrentDidStoreId(this.activeDidStore.pluginDidStore.getId());
        }

        resolve(true);
      }
      catch (e) {
        // Failed to load this full DID store content
        console.error(e);
        resolve(false);
      }
    });
  }

  handleNull() {
    //this.native.setRootRouter('/noidentity');
    //this.native.setRootRouter('/devpage');
    this.native.setRootRouter('/newpasswordset');
  }

  /**
   * Called at the beginning of a new DID creation process.
   */
  public async addDidStore() {
    let didStoreId = Config.uuid(6, 16);
    
    console.log("Adding a new DID Store with ID "+didStoreId);
    let didStore = await this.didService.initDidStore(didStoreId);
    this.masterDidStore.push(didStore);

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

  /*public setcurDidId(id) {
    if (id != this.curDidId) {
      //TODO
    }
  }

  public getcurDidId() {
    return this.curDidId;
  }*/
}



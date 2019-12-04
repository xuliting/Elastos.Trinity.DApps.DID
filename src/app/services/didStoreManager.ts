
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
      console.log("Loading DID Store info.");

      let info = await this.localStorage.getDidStoreEntries();
      console.log("DidStoreManager getDidStoreEntries:", info);

      if (info == null || info.length == 0) {
        this.handleNull();
      }
      else {
        this.masterDidStore = [];
        info.map(async (storeEntry)=>{
          let didStore = await this.didService.initDidStore(storeEntry.storeId);
          this.masterDidStore.push(didStore);
        });
        let couldEnableStore = await this.activateDidStore(id, true);
        if (!couldEnableStore) {
          console.error("Unable to load the previously selected DID store");
        }
      }
    }
  }

  /**
   * Make the given DID store becoming the active one for all further operations.
   * Redirects to the right screen after activation, if a switch is required.
   */
  public activateDidStore(id: string, doSwitch = false) {
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
          this.handleNull();
          resolve(false);
          return;
        }

        console.log("Setting active DID store", didStore);
        this.activeDidStore = didStore;

        this.event.publish('did:didstorechanged');
        
        if (doSwitch) {
          this.localStorage.saveCurrentDidStoreId(this.activeDidStore.pluginDidStore.getId());
          this.native.setRootRouter('/myprofile', {create:false});
          //this.native.setRootRouter('/devpage');
        }

        resolve(true);
      }
      catch (e) {
        // Failed to load this full DID store content
        resolve(false);
      }
    });
  }

  handleNull() {
    this.native.setRootRouter('/noidentity');
    //this.native.setRootRouter('/devpage');
  }

  public async addDidStore() {
    console.log("Adding a new DID Store");

    let name = "TODO-NAME";

    let didStoreId = Config.uuid(6, 16);
    let didStore = await this.didService.initDidStore(didStoreId);
    this.masterDidStore.push(didStore);

    await this.addDidStoreEntry(new DIDStoreEntry(didStoreId, name));

    await this.activateDidStore(didStoreId, false);
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



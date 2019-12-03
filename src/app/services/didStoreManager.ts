
import { NgZone } from '@angular/core';
import { Events, Platform } from '@ionic/angular';

import { Config } from "./config";
import { DIDService } from "./did.service";
import { LocalStorage } from './localstorage';
import { Profile } from './profile.model';
import { Native } from "./native";
import { Util } from "./util";

export class DidStoreManager {
  public subWallet = {};
  public name: string = '';

  public masterDidStore: DIDPlugin.DIDStore[] = [];
  public curDidStoreId: string = "-1";
  public curDidId: string = "";
  public curDidStore: DIDPlugin.DIDStore;
  public didInfos: any = {};
  public didList: any = {};
  public credentialList: any = {};
  public profile: Profile = {
    name:"",
    birthday:"",
    gender:"",
    area:"",
    email:"",
    IM:"",
    phone:"",
    ELAAddress:"",
  };

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

  init() {
    console.log("DidStoreManager init");
    this.localStorage.getCurrentDidStoreId((id)=> {
      console.log("Current DID Store ID:", id);
      if (null == id) {
        this.handleNull();
      }
      else {
        this.localStorage.getDidStoreInfos((info)=> {
          console.log("DidStoreManager getDidStoreInfos:" + JSON.stringify(info));
          this.masterDidStore = info;
          if (null == info[id]) {
            this.handleNull();
          }
          else {
            this.setcurDidStoreId(id, false);
          }
        })
      }
    })
  }

  public setcurDidStoreId(id, doSwitch = false) {
    console.log("Setting current DID Store ID to:", id);

    if (id != this.curDidStoreId) {
      console.log("DID Store ID has changed - loading the DID Store");

      this.curDidStoreId = id;
      this.curDidStore = this.masterDidStore[id];
      this.loadDidStore(this.curDidStore.getId());
      console.log("doSwitch:" +doSwitch);
      if (doSwitch) {
        this.localStorage.saveCurrentDidStoreId(this.curDidStoreId);
        this.event.publish('did:didstorechanged');
      }
    }
  }

  loadDidStore(didStoreId) {
    this.didService.initDidStore(didStoreId)
      .then (()=>{return this.didService.hasPrivateIdentity()})
      .then((hasPrivId) => {
        if (hasPrivId) {
          return this.didService.listDids();
        }
        else {
          this.handleNull();
        }
      })
      .then( (ret)=> {
        console.log("listDids:" + JSON.stringify(ret));
        this.curDidId = ret['items']['0']['did'];//just one did?
        return this.didService.loadDid(this.curDidId);
      })
      .then( (ret)=> {
        this.getCurCredentialList();
        this.native.setRootRouter('/myprofile', {create:false});
        //this.native.setRootRouter('/devpage');
      })
      .catch( (error)=> {
        console.log("DidStoreManager init error:" + error.message);
        this.handleNull();
      })
  }

  handleNull() {
    this.native.setRootRouter('/noidentity');
    //this.native.setRootRouter('/devpage');
  }

  saveProfile(profile) {
    console.log(this.curDidStore);
    this.curDidStore['profile'] = profile;
  }

  public getProfile() {
    return this.curDidStore['profile'];
  }

  public addDidStore() {
    console.log("Adding a new DID Store");

    let didStoreId = Config.uuid(6, 16);
    this.didService.initDidStore(didStoreId).then((didStore)=> {
      this.masterDidStore[didStoreId] = didStore;
      this.curDidStoreId = didStoreId;
      this.curDidStore = didStore;
    })
  }

  public saveInfos() {
    this.localStorage.setDidStoreInfos(this.masterDidStore);
    this.localStorage.saveCurrentDidStoreId(this.curDidStoreId);
  }

  public getAllDidStore() {
    return this.masterDidStore;
  }

  public getcurDidStoreId() {
    return this.curDidStoreId;
  }

  public setcurDidId(id) {
    if (id != this.curDidId) {
      //TODO
    }
  }

  public getcurDidId() {
    return this.curDidId;
  }

  public async addDid(language, mnemonic) {
    await this.didService.initPrivateIdentity(language, mnemonic, this.curDidStore['password'], true)
    
    let ret = await this.didService.createDid(this.curDidStore['password'], "");
    
    this.curDidId = ret.didString;
    this.curDidStore['did'] = this.curDidId;
    console.log("didStoreManager addDid: " + JSON.stringify(ret));
    this.saveInfos();
  }

  public deleteDid() {

  }

  public async addCredential(title: String, props: any, userTypes?: String[]) {
    let types = new Array();
    // types[0] = "BasicProfileCredential";
    types[0] = "SelfProclaimedCredential";

    // If caller provides custom types, we add them to the list
    // TODO: This is way too simple for now. We need to deal with types schemas in the future.
    if (userTypes) {
      userTypes.map((type)=>{
        types.push(type);
      })
    }

    console.log("Asking DIDService to create the credential");
    let credential = await this.didService.createCredential(this.curDidId, title, types, 15, props, this.curDidStore['password']);

    console.log("Asking DIDService to store the credential");
    await this.didService.storeCredential(this.curDidId, credential);

    console.log("Asking DIDService to add the credential");
    await this.didService.addCredential(credential.objId);

    console.log("Credential successfully added");

    //update credential
    await this.getCurCredentialList();
    this.event.publish('did:credentialadded');

    return credential;
  }

  async getCurCredentialList() {
    await this.didService.listCredentials(this.curDidId).then( (ret)=> {
      console.log("Current credentials list: ",ret.items);
      this.credentialList = ret.items;
      this.loadAllCredential();
    });
  }

  loadAllCredential() {
    for (let entry of this.credentialList) {
      this.loadCredential(this.curDidId, entry);
    }
  }

  loadCredential(curDidId, entry) {
    this.didService.loadCredential(curDidId, entry['didurl']).then( (ret)=> {
      let info = {
        fragment: ret['info']['fragment'],
        type: ret['info']['type'],
        issuance: ret['info']['issuance'],
        expiration: ret['info']['expiration'],
        title: ret['info']['props']['title'],
        url: ret['info']['props']['url'],
        remark: ret['info']['props']['remark'],
      }
      entry['info'] = info;
      entry['object'] = ret;
    });
  }

  public getCredentialList() {
    return this.credentialList;
  }
}



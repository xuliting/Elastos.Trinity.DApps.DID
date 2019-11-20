
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

  public masterDidStore: any = {};
  public curDidStoreId: string = "-1";
  public curDidId: string = "-1";
  public curDidStore: any = {};
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
    this.init();
  }

  init() {
    this.localStorage.getCurrentDidStoreId( (id)=> {
      if (null == id) {
        this.handleNull();
      }
      else {
        this.curDidStoreId = id;
        this.localStorage.getDidStoreInfos((info)=> {
          console.log("DidStoreManager getDidStoreInfos:" + JSON.stringify(info));
          this.masterDidStore = info;
          this.curDidStore = info[id];
          if ((null == this.curDidStore) || (Util.isNull(this.curDidStore.password))) {
            this.handleNull();
          }
          else {
            this.loadDidStore(this.curDidStore.id, this.curDidStore.password);
          }
        })
      }
    })
  }

  loadDidStore(didStoreId, password) {
    this.didService.initDidStore(didStoreId, password)
      .then (()=>{return this.didService.hasPrivateIdentity()})
      .then((ret) => {
        if (ret == "true") {
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
      })
      .catch( (error)=> {
        console.log("DidStoreManager init error:" + error.message);
        this.handleNull();
      })
  }

  handleNull() {
    this.native.setRootRouter('/noidentity');
  }

  saveProfile(profile) {
    this.curDidStore['profile'] = profile;
  }

  public getProfile() {
    return this.curDidStore['profile'];
  }

  public addDidStore(password) {
    this.curDidStoreId = Config.uuid(6, 16);
    this.curDidStore['id'] = this.curDidStoreId;
    this.curDidStore['password'] = password;
    this.didService.initDidStore(this.curDidStoreId, password);
    this.masterDidStore[this.curDidStoreId] = this.curDidStore;
  }

  public saveInfos() {
    this.localStorage.setDidStoreInfos(this.masterDidStore);
    this.localStorage.saveCurrentDidStoreId(this.curDidStoreId);
  }

  public setcurDidStoreId(id) {
    if (id != this.curDidStoreId) {
      this.localStorage.saveCurrentDidStoreId({ masterId: id }).then((data) => {
        this.curDidStoreId = id;
        Config.curDidStore = this.masterDidStore[id];
      });
    }
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

  public async addDid(mnemonic) {
    await this.didService.initPrivateIdentity(mnemonic, this.curDidStore['password'], true)
      .then((ret) => {
        return this.didService.createDid(this.curDidStore['password'], "");
      })
      .then ((ret)=> {
        this.curDidId = ret.DidString;
        this.curDidStore['did'] = this.curDidId;
        console.log("didStoreManager addDid: " + JSON.stringify(this.curDidStore));
        this.saveInfos();
      });
  }

  public deleteDid() {

  }

  public async addCredential(title, props) {
    let types = new Array();
    // types[0] = "BasicProfileCredential";
    types[0] = "SelfProclaimedCredential";

    let credential = null;
    await this.didService.createCredential(this.curDidId, title, types, 15, props, this.curDidStore['password']).then ( (ret)=> {
        credential = ret;
    });
    await this.didService.storeCredential(credential.objId);
    await this.didService.addCredential(credential.objId);

    //update credential
    await this.getCurCredentialList();
    this.event.publish('did:credentialadded');

  }

  async getCurCredentialList() {
    await this.didService.listCredentials(this.curDidId).then( (ret)=> {
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



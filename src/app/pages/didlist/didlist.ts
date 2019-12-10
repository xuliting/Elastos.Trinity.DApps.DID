import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { DIDStore } from 'src/app/model/didstore.model';
import { DIDService } from 'src/app/services/did.service';
import { DIDStoreEntry } from '../../model/didstoreentry.model';

@Component({
  selector: 'page-didlist',
  templateUrl: 'didlist.html',
  styleUrls: ['didlist.scss']
})
export class DIDListPage {
  public didStoreList: DIDStoreEntry[];
  public activeProfile: Profile = null;

  constructor(private native: Native,
              public event: Events,
              public zone: NgZone) {
    this.init();
  }

  ngOnInit() {
    this.init();
    this.event.subscribe('did:didstorechanged', ()=> {
      this.zone.run(() => {
        this.refreshStoreList();
        this.refreshActiveProfile();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didstorechanged');
  }

  async init() {
    this.refreshStoreList();
    this.refreshActiveProfile();
  }

  async refreshStoreList() {
    this.didStoreList = await Config.didStoreManager.getDidStoreEntries();
  }

  refreshActiveProfile() {
    this.activeProfile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
    console.log("DID list: refreshed active profile", this.activeProfile);
  }

  addDIDStore() {
    this.native.go("/noidentity", {isfirst: false});
  }

  switchDidStore(didStoreEntry: DIDStoreEntry) {
    Config.didStoreManager.activateDidStore(didStoreEntry.storeId);
    this.native.setRootRouter("/home/myprofile", {create: false});
  }

  viewActiveProfile() {
    this.native.setRootRouter("/home/myprofile", {create: false});
  }
}

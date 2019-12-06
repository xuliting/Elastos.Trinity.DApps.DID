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
              public zone: NgZone,) {
    this.init();
  }

  ngOnInit() {
    this.init();
    this.event.subscribe('did:didstorechanged', ()=> {
      this.zone.run(() => {
        this.refreshActiveProfile();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didstorechanged');
  }

  async init() {
    this.didStoreList = await Config.didStoreManager.getDidStoreEntries();
    this.refreshActiveProfile();
  }

  refreshActiveProfile() {
    this.activeProfile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
  }

  addDIDStore() {
    this.native.go("/noidentity", {isfirst: false});
  }

  switchDidStore(didStoreEntry: DIDStoreEntry) {
    Config.didStoreManager.activateDidStore(didStoreEntry.storeId);
    this.native.setRootRouter("/home/myprofile", {create: false});
  }
}
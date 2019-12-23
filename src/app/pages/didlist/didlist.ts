import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { DIDStore } from 'src/app/model/didstore.model';
import { DIDService } from 'src/app/services/did.service';
import { DIDEntry } from '../../model/didentry.model';

@Component({
  selector: 'page-didlist',
  templateUrl: 'didlist.html',
  styleUrls: ['didlist.scss']
})
export class DIDListPage {
  public didList: DIDEntry[];
  public activeProfile: Profile = null;

  constructor(private native: Native,
              public event: Events,
              private didService: DIDService,
              public zone: NgZone) {
    this.init();
  }

  ngOnInit() {
    this.init();
    this.event.subscribe('did:didchanged', ()=> {
      this.zone.run(() => {
        this.refreshStoreList();
        this.refreshActiveProfile();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didchanged');
  }

  async init() {
    this.refreshStoreList();
    this.refreshActiveProfile();
  }

  async refreshStoreList() {
    console.log("DID List is refreshing store list");
    this.didList = await this.didService.getDidEntries();
  }

  refreshActiveProfile() {
    let activeDid = this.didService.getActiveDid();
    if (activeDid) {
      this.activeProfile = activeDid.getBasicProfile();
      console.log("DID list: refreshed active profile", this.activeProfile);
    }
  }

  addDID() {
    this.native.go("/noidentity", {isfirst: false});
  }

  switchDidStore(didStoreEntry: DIDEntry) {
    this.didService.activateDid(this.didService.getActiveDidStore().getId(), didStoreEntry.didString);
    this.native.setRootRouter("/home/myprofile");
  }

  viewActiveProfile() {
    this.native.setRootRouter("/home/myprofile");
  }
}

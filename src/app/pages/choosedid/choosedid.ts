import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { DIDStoreEntry } from '../../model/didstoreentry.model';
import { Subscription } from 'rxjs';
import { ChooseIdentityOptions } from 'src/app/services/auth.service';

@Component({
  selector: 'page-choosedid',
  templateUrl: 'choosedid.html',
  styleUrls: ['choosedid.scss']
})
export class ChooseDIDPage {
  public didStoreList: DIDStoreEntry[];
  private paramsSubscription: Subscription;
  private redirectOptions: ChooseIdentityOptions = null;

  constructor(private native: Native,
              public event: Events,
              private activatedRoute: ActivatedRoute,
              public zone: NgZone) {

    this.paramsSubscription = this.activatedRoute.queryParams.subscribe((options: ChooseIdentityOptions) => {
      this.redirectOptions = options;

      // Unsubscribe to not receive params again if coming back from other screens.
      this.paramsSubscription.unsubscribe();
    });
    
    this.init();
  }

  async init() {
    this.refreshStoreList();
  }

  async refreshStoreList() {
    this.didStoreList = await Config.didStoreManager.getDidStoreEntries();
  }

  async selectDidStore(didStoreEntry: DIDStoreEntry) {
    await Config.didStoreManager.activateDidStore(didStoreEntry.storeId);
    this.native.setRootRouter(this.redirectOptions.redirectPath);
  }
}

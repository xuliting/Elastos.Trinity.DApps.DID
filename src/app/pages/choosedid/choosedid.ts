import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { DIDEntry } from '../../model/didentry.model';
import { Subscription } from 'rxjs';
import { ChooseIdentityOptions } from 'src/app/services/auth.service';
import { DIDService } from 'src/app/services/did.service';

@Component({
  selector: 'page-choosedid',
  templateUrl: 'choosedid.html',
  styleUrls: ['choosedid.scss']
})
export class ChooseDIDPage {
  public didList: DIDEntry[];
  private paramsSubscription: Subscription;
  private redirectOptions: ChooseIdentityOptions = null;

  constructor(private native: Native,
              public event: Events,
              private activatedRoute: ActivatedRoute,
              private didService: DIDService,
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
    this.didList = await this.didService.getDidEntries();
  }

  async selectDid(didEntry: DIDEntry) {
    await this.didService.activateSavedDidStore();
    await this.didService.activateDid(this.didService.getActiveDidStore().getId(), didEntry.didString);
    this.native.setRootRouter(this.redirectOptions.redirectPath);
  }
}

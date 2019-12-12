import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { DrawerState } from 'ion-bottom-drawer';

import { UXService } from '../../services/ux.service';
import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { area } from '../../../assets/area/area';
import { CountryCodeInfo } from 'src/app/model/countrycodeinfo';

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  styleUrls: ['myprofile.scss']
})
export class MyProfilePage {
  public creatingIdentity: boolean = false;
  public bottomDrawerState: DrawerState = DrawerState.Bottom;
  public didString: String = "";
  public profile: Profile;

  public createDid = false;

  constructor(public event: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private appService: UXService,
              private native: Native) {
    this.route.queryParams.subscribe((data) => {
        if (data['create'] == 'true')
          this.createDid = true;
        else
          this.createDid = false;
    });
    this.init();
  }

  ngOnInit() {
    this.event.subscribe('did:didstorechanged', ()=> {
      this.zone.run(() => {
        this.init();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didstorechanged');
  }

  init() {
    this.profile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
    console.log("MyProfilePage is using this profile:", this.profile);
  }

  ionViewDidEnter() {
    this.didString = Config.didStoreManager.getActiveDidStore().getCurrentDid();
    if (this.didString != '') {
      this.appService.setIntentListener();
    }
    console.log("MyProfilePage ionViewDidEnter did: " + this.didString);
  }

  /**
   * Shows a pop-under with a large qr code and DID string.
   */
  async showQRCode() {
    this.bottomDrawerState = DrawerState.Docked;
  }

  hideBottomDrawer() {
    this.bottomDrawerState = DrawerState.Bottom;
  }

  copyDIDToClipboard() {
    this.native.copyClipboard(this.didString);
    this.native.toast_trans('copy-ok');
  }

  getDisplayableNation(countryAlpha3) {
    let countryInfo = area.find((a : CountryCodeInfo)=>{
      return countryAlpha3 == a.alpha3;
    })

    if (!countryInfo)
      return null;

    return countryInfo.name;
  }

  getDisplayableBirthDate(birthDate) {
    if (!birthDate)
      return null;
      
    let d = new Date(birthDate);
    return d.toLocaleDateString();
  }

  next() {
    this.native.go("/backupdid");
  }
}

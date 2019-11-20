import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { DrawerState } from 'ion-bottom-drawer';

import { Config } from '../../services/config';
import { Profile } from '../../services/profile.model';
import { Native } from '../../services/native';


@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  styleUrls: ['myprofile.scss']
})
export class MyProfilePage {
  public creatingIdentity: boolean = false;
  public bottomDrawerState: DrawerState = DrawerState.Bottom;
  public didString: String = "";
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

  public createDid = false;

  constructor(public event: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private native: Native) {
    this.route.queryParams.subscribe((data) => {
        if (data['create'] == 'true') this.createDid = true;
        else this.createDid = false;
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

  ionViewDidEnter() {
    this.didString = Config.didStoreManager.getcurDidId();
    console.log("MyProfilePage ionViewDidEnter did: " + this.didString);
  }

  init() {
    this.profile = Config.didStoreManager.getProfile();
    console.log("MyProfilePage :" + JSON.stringify(this.profile));
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

  next() {
    this.native.go("/backupdid");
  }
}

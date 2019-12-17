import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, ModalController } from '@ionic/angular';
import { DrawerState } from 'ion-bottom-drawer';

import { UXService } from '../../services/ux.service';
import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { area } from '../../../assets/area/area';
import { CountryCodeInfo } from 'src/app/model/countrycodeinfo';
import { TranslateService } from '@ngx-translate/core';
import { ShowQRCodeComponent } from 'src/app/components/showqrcode/showqrcode.component';
import { PopupProvider } from 'src/app/services/popup';

type ProfileDisplayEntry = {
  label: string,
  value: string,
  willingToBePubliclyVisible: boolean
}

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
  visibleData: ProfileDisplayEntry[];
  invisibleData: ProfileDisplayEntry[];
  public editingVisibility: boolean = false;

  public createDid = false;

  constructor(public event: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private popupProvider: PopupProvider,
              private translate: TranslateService,
              private appService: UXService,
              private modalCtrl: ModalController,
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

    this.buildDisplayEntries();
  }

  ionViewDidEnter() {
    this.didString = Config.didStoreManager.getActiveDidStore().getCurrentDid();
    if (this.didString != '') {
      this.appService.setIntentListener();
    }
    console.log("MyProfilePage ionViewDidEnter did: " + this.didString);
  }

  /**
   * Convenience conversion to display profile data on UI.
   */
  buildDisplayEntries() {
    let notSetTranslated = this.translate.instant("not-set");

    // Initialize
    this.visibleData = [];
    this.invisibleData = [];

    // Email
    this.pushDisplayEntry("email", {
      label: this.translate.instant("email"),
      value: this.profile.email || notSetTranslated
    });

    // Phone number
    this.pushDisplayEntry("phoneNumber", {
      label: this.translate.instant("phone-number"),
      value: this.profile.telephone || notSetTranslated
    });

    // Phone number
    this.pushDisplayEntry("country", {
      label: this.translate.instant("country"),
      value: this.getDisplayableNation(this.profile.nation) || notSetTranslated
    });

    // Phone number
    this.pushDisplayEntry("birthDate", {
      label: this.translate.instant("birth-date"),
      value: this.getDisplayableBirthDate(this.profile.birthDate) || notSetTranslated
    });
  }

  /**
   * Tells if a given profile key is currently visible on chain or not (inside the DID document or not).
   */
  profileEntryIsVisibleOnChain(profileKey) {
    return true; // TODO - check with DID Document data
  }

  pushDisplayEntry(profileKey, entry) {
    if (this.profileEntryIsVisibleOnChain(profileKey)) {
      entry.willingToBePubliclyVisible = true;
      this.visibleData.push(entry);
    }
    else {
      entry.willingToBePubliclyVisible = false;
      this.invisibleData.push(entry);
    }
  }

  /**
   * Shows a pop-under with a large qr code and DID string.
   */
  async showQRCode() {
    const modal = await this.modalCtrl.create({
      component: ShowQRCodeComponent,
      componentProps: {
        didString: this.didString
      },
      cssClass:"show-qr-code-modal"
    });
    modal.onDidDismiss().then((params) => {
    });
    modal.present();
  }

  /**
   * Toggle profile visibility edition mode.
   */
  editVisibility() {
    this.editingVisibility = !this.editingVisibility;
  }

  /**
   * Permanently delete the DID after user confirmation.
   */
  deleteDID() {
    this.popupProvider.ionicConfirm("Delete", "Delete DID?", "Yes", "NO").then(async (data) => {
      if (data) {
        let activeDidStore = Config.didStoreManager.getActiveDidStore();
        await Config.didStoreManager.deleteDidStore(activeDidStore);
      }
    });
  }

  /**
   * Publish an updated DID document locally and to the DID sidechain, according to user's choices
   * for each profile item (+ the DID itself).
   */
  publishVisibilityChanges() {
    // TODO
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

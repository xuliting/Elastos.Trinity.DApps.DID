import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, ModalController } from '@ionic/angular';

import { UXService } from '../../services/ux.service';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { TranslateService } from '@ngx-translate/core';
import { ShowQRCodeComponent } from 'src/app/components/showqrcode/showqrcode.component';
import { PopupProvider } from 'src/app/services/popup';
import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { DIDService } from 'src/app/services/did.service';

type ProfileDisplayEntry = {
  label: string,
  value: string,
  willingToBePubliclyVisible?: boolean
}

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  styleUrls: ['myprofile.scss']
})
export class MyProfilePage {
  public creatingIdentity: boolean = false;
  public didString: String = "";
  public profile: Profile;
  visibleData: ProfileDisplayEntry[];
  invisibleData: ProfileDisplayEntry[];
  public editingVisibility: boolean = false;

  public createDid: boolean = false;

  constructor(public event: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private advancedPopup: AdvancedPopupController,
              private popupProvider: PopupProvider,
              private translate: TranslateService,
              private didService: DIDService,
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
    this.event.subscribe('did:didchanged', ()=> {
      this.zone.run(() => {
        this.init();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didchanged');
  }

  init() {
    this.profile = this.didService.getActiveDid().getBasicProfile();
    console.log("MyProfilePage is using this profile:", this.profile);

    this.buildDisplayEntries();

  }

  ionViewDidLeave() {
    // Restore some UI state in case we just go refreshed
    this.editingVisibility = false;
  }

  ionViewDidEnter() {
    this.didString = this.didService.getActiveDid().getDIDString();
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

    let profileEntries = this.profile.entries;
    for (let entry of profileEntries) {
      this.pushDisplayEntry(entry.info.key, {
        label: this.translate.instant("credential-info-type-"+entry.info.key),
        value: entry.toDisplayString() || notSetTranslated
      });
    }
  }

  /**
   * Tells if a given profile key is currently visible on chain or not (inside the DID document or not).
   */
  profileEntryIsVisibleOnChain(profileKey: string) {
    return true; // TODO - check with DID Document data
  }

  pushDisplayEntry(profileKey: string, entry: ProfileDisplayEntry) {
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
   * Tells if gender in current profile is a male 
   */
  isMale() {
    let genderEntry = this.profile.getEntryByKey("gender");
    return (genderEntry.value == "" || genderEntry.value == "male")
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

  editProfile() {
    this.editingVisibility = false;
    this.native.go("/editprofile", {create: false});
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
    this.editingVisibility = false;
    this.advancedPopup.create({
      color:'#FF4D4D',
      info: {
          picture: '/assets/images/Local_Data_Delete_Icon.svg',
          title: this.translate.instant("deletion-popup-warning"),
          content: this.translate.instant("deletion-popup-content")
      },
      prompt: {
          title: this.translate.instant("deletion-popup-confirm-question"),
          confirmAction: this.translate.instant("confirm"),
          cancelAction: this.translate.instant("go-back"),
          confirmCallback: async ()=>{
            console.log("Deletion confirmed by user");
            let activeDid = this.didService.getActiveDid();
            await this.didService.deleteDid(activeDid);
          }
      }
    }).show();
  }

  /**
   * Publish an updated DID document locally and to the DID sidechain, according to user's choices
   * for each profile item (+ the DID itself).
   */
  publishVisibilityChanges() {
    this.advancedPopup.create({
      color:'var(--ion-color-primary)',
      info: {
          picture: '/assets/images/Visibility_Icon.svg',
          title: this.translate.instant("publish-popup-title"),
          content: this.translate.instant("publish-popup-content")
      },
      prompt: {
          title: this.translate.instant("publish-popup-confirm-question"),
          confirmAction: this.translate.instant("confirm"),
          cancelAction: this.translate.instant("go-back"),
          confirmCallback: async ()=>{
            // TODO
          }
      }
    }).show();
  }

  next() {
    this.native.go("/backupdid");
  }
}

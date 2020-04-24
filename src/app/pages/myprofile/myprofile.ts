import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { ShowQRCodeComponent } from 'src/app/components/showqrcode/showqrcode.component';
import { Profile } from '../../model/profile.model';
import { DIDDocument } from 'src/app/model/diddocument.model';
import { DIDURL } from 'src/app/model/didurl.model';
import { DIDPublicationStatusEvent } from 'src/app/model/eventtypes.model';
import { DIDHelper } from '../../helpers/did.helper';
import { UXService } from '../../services/ux.service';
import { Native } from '../../services/native';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';
import { DIDSyncService } from 'src/app/services/didsync.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ProfileService } from 'src/app/services/profile.service';
import { OptionsComponent } from 'src/app/components/options/options.component';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

type ProfileDisplayEntry = {
  credentialId: string, // related credential id
  label: string,         // "title" to display
  value: string,         // value to display
  willingToBePubliclyVisible?: boolean    // Whether it's currently set to become published or not.
}

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  styleUrls: ['myprofile.scss']
})
export class MyProfilePage {

  public profile: Profile;

  public creatingIdentity: boolean = false;
  public didNeedsToBePublished: boolean = false;

  public detailsActive = true;
  public credsActive = false;
  public capsulesActive = false;

  constructor(
    public events: Events,
    public route:ActivatedRoute,
    public zone: NgZone,
    private advancedPopup: AdvancedPopupController,
    private authService: AuthService,
    private translate: TranslateService,
    private didService: DIDService,
    private didSyncService: DIDSyncService,
    private appService: UXService,
    private modalCtrl: ModalController,
    private native: Native,
    private popoverCtrl: PopoverController,
    public theme: ThemeService,
    public profileService: ProfileService
  ) {
    this.init();
  }

  ngOnInit() {
    this.events.subscribe('did:didchanged', ()=> {
      this.zone.run(() => {
        this.init();
      });
    });

    this.events.subscribe('did:publicationstatus', (status: DIDPublicationStatusEvent)=>{
      let activeDid = this.didService.getActiveDid();
      if (activeDid && activeDid == status.did)
        this.didNeedsToBePublished = status.shouldPublish;
    })

    this.events.subscribe('diddocument:changed', ()=>{
      // When the did document content changes, we rebuild our profile entries on screen.
      this.buildDisplayEntries();
    })
  }

  ngOnDestroy() {
    this.events.unsubscribe('did:didchanged');
    this.events.unsubscribe('did:publicationstatus');
    this.events.unsubscribe('diddocument:changed');
  }

  init() {
    if (this.didService.getActiveDid()) { // Happens when importing a new mnemonic over an existing one
      this.profile = this.didService.getActiveDid().getBasicProfile();
      console.log("MyProfilePage is using this profile:", this.profile);

      this.buildDisplayEntries();
    }
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('my-profile'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.HOME);
  }

  ionViewDidEnter() {
    this.profileService.didString = this.didService.getActiveDid().getDIDString();
    if (this.profileService.didString != '') {
      this.appService.setIntentListener();

      this.didNeedsToBePublished = this.didSyncService.didDocumentNeedsToBePublished(this.didService.getActiveDid());
    }
    console.log("MyProfilePage ionViewDidEnter did: " + this.profileService.didString);
  }

  changeList(list: string) {
    if(list === 'details') {
      this.detailsActive = true;
      this.credsActive = false;
      this.capsulesActive = false;
    }
    if(list === 'credentials') {
      this.detailsActive = false;
      this.credsActive = true;
      this.capsulesActive = false;
    }
    if(list === 'capsules') {
      this.detailsActive = false;
      this.credsActive = false;
      this.capsulesActive = true;
    }
  }

  /**
   * Convenience conversion to display profile data on UI.
   */
  buildDisplayEntries() {
    let notSetTranslated = this.translate.instant("not-set");

    // Initialize
    this.profileService.visibleData = [];
    this.profileService.invisibleData = [];

    let profileEntries = this.profile.entries;
    for (let entry of profileEntries) {
      this.pushDisplayEntry(entry.info.key, {
        credentialId: "#"+entry.info.key,
        label: this.translate.instant("credential-info-type-"+entry.info.key),
        value: entry.toDisplayString() || notSetTranslated
      });
    }
  }

  /**
   * Tells if a given profile key is currently visible on chain or not (inside the DID document or not).
   *
   * @param profileKey Credential key.
   */
  profileEntryIsVisibleOnChain(profileKey: string): boolean {
    let currentDidDocument = this.didService.getActiveDid().getDIDDocument();
    if (!currentDidDocument)
      return false;

    let credential = currentDidDocument.getCredentialById(new DIDURL("#"+profileKey));
    return credential != null;
  }

  pushDisplayEntry(profileKey: string, entry: ProfileDisplayEntry) {
    if (this.profileEntryIsVisibleOnChain(profileKey)) {
      entry.willingToBePubliclyVisible = true;
      this.profileService.visibleData.push(entry);
    }
    else {
      entry.willingToBePubliclyVisible = false;
      this.profileService.invisibleData.push(entry);
    }
  }

  /**
   * Shows a pop-under with a large qr code and DID string.
   */
  async showQRCode() {
    const modal = await this.modalCtrl.create({
      component: ShowQRCodeComponent,
      componentProps: {
        didString: this.profileService.didString
      },
      cssClass:"show-qr-code-modal"
    });
    modal.onDidDismiss().then((params) => {
    });
    modal.present();
  }

  /**
   * Change DIDStore password.
   */
  changePassword() {
    let newStorePassword = '';
    AuthService.instance.checkPasswordThenExecute(async ()=>{
        let oldPassword = AuthService.instance.getCurrentUserPassword();

        // set new password
        if (newStorePassword === '') {
            newStorePassword = await this.authService.promptNewPassword(true);
            if (newStorePassword === null) {
                return; // User cancel
            }
        }

        // change password
        await this.didService.getActiveDidStore().changePassword(oldPassword, newStorePassword).then(() => {
            this.native.toast_trans('changepassword-success');
        })
        .catch ((error) => {
            throw DIDHelper.reworkedDIDPluginException(error);
        });

        let useFingerprintAuthentication = await this.authService.fingerprintAuthenticationEnabled(this.didService.getCurDidStoreId());
        if (useFingerprintAuthentication) {
            await this.authService.deactivateFingerprintAuthentication(this.didService.getCurDidStoreId());
            await this.promptFingerprintActivation(newStorePassword);
        }
      }, ()=>{
        // Error - TODO feedback
      }, ()=>{
        // Password failed
      },
      true);
  }

  promptFingerprintActivation(password: string) {
    this.advancedPopup.create({
      color:'var(--ion-color-primary)',
      info: {
          picture: '/assets/images/Visibility_Icon.svg',
          title: this.translate.instant("activate-fingerprint-popup-title"),
          content: this.translate.instant("activate-fingerprint-popup-content")
      },
      prompt: {
          title: this.translate.instant("activate-fingerprint-popup-confirm-question"),
          confirmAction: this.translate.instant("activate-fingerprint-activate"),
          cancelAction: this.translate.instant("go-back"),
          confirmCallback: async ()=>{

            // User agreed to activate fingerprint authentication. We ask the auth service to
            // save the typed password securely using the fingerprint.
            let couldActivate = await this.authService.activateFingerprintAuthentication(this.didService.getCurDidStoreId(), password);
            if (couldActivate) {

              // Right after activation, submit the typed password as password to use.
            }
            else {
              // Failed to activate
            }
          },
        }
    }).show();
  }

  /**
   * Publish an updated DID document locally and to the DID sidechain, according to user's choices
   * for each profile item (+ the DID itself).
   */
  publishVisibilityChanges() {
    this.profileService.showWarning('publish');
  }

  async showOptions(ev: any, options: string) {
    console.log('Opening profile options');

    const popover = await this.popoverCtrl.create({
      mode: 'ios',
      component: OptionsComponent,
      cssClass: !this.theme.darkMode ? 'options' : 'darkOptions',
      componentProps: {
        options: options
      },
      event: ev,
      translucent: false
    });
    return await popover.present();
  }
}

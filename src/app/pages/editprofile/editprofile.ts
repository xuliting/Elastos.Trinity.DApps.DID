import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events, NavController, IonInput, ModalController } from '@ionic/angular';

import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';
import { WrongPasswordException } from 'src/app/model/exceptions/wrongpasswordexception.exception';
import { PopupProvider } from 'src/app/services/popup';
import { CountryCodeInfo } from 'src/app/model/countrycodeinfo';
import { area } from '../../../assets/area/area';
import { ProfileEntryPickerPage } from '../profileentrypicker/profileentrypicker';
import { BasicCredentialInfo, BasicCredentialInfoType } from 'src/app/model/basiccredentialinfo.model';
import { BasicCredentialEntry } from 'src/app/model/basiccredentialentry.model';
import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { TranslateService } from '@ngx-translate/core';
import { DIDSyncService } from 'src/app/services/didsync.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public isEdit: boolean = false;
  public profile: Profile;

  constructor(public router: Router,
              public zone: NgZone,
              public events: Events,
              public navCtrl: NavController,
              private didService: DIDService,
              private authService: AuthService,
              private modalCtrl: ModalController,
              private advancedPopup: AdvancedPopupController,
              private popupProvider: PopupProvider,
              private translate: TranslateService,
              private didSyncService: DIDSyncService,
              private native: Native) {
    console.log("Entering EditProfile page");
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state) && (navigation.extras.state['create'] == false)) {
        console.log("Editing an existing profile");

        // Edition - We clone the received profile in case user wants to cancel editing.
        this.profile = Profile.fromProfile(this.didService.getActiveDid().getBasicProfile());
        this.isEdit = true;
    }
    else {
        console.log("Editing a new profile");

        // Creation
        this.profile = Profile.createDefaultProfile();
    }
  }

  ionViewWillEnter() {
    // titleBarManager.setTitle(this.translate.instant('edit-profile'));
    titleBarManager.setTitle(this.translate.instant('my-profile'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);
  }

  entryIsText(entry: BasicCredentialEntry): boolean {
    return entry.info.type == BasicCredentialInfoType.TEXT;
  }

  entryIsEmail(entry: BasicCredentialEntry): boolean {
    return entry.info.type == BasicCredentialInfoType.EMAIL;
  }

  entryIsPhoneNumber(entry: BasicCredentialEntry): boolean {
    return entry.info.type == BasicCredentialInfoType.PHONE_NUMBER;
  }

  entryIsCountry(entry: BasicCredentialEntry): boolean {
    return entry.info.type == BasicCredentialInfoType.EMAIL;
  }

  selectCountry(countryEntry: BasicCredentialEntry) {
    this.events.subscribe('selectarea', (params: CountryCodeInfo) => {
      this.zone.run(() => {
        countryEntry.value = params.alpha3;
      });
      this.events.unsubscribe('selectarea');
    });
    this.native.go('/countrypicker');
  }

  getDisplayableNation(countryAlpha3) {
    let countryInfo = area.find((a : CountryCodeInfo)=>{
      return countryAlpha3 == a.alpha3;
    })

    if (!countryInfo)
      return null;

    return countryInfo.name;
  }

  /**
   * Move text input focus to the given item
   */
  // TODO - REWORK
  maybeMoveFocus(element: IonInput, event: KeyboardEvent) {
    if (event.keyCode == 13) {  // Return
      element.setFocus();
    }
  }

  // TODO - REWORK
  maybeClearFocus(element: IonInput, event: KeyboardEvent) {
    if (event.keyCode == 13) {  // Return
      element.getInputElement().then((el: HTMLInputElement)=>{
        el.blur();
      });
    }
  }

  async next() {
    if(this.checkParms()){
      if (this.isEdit) { // If edition mode, go back to my profile after editing.
        let localDidDocumentHasChanged = false;
        await this.authService.checkPasswordThenExecute(async ()=>{
          // We are editing an existing DID: just ask the DID to save its profile.
          // DID being created are NOT saved here.
          await this.native.showLoading('loading-msg');
          localDidDocumentHasChanged = await this.didService.getActiveDid().writeProfile(this.profile, AuthService.instance.getCurrentUserPassword())

          this.native.hideLoading();
        }, ()=>{
          this.popupProvider.ionicAlert("DID error", "Sorry, we are unable to save your profile.");
        }, ()=>{
          // Password failed - Hide loading popup while inputting password again.
          this.native.hideLoading();
        });

        // Tell others that DID needs to be refreshed (profile info has changed)
        this.events.publish('did:didchanged');

        if (localDidDocumentHasChanged) {
          // DID Document was modified: ask user if he wants to publish his new did document version now or not.
          this.events.publish('diddocument:changed');
          this.promptPublishDIDDocument();
        }
        else {
          // Exit the screen.
          this.navCtrl.pop();
        }
      }
      else { // If creation mode, go to backup did flow if needed.
        this.didService.didBeingCreated.profile = this.profile; // Save filled profile for later.

        if (!await this.didService.getActiveDidStore().hasPrivateIdentity())
          this.native.go("/backupdid", {create: true});
        else {
          await this.authService.checkPasswordThenExecute(async ()=>{
            this.didService.didBeingCreated.password = this.authService.getCurrentUserPassword();
            await this.native.showLoading('loading-msg');

            // Creation mode but no need to create a did store
            await this.didService.finalizeDidCreation(this.authService.getCurrentUserPassword());

            this.native.hideLoading();
            this.native.go("/home/myprofile");
          }, ()=>{
            this.popupProvider.ionicAlert("DID creation error", "Sorry, we are unable to create your DID.");
          }, ()=>{
            // Password failed - Hide loading popup while inputting password again.
            this.native.hideLoading();
          });
        }
      }
    }
  }

  private promptPublishDIDDocument() {
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
            await this.publishDIDDocumentReal();
            // Exit the screen.
            this.navCtrl.pop();
          },
          cancelCallback: async ()=>{
            // Exit the screen.
            this.navCtrl.pop();
          }
      }
    }).show();
  }

  private async publishDIDDocumentReal() {
    let password = AuthService.instance.getCurrentUserPassword();
    await this.didSyncService.publishActiveDIDDIDDocument(password);
  }

  checkParms(){
    let nameEntry = this.profile.getEntryByKey("name");
    if(!nameEntry || nameEntry.value == ""){
      this.native.toast_trans('name-is-missing');
      return false;
    }
    return true;
  }

  // Show the profile entry field picker to let user pick a profile entry to create.
  async addProfileEntry() {
    let existingProfileItems: string[] = []; // List of credential keys - items already in the profi:e to filter out
    this.profile.entries.map((e)=>{
      existingProfileItems.push(e.info.key);
    });

    console.log("Filtered items for add profile: ", existingProfileItems);

    let modal = await this.modalCtrl.create({
        component: ProfileEntryPickerPage,
        componentProps: {
          filterOut: existingProfileItems
        }
    })

    modal.onDidDismiss().then((params) => {
      if (params && params.data && params.data.pickedItem) {
        let pickedItem: BasicCredentialInfo = params.data.pickedItem;

        // Add the new entry to the current profile
        // Default value is an empty string
        this.profile.setValue(pickedItem, "");
      }
    });

    modal.present();
  }

  /**
   * Removes an entry from the currently edited profile.
   */
  deleteProfileEntry(entry: BasicCredentialEntry, event: MouseEvent) {
    event.stopImmediatePropagation();

    this.profile.deleteEntry(entry);
  }
}

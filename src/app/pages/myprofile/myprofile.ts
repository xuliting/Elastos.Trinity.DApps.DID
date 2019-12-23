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
import { AuthService } from 'src/app/services/auth.service';
import { DIDSyncService } from 'src/app/services/didsync.service';
import { DIDPublicationStatusEvent } from 'src/app/model/eventtypes.model';
import { DIDDocument } from 'src/app/model/diddocument.model';
import { currentId } from 'async_hooks';

type ProfileDisplayEntry = {
  credentialKey: string, // related credential key name
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
  public creatingIdentity: boolean = false;
  public didString: String = "";
  public profile: Profile;
  visibleData: ProfileDisplayEntry[];
  invisibleData: ProfileDisplayEntry[];
  public editingVisibility: boolean = false;
  public didNeedsToBePublished: boolean = false;

  constructor(public events: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private advancedPopup: AdvancedPopupController,
              private popupProvider: PopupProvider,
              private translate: TranslateService,
              private didService: DIDService,
              private didSyncService: DIDSyncService,
              private appService: UXService,
              private modalCtrl: ModalController,
              private native: Native) {
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

      this.didNeedsToBePublished = this.didSyncService.didDocumentNeedsToBePublished(this.didService.getActiveDid());
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
        credentialKey: entry.info.key,
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
      
    let credential = currentDidDocument.getCredentialByKey(profileKey);
    return credential != null;
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
   * This action can be raised at any time by the user in case his local did document is not in sync
   * with the one on the did sidechain. That will publish the document on chain with latest changes.
   */
  publishDIDDocument() {
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
            this.publishDIDDocumentReal();
          }
      }
    }).show();
  }

  /**
   * Publish an updated DID document locally and to the DID sidechain, according to user's choices
   * for each profile item (+ the DID itself).
   */
  publishVisibilityChanges() {
    this.publishDIDDocument();
  }

  private publishDIDDocumentReal() {
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      let password = AuthService.instance.getCurrentUserPassword();

      await this.updateDIDDocumentFromSelection(password);
      await this.didSyncService.publishActiveDIDDIDDocument(password);
    }, ()=>{
      // Error - TODO feedback
    }, ()=>{
      // Password failed
    });
  }

  // TODO: edit did doc from editprofile changes

  /**
   * Checks visibility status for each profile item and update the DID document accordingly
   * (add / remove items).
   */
  private async updateDIDDocumentFromSelection(password: string) {
    let changeCount = 0;
    let currentDidDocument = this.didService.getActiveDid().getDIDDocument();
    
    for (let displayEntry of this.visibleData) {
      await this.updateDIDDocumentFromSelectionEntry(currentDidDocument, displayEntry, password);
      changeCount++;
    }

    for (let displayEntry of this.invisibleData) {
      await this.updateDIDDocumentFromSelectionEntry(currentDidDocument, displayEntry, password);
      changeCount++;
    }

    // Tell everyone that the DID document has some modifications.
    if (changeCount > 0) {
      this.events.publish("diddocument:changed");
    }
  }

  private async updateDIDDocumentFromSelectionEntry(currentDidDocument: DIDDocument, displayEntry: ProfileDisplayEntry, password: string) {
    let relatedCredential = this.didService.getActiveDid().getCredentialByKey(displayEntry.credentialKey);

    let existingCredential = await currentDidDocument.getCredentialByKey(relatedCredential.getFragment());
    if (!existingCredential && displayEntry.willingToBePubliclyVisible) {
      // Credential doesn't exist in the did document yet but user wants to add it? Then add it.
      await currentDidDocument.addCredential(relatedCredential, password);
    }
    else if (existingCredential && !displayEntry.willingToBePubliclyVisible) {
      // Credential exists but user wants to remove it from chain? Then delete it from the did document
      await currentDidDocument.deleteCredential(relatedCredential, password);
    }
  }
}

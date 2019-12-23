import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';

import { Config } from '../../../services/config';
import { DIDService } from '../../../services/did.service';
import { Native } from '../../../services/native';
import { PopupProvider } from '../../../services/popup';
import { Profile } from 'src/app/model/profile.model';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { AuthService } from 'src/app/services/auth.service';
import { DIDSyncService } from 'src/app/services/didsync.service';
import { DIDDocument } from 'src/app/model/diddocument.model';

type CredentialDisplayEntry = {
  credential: DIDPlugin.VerifiableCredential,
  willingToBePubliclyVisible: boolean,
  willingToDelete: boolean
}

@Component({
  selector: 'page-credentiallist',
  templateUrl: 'credentiallist.html',
  styleUrls: ['credentiallist.scss']
})
export class CredentialListPage {
  didString: DIDPlugin.DIDString = "";
  public credentials: DIDPlugin.VerifiableCredential[];
  public hasCredential: boolean = false;
  public profile: Profile = null;
  visibleData: CredentialDisplayEntry[];
  invisibleData: CredentialDisplayEntry[];
  public editingVisibility: boolean = false;
  public deletionMode: boolean = false;

  constructor(public event: Events, public route:ActivatedRoute, public zone: NgZone,
      private didService: DIDService,
      private translate: TranslateService,
      private didSyncService: DIDSyncService,
      private events: Events,
      private advancedPopup: AdvancedPopupController,
      private native: Native, private popupProvider: PopupProvider) {
    this.init();
  }

  ngOnInit() {
    this.event.subscribe('did:credentialadded', ()=> {
      this.zone.run(() => {
        this.init();
      });
    });

    this.event.subscribe('did:didchanged', ()=> {
      this.zone.run(() => {
        this.init();
      });
    });

    this.events.subscribe('diddocument:changed', ()=>{
      // When the did document content changes, we rebuild our credentials entries on screen.
      this.buildDisplayEntries();
    });
  }

  ngOnDestroy() {
    console.log("ON DESTROY")
    this.event.unsubscribe('did:credentialadded');
    this.event.unsubscribe('did:didchanged');
    this.event.unsubscribe('diddocument:changed');
  }

  init() {
    if (!this.didService.getActiveDid()) // Could happen when creating a DID while already in another DID
      return;

    this.profile = this.didService.getActiveDid().getBasicProfile();
    this.didString = this.didService.getActiveDid().getDIDString();
    this.credentials = this.didService.getActiveDid().credentials;
    this.hasCredential = this.credentials.length > 0 ? true : false;

    // Sort credentials by title
    this.credentials.sort((c1, c2)=>{
      if (c1.getFragment() > c2.getFragment())
        return 1;
      else 
        return -1;
    });

    this.buildDisplayEntries();
  }

  ionViewDidLeave() {
    // Restore some UI state in case we just go refreshed
    this.editingVisibility = false;
    this.deletionMode = false;
  }

  /**
   * Convenience conversion to display credential data on UI.
   */
  buildDisplayEntries() {
    // Initialize
    this.visibleData = [];
    this.invisibleData = [];

    for(let c of this.credentials) {
      if (this.credentialIsVisibleOnChain(c)) {
        this.visibleData.push({
          credential: c,
          willingToBePubliclyVisible: true,
          willingToDelete: false
        })
      }
      else {
        this.invisibleData.push({
          credential: c,
          willingToBePubliclyVisible: false,
          willingToDelete: false
        }) 
      }
    }
  }

  /**
   * Tells if a given credential is currently visible on chain or not (inside the DID document or not).
   */
  credentialIsVisibleOnChain(credential: DIDPlugin.VerifiableCredential) {
    let currentDidDocument = this.didService.getActiveDid().getDIDDocument();
    if (!currentDidDocument)
      return false;
      
    let didDocumentCredential = currentDidDocument.getCredentialByKey(credential.getFragment());
    return didDocumentCredential != null;
  }

  /**
   * Toggle credential visibility edition mode.
   */
  toggleVisibilityMode() {
    this.deletionMode = false;
    this.editingVisibility = !this.editingVisibility;
  }

  toggleDeleteMode() {
    this.editingVisibility = false;
    this.deletionMode = !this.deletionMode;
  }

  createCredential() {
    this.native.go('/credentialcreate');
  }

  backupCredential(credential) {
    this.didService.credentialToJSON(credential).then( (ret)=> {
      this.native.go('/credentialbackup', {content: ret});
    })
  }

  getDisplayableCredentialTitle(entry: CredentialDisplayEntry): string {
    let fragment = entry.credential.getFragment();
    let translated = this.translate.instant("credential-info-type-"+fragment);
   
    if (!translated || translated == "")
      return fragment;

    return translated;
  }

  getSelectedCount() {
    let count = 0;
    for (let i = 0; i < this.credentials.length; i++) {
      /*if (this.credentials[i].isChecked === true) {
        count++;
      }*/
    }
    return count;
  }

  deleteCredential() {
    let selectedCount = this.getSelectedCount();
    if (selectedCount == 0) {
      //TODO
      return;
    }

    this.popupProvider.ionicConfirm("Delete", "Delete Credential?", "Yes", "NO").then((data) => {
      if (data) {
          this.credentials.forEach((credential,index,array)=>{
          /*if (credential.isChecked === true) {
            this.didService.deleteCredential(this.didString, credential['didurl']).then( (ret)=> {
              this.credentials.splice(index, 1);
              this.hasCredential = this.credentials.length > 0 ? true : false;
              if (!this.hasCredential) this.isEdit = false;
            })
          }*/
        });
      }
    });
  }

  /**
   * User friendly string that shows who issued a credential in the list.
   */
  getDisplayableIssuer(credential: DIDPlugin.VerifiableCredential) {
    let issuer = credential.getIssuer();
    if (issuer == this.didService.getActiveDid().getDIDString())
      return this.translate.instant("issuer-myself");
    else
      return issuer;
  }

  displayableProperties(credential: DIDPlugin.VerifiableCredential) {
    let subject = credential.getSubject();
    return Object.keys(subject).filter(key=>key!="id").sort().map((prop)=>{
      return {
        name: prop,
        value: (subject[prop] != "" ? subject[prop] : this.translate.instant("not-set"))
      }
    });
  }

  /**
   * Tells if gender in current profile is a male 
   */
  isMale() {
    let genderEntry = this.profile.getEntryByKey("gender");
    return (genderEntry.value == "" || genderEntry.value == "male")
  }

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
            this.publishDIDDocumentReal();
          }
      }
    }).show();
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

  /**
   * Checks visibility status for each credential and update the DID document accordingly
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

  private async updateDIDDocumentFromSelectionEntry(currentDidDocument: DIDDocument, displayEntry: CredentialDisplayEntry, password: string) {
    if (!displayEntry.credential)
      return;

    let relatedCredential = this.didService.getActiveDid().getCredentialByKey(displayEntry.credential.getFragment());

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

  deleteSelectedCredentials() {
    // TODO: Confirmation popup (advanced popup)
    // + publish DID document on sidechain
    // + delete locally

    /*
    flow:
    - conf popup
    - if at least one of the credentials is in the did document:
    -   delete the credential from local storage
    -   remove credential(s) from the diddocument locally
    -   ask user if he wants to publish his did document changes (use a service that compares the local did document with remote one)
    */
  }
}

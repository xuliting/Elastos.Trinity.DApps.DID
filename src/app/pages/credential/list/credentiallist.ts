import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';

import { Config } from '../../../services/config';
import { DIDService } from '../../../services/did.service';
import { Native } from '../../../services/native';
import { PopupProvider } from '../../../services/popup';

@Component({
  selector: 'page-credentiallist',
  templateUrl: 'credentiallist.html',
  styleUrls: ['credentiallist.scss']
})
export class CredentialListPage {
  didString: DIDPlugin.DIDString = "";
  public credentials: any = {};
  public hasCredential: boolean = false;
  public isEdit = false;

  constructor(public event: Events, public route:ActivatedRoute, public zone: NgZone,
      private didService: DIDService,
      private native: Native, private popupProvider: PopupProvider) {
    this.init();
  }

  ngOnInit() {
    this.event.subscribe('did:credentialadded', ()=> {
      this.zone.run(() => {
        this.credentials = Config.didStoreManager.getActiveDidStore().credentials;
        this.hasCredential = this.credentials.length > 0 ? true : false;
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:credentialadded');
  }

  init() {
    this.didString = Config.didStoreManager.getActiveDidStore().getCurrentDid();
    this.credentials = Config.didStoreManager.getActiveDidStore().credentials;
    this.hasCredential = this.credentials.length > 0 ? true : false;
  }

  createCredential() {
    this.native.go('/credentialcreate');
  }

  backupCredential(credential) {
    if (this.isEdit) return;

    this.didService.credentialToJSON(credential).then( (ret)=> {
      this.native.go('/credentialbackup', {content: ret});
    })
  }

  getSelectedCount() {
    let count = 0;
    for (let i = 0; i < this.credentials.length; i++) {
      if (this.credentials[i].isChecked === true) {
        count++;
      }
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
          if (credential.isChecked === true) {
            this.didService.deleteCredential(this.didString, credential['didurl']).then( (ret)=> {
              this.credentials.splice(index, 1);
              this.hasCredential = this.credentials.length > 0 ? true : false;
              if (!this.hasCredential) this.isEdit = false;
            })
          }
        });
      }
    });
  }

  editCredential() {
    this.isEdit = true;
  }

  CanDeactivate() {
    if (this.isEdit) {
      this.isEdit = false;
      return false;
    }
    else {
      return true;
    }
  }
}

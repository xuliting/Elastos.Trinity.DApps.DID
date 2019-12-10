import { Component } from '@angular/core';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { Config } from 'src/app/services/config';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-backupdid',
  templateUrl: 'backupdid.html',
  styleUrls: ['backupdid.scss']
})
export class BackupDIDPage {
  public mnemonicList: string[] = [];
  private paramsSubscription: Subscription;
  public isCreation = false;

  constructor(private native: Native, private didService: DIDService, public route: ActivatedRoute) {
    this.paramsSubscription = this.route.queryParams.subscribe((data) => {
      console.log("Entering EditProfile page");

      if (data['create'] == 'false') {
        console.log("Saving an existing DID");

        this.isCreation = false;

        // TODO
      }
      else {
        console.log("Saving mnemonics for the first time");

        // Creation
        this.isCreation = true;
        this.generateMnemonic();
      }

      // Unsubscribe to not receive params again if coming back from other screens.
      this.paramsSubscription.unsubscribe();
    });
  }

  generateMnemonic() {
    this.didService.generateMnemonic(this.native.getMnemonicLang()).then((ret) => {
        Config.didBeingCreated.mnemonic = ret;
        this.mnemonicList = Config.didBeingCreated.mnemonic.split(/[\u3000\s]+/).map((word)=>{
          return word;
        });
    });
  }

  nextClicked() {
    if (this.isCreation) {
      // Next button pressed: go to mnemonic verification screen.
      this.native.go("/verifymnemonics", { mnemonicStr: Config.didBeingCreated.mnemonic});
    }
    else {
      // TODO
    }
  }
}

import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, IonInput } from '@ionic/angular';

import { DIDService } from '../../services/did.service';

@Component({
  selector: 'page-importdid',
  templateUrl: 'importdid.html',
  styleUrls: ['importdid.scss']
})
export class ImportDIDPage {  
  private mnemonicWord: string = "";
  private mnemonicWords = new Array<String>()

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(public navCtrl: NavController, private didService: DIDService) {
  }

  async appendMnemonicWord() {
    // TODO: make sure that the typed word contains no space, not empty, etc.

    this.mnemonicWords.push(this.mnemonicWord);
    this.mnemonicWord = "";
    console.log(this.mnemonicWords)

    let input = await this.addMnemonicWordInput.getInputElement();
    input.focus();
  }
}

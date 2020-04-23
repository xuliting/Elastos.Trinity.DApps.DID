import { Injectable } from '@angular/core';
import { Native } from './native';
import { PopoverController } from '@ionic/angular';
import { DeleteComponent } from '../components/delete/delete.component';
import { DIDService } from './did.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public editingVisibility: boolean = false;

  constructor(
    private popover: PopoverController,
    private native: Native,
    private popoverCtrl: PopoverController,
    private didService: DIDService
  ) { }

  editProfile() {
    this.editingVisibility = false;
    this.popover.dismiss();
    this.native.go("/editprofile", { create: false });
  }

  editVisibility() {
    this.editingVisibility = !this.editingVisibility;
  }

  async deleteDID() {
    console.log('Opening delete warning');

    const popover = await this.popoverCtrl.create({
      mode: 'ios',
      cssClass: 'delete',
      component: DeleteComponent,
      translucent: false
    });
    return await popover.present();
  }

  async confirmDeleteDID() {
    console.log('Confirming DID deletion');
    let activeDid = this.didService.getActiveDid();
    await this.didService.deleteDid(activeDid);
  }
}

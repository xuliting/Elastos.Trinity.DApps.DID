import { Component } from '@angular/core';

import { Native } from '../../services/native';

@Component({
  selector: 'page-noidentity',
  templateUrl: 'noidentity.html',
  styleUrls: ['noidentity.scss']
})
export class NoIdentityPage {
  constructor(private native: Native) {
  }

  createIdentity() {
    this.native.go('/setpassword');
  }

  importIdentity() {
    this.native.go("/importdid");
  }
}

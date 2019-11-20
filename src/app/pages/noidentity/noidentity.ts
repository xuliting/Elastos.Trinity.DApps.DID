import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
  selector: 'page-noidentity',
  templateUrl: 'noidentity.html',
  styleUrls: ['noidentity.scss']
})
export class NoIdentityPage {
  public isfirst: boolean = true;

  constructor(public route:ActivatedRoute, private native: Native) {
    this.route.queryParams.subscribe((data) => {
        if (!Util.isEmptyObject(data)) this.isfirst = false;
    });
  }

  createIdentity() {
    this.native.go('/setpassword');
  }

  importIdentity() {
    this.native.go("/importdid");
  }
}

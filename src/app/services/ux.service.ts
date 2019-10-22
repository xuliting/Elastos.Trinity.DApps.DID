import { Injectable } from '@angular/core';

declare let appService: any;

@Injectable({
  providedIn: 'root'
})
export class UXService {
    constructor() {}

    /**
     * Close this application.
     */
    close() {
      appService.close("org.elastos.trinity.dapp.did");
    }

    minimize() {
      appService.launcher();
    }
}

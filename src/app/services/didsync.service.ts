import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController, Events } from '@ionic/angular';

import { SimulatedDID, SimulatedDIDStore, BrowserSimulation, SimulatedCredential } from './browsersimulation';
import { resolve } from 'path';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from './localstorage';
import { PopupProvider } from './popup';
import { Native } from './native';
import { DIDStore } from '../model/didstore.model';
import { Config } from './config';
import { DIDEntry } from '../model/didentry.model';
import { DID } from '../model/did.model';
import { NewDID } from '../model/newdid.model';
import { BasicCredentialInfo, BasicCredentialInfoType } from '../model/basiccredentialinfo.model';
import { DIDDocumentPublishEvent, DIDPublicationStatusEvent } from '../model/eventtypes.model';
import { DIDService } from './did.service';

declare let didManager: DIDPlugin.DIDManager;
declare let appManager: AppManagerPlugin.AppManager;

const RESOLVER_DID_STORE_ID = "ABCEDF";

@Injectable({
    providedIn: 'root'
})
export class DIDSyncService {
    public static instance: DIDSyncService = null;

    // Latest know status for each did, about whether it needs to be published or not (fresh changes not yet on chain)
    private needToPublishStatuses: Map<DID, boolean> = new Map();
    // DIDStore used to cache resolved DIDs, not to store any private user data. All data inside is PUBLIC.
    private resolverDIDStore: DIDStore;

    constructor(
        private platform: Platform,
        public zone: NgZone,
        private translate: TranslateService,
        public toastCtrl: ToastController,
        public events: Events,
        public localStorage: LocalStorage,
        private didService: DIDService,
        public native: Native) {
            /* TMP console.log("DIDSyncService created");
            DIDSyncService.instance = this;

            this.initResolverDIDStore();
            this.subscribeEvents(); */
    }

    private async initResolverDIDStore() {
      this.resolverDIDStore = await DIDStore.loadFromDidStoreId(RESOLVER_DID_STORE_ID, this.events);
      if (!this.resolverDIDStore) {
        // No did store loaded? So we have to create one.
        this.resolverDIDStore = new DIDStore(this.events);
        await this.resolverDIDStore.initNewDidStore(RESOLVER_DID_STORE_ID);
      }
    }

    private subscribeEvents() {
      this.events.subscribe("diddocument:publishresult", (result: DIDDocumentPublishEvent)=>{
        console.log("diddocument:publishresult event received", result);
        this.onDIDDocumentPublishResponse(result);
      });

      this.events.subscribe("did:didchanged", (data: any)=>{
        // Every time a DID has changed we check its publish status
        let did = this.didService.getActiveDid();
        if (did)
          this.checkIfDIDDocumentNeedsToBePublished(did);
      });
    }

    /**
     * Ask the wallet application to publish the currently active DID document for us, on the DID
     * sidechain.
     */
    public async publishActiveDIDDIDDocument(password: string) {
      // Send the publish request but don't wait here. We will receive an event later.
      this.didService.getActiveDidStore().getActiveDid().getDIDDocument().publish(password);
    }

    private onDIDDocumentPublishResponse(result: DIDDocumentPublishEvent) {
      if (result.published) {
        console.log("PUBLISHED !")
      }
      else if (result.cancelled) {
        console.log("CANCELLED");
      }
      else if (result.error) {
        console.error("ERROR")
      }

      // TODO: user feedback + update UI status (no need to sync any more)
    }

    /**
     * Checks if the active did's DID document needs to be uploaded to the sidechain.
     * This mostly happens when some changes have been made but user hasn't published them yet.
     * 
     * NOTE: this method can reply quickly if checks can be done locally, but can also take networking
     * time when resolving is required.
     */
    public async checkIfDIDDocumentNeedsToBePublished(did: DID) {
      return; // TMP

      
      // NOTE: CAUTION IN CASE OF DID CHANGE WHILE FETCHING ANOTHER DID, IF YOU MODIFY THIS CODE!
      let didString = did.getDIDString();

      if (!this.resolverDIDStore) {
        console.log("No resolver DID store created yet - skip the check this time");
        return;
      }

      // Check locally resolved DIDDocument modification date. 
      let locallyResolvedDIDDocument = await this.resolverDIDStore.loadDidDocument(didString);
      if (!locallyResolvedDIDDocument) {
        // No document yet? So we try to resolve it first.
        locallyResolvedDIDDocument = await this.resolverDIDStore.resolveDidDocument(didString);
        if (!locallyResolvedDIDDocument) {
          // Still null? This means we could either not resolve (network error) or there is no published document
          // yet. If not published: need to publish. If network error: no need to publish for now until we retry.

          // TODO: FIND A WAY TO KNOW IF THE RESOLVING COULD REALLY BE COMPLETED WITH NO RESULT
          // FOR NOW: ASSUME IT HAS COMPLETED WITHOUT NETWORK ERROR BECAUSE THE JAVA PLUGIN DOES NOT GIVE US
          // A WAY TO KNOW THIS. WAITING FOR IMPROVEMENTS. BUT THIS IS NOT GOOD BECAUSE A FAILING API CALL
          // WOULD MAKE US TELL USERS THAT THEY MUST PUBLISH THEIR DOCUMENT, WHICH IS MAYBE FALSE.

          console.log("DID "+did.getDIDString()+" needs to be published (no did document on chain)");
          this.setPublicationStatus(did, true);
          return;
        }
      }

      // Compare modification dates
      if (did.getDIDDocument().pluginDidDocument.getUpdated() > locallyResolvedDIDDocument.pluginDidDocument.getUpdated()) {
        // User document is more recent than chain document. Need to publish.
        console.log("DID "+did.getDIDString()+" needs to be published (more recent than the on chain one).");
        this.setPublicationStatus(did, true);
        return;
      }
      else {
        // User document has not been modified recently. Nothing to do.
        console.log("DID "+did.getDIDString()+" doesn't need to be published.");
        this.needToPublishStatuses.set(did, false);
        this.setPublicationStatus(did, false);
        return;
      }
    }

    private setPublicationStatus(did: DID, shouldPublish: boolean) {
      this.needToPublishStatuses.set(did, shouldPublish);
      
      let event: DIDPublicationStatusEvent = {
        did: did,
        shouldPublish: shouldPublish
      };
      this.events.publish("did:publicationstatus", event);
    }

    /**
     * Synchronous call that returns the latest status about DID document's publication requirement.
     * This status has been fetched asynchronously by checkIfDIDDocumentNeedsToBePublished().
     */
    public didDocumentNeedsToBePublished(did: DID): boolean {
      return this.needToPublishStatuses.get(did);
    }

    /**
     * When a change in the DID Document is done in the app, we can force-set the "needs publish" value.
     */
    public setDidDocumentNeedsToBePublished(did: DID) {
      this.needToPublishStatuses.set(did, true);
    }
}

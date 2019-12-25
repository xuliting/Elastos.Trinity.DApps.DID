import { Events } from '@ionic/angular';
import { Profile } from './profile.model';
import { WrongPasswordException } from './exceptions/wrongpasswordexception.exception';
import { BrowserSimulation, SimulatedDID, SimulatedCredential } from '../services/browsersimulation';
import { BasicCredentialsService } from '../services/basiccredentials.service';
import { DIDDocument } from './diddocument.model';
import { DIDURL } from './didurl.model';

export class DID {
    public credentials: DIDPlugin.VerifiableCredential[] = [];
    private didDocument: DIDDocument;

    constructor(public pluginDid: DIDPlugin.DID, private events: Events) {
    }

    public async loadAll() {
        await this.loadAllCredentials();
    }

    public getDIDString() {
        return this.pluginDid.getDIDString();
    }

    /**
     * Gets the list of unloaded credentials then load them one by one.
     * After this call, all credentials related to the active DID of this DID store are loaded
     * in memory.
     */
    async loadAllCredentials() {
        console.log("Loading credentials for DID", this);

        this.credentials = await this.loadPluginCredentials();
        console.log("Current credentials list: ", this.credentials);
    }

    private loadPluginCredentials(): Promise<DIDPlugin.VerifiableCredential[]> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let fakeDID = new SimulatedDID()
                fakeDID.loadCredentials((credentials)=>{
                    resolve(credentials);
                })
            });
        }

        return new Promise(async (resolve, reject)=>{
            this.pluginDid.loadCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    /**
     */
    async addCredential(credentialId: DIDURL, props: any, password: string, userTypes?: String[]): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise(async (resolve, reject)=>{
            console.log("Adding credential with id:", credentialId, props, userTypes);

            let types: String[] = [
                "SelfProclaimedCredential"
            ];
            // types[0] = "BasicProfileCredential";

            // If caller provides custom types, we add them to the list
            // TODO: This is way too simple for now. We need to deal with types schemas in the future.
            if (userTypes) {
                userTypes.map((type)=>{
                    types.push(type);
                })
            }

            let credential: DIDPlugin.VerifiableCredential = null;
            try {
                console.log("Asking DIDService to create the credential with id "+credentialId);
                credential = await this.createPluginCredential(credentialId, types, 15, props, password);
                console.log("Created credential:",credential);
            }
            catch (e) {
                console.error("Create credential exception - assuming wrong password", e);
                reject(new WrongPasswordException());
                return;
            }

            console.log("Asking DIDService to store the credential");
            await this.addPluginCredential(credential);

            console.log("Credential successfully added");

            // Add the new credential to the memory model
            this.credentials.push(credential);

            // Notify listeners that a credential has been added
            this.events.publish('did:credentialadded');

            resolve(credential);
        });
    }

    getCredentialById(credentialId: DIDURL): DIDPlugin.VerifiableCredential {
        if (!this.credentials)
            return null;

        return this.credentials.find((c)=>{
            return credentialId.matches(c.getId());
        });
    }
  
    /**
     * Based on some predefined basic credentials (name, email...) we build a Profile structure
     * to ease profile editing on UI.
     */
    getBasicProfile() : Profile {
        let profile = Profile.createDefaultProfile();

        // We normally have one credential for each profile field
        this.credentials.map((cred)=>{
            let props = cred.getSubject(); // Credentials properties
            if (!props) {
                console.warn("Found an empty credential subject while trying to build profile, this should not happen...");
                return;
            }

            // Only deal with BasicProfileCredential credentials
            if (cred.getType().indexOf("BasicProfileCredential") < 0) {
                return;
            }

            // Loop over each property in the credential (even if normally there is only one property per credential)
            for (let p of Object.keys(props)) {
                // Skip the special entry "id" that exists in every credential.
                if (p == "id")
                    continue;

                // Try to retrieve a standard property info from this property
                let basicCredentialInfo = BasicCredentialsService.instance.getBasicCredentialInfoByKey(p);
                if (!basicCredentialInfo) {
                    console.warn("Unhandled basic credential "+p);
                }
                else {
                    profile.setValue(basicCredentialInfo, props[p]);
                }
            }
        })

        console.log("Basic profile:", profile);
        return profile;
    }

    /**
     * Overwrites profile info using a new profile. Each field info is updated
     * into its respective credential.
     * 
     * Returns true if local did document has been modified, false otherwise.
     */
    public writeProfile(newProfile: Profile, password: string): Promise<boolean> {
        return new Promise(async (resolve, reject)=>{
            console.log("Writing profile fields as credentials", newProfile);

            let localDidDocumentHasChanged = false;
            for(let entry of newProfile.entries) {
                let props = {};
                props[entry.info.key] = entry.value;

                let credentialId = new DIDURL("#"+entry.info.key);
                if (!this.credentialContentHasChanged(credentialId, entry.value)) {
                    console.log("Not updating credential "+entry.info.key+" as it has not changed");
                    continue; // SKip this credential, go to next one.
                }

                try {
                    // Update the DID Document in case it contains the credential. Then we will have to 
                    // ask user if he wants to publish a new version of his did document on chain.
                    let currentDidDocument = this.getDIDDocument();
                    if (currentDidDocument) {
                        let documentCredential = currentDidDocument.getCredentialById(credentialId);
                        if (documentCredential) {
                            // User's did document contains this credential being modified, so we updated the 
                            // document.
                            console.log("Updating local DID document");
                            await currentDidDocument.updateCredential(documentCredential, password);
                            localDidDocumentHasChanged = true;
                        }
                    }

                    // Update use case: if this credential already exist, we delete it first before re-creating it.
                    let existingCredential = this.getCredentialById(credentialId);
                    if (existingCredential) {
                        console.log("Credential with id "+existingCredential.getId()+" already exists - deleting");
                        await this.deleteCredential(new DIDURL(existingCredential.getId()));
                    }

                    console.log("Adding credential for profile key "+entry.info.key);
                    let credential = await this.addCredential(credentialId, props, password, ["BasicProfileCredential"]);
                    console.log("Created credential:", credential);
                }
                catch (e) {
                    // We may have catched a wrong password exception - stop the loop here.
                    reject(e);
                    return;
                }
            }

            resolve(localDidDocumentHasChanged);
        });
    }

    /**
     * Checks if a given credential exists in current DID
     */
    credentialExists(credentialId: DIDURL): boolean {
        return (this.credentials.find((c)=>{
            return credentialId.matches(c.getId());
        }) != null);
    }

    /**
     * Compares the given credential properties with an existing credential properties to see if
     * something has changed or not. This function is used to make sure we don't try to delete/re-create
     * an existing creedntial on profile update, in case nothing has changed (performance)
     */
    credentialContentHasChanged(credentialId: DIDURL, newProfileValue: string) {
        let currentCredential: DIDPlugin.VerifiableCredential = this.credentials.find((c)=>{
            return credentialId.matches(c.getId());
        });

        if (!currentCredential) {
            return true; // Doesn't exist? consider this has changed.
        }

        // NOTE: FLAT comparison only for now, not deep.
        let currentProps = currentCredential.getSubject();
        let credentialFragment = currentCredential.getFragment();
        if (currentProps[credentialFragment] != newProfileValue)
            return true;

        return false;
    }

    private createPluginCredential(credentialId: DIDURL, type, expirationDate, properties, passphrase): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise(async (resolve, reject)=>{
            this.pluginDid.issueCredential(
                this.getDIDString(), credentialId.toString(), type, expirationDate, properties, passphrase,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    public async deleteCredential(credentialDidUrl: DIDURL): Promise<boolean> {
        console.log("Asking DIDService to delete the credential "+credentialDidUrl);
        await this.deletePluginCredential(credentialDidUrl);

        // Delete from our local model as well
        let deletionIndex = this.credentials.findIndex((c)=>credentialDidUrl.matches(c.getId()));
        this.credentials.splice(deletionIndex, 1);

        return true;
    }

    private deletePluginCredential(didUrlString: DIDURL): Promise<any> {
        console.log("deleteCredential:" + didUrlString);
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

        return new Promise(async (resolve, reject)=>{
            this.pluginDid.deleteCredential(
                didUrlString.toString(),
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    private addPluginCredential(credential: DIDPlugin.VerifiableCredential): Promise<void> {
        console.log("DIDService - storeCredential", this.getDIDString(), credential);
        return new Promise(async (resolve, reject)=>{
            console.log("DIDService - Calling real storeCredential");
            this.pluginDid.addCredential(
                credential,
                () => {
                    console.log("DIDService - storeCredential responded");
                    resolve()
                }, (err) => {reject(err)},
            );
        });
    }

    public async resolveDidDocument(didString: string): Promise<DIDDocument> {
        let pluginDidDocument = await this.resolvePluginDidDocument(didString);
        return new DIDDocument(pluginDidDocument);
    }

    private resolvePluginDidDocument(didString: string): Promise<DIDPlugin.DIDDocument> {
        if (!BrowserSimulation.runningInBrowser()) {
            return new Promise((resolve, reject)=>{
                this.pluginDid.resolveDidDocument(
                    (didDocument) => {
                        resolve(didDocument)
                    }, (err) => {
                        reject(err)
                    },
                );
            });
        }
    }

    createVerifiablePresentationFromCredentials(credentials: DIDPlugin.VerifiableCredential[], storePass: string): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise(async (resolve, reject)=>{
            this.pluginDid.createVerifiablePresentation(credentials, "no-realm", "no-nonce", storePass, (presentation: DIDPlugin.VerifiablePresentation)=>{
                resolve(presentation);
            }, (err)=>{
                reject(err);
            });
        });
    }

    public setLoadedDIDDocument(didDocument: DIDDocument) {
        console.log("Setting loaded did document to:", didDocument);
        this.didDocument = didDocument;
    }

    public getDIDDocument(): DIDDocument {
        return this.didDocument;
    }
}
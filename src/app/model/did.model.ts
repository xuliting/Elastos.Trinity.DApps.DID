import { Events } from '@ionic/angular';
import { Profile } from './profile.model';
import { WrongPasswordException } from './exceptions/wrongpasswordexception.exception';
import { BrowserSimulation, SimulatedDID, SimulatedCredential } from '../services/browsersimulation';
import { BasicCredentialsService } from '../services/basiccredentials.service';

export class DID {
    private unloadedCredentials: DIDPlugin.UnloadedVerifiableCredential[] = [];
    public credentials: DIDPlugin.VerifiableCredential[] = [];

    constructor(private pluginDid: DIDPlugin.DID, private events: Events) {
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

        // Get the list of unloaded credentials
        // TODO: Should load only BASIC type credentials here to get basic profile info, we don't need everything.
        this.unloadedCredentials = await this.listPluginCredentials();
        console.log("Current credentials list: ", this.unloadedCredentials);

        this.credentials = [];
        for (let entry of this.unloadedCredentials) {
            await this.loadCredential(this.getDIDString(), entry);
        }
    }

    public async loadCredential(curDidId: DIDPlugin.DIDString, entry: DIDPlugin.UnloadedVerifiableCredential) {
        let loadedCredential = await this.loadPluginCredential(entry.credentialId);
        console.log("Credential loaded:", loadedCredential);
        this.credentials.push(loadedCredential);
    }

    /**
     */
    async addCredential(title: String, props: any, password: string, userTypes?: String[]): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise(async (resolve, reject)=>{
            console.log("Adding credential", title, props, userTypes);

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
                console.log("Asking DIDService to create the credential");
                credential = await this.createPluginCredential(title, types, 15, props, password);
                console.log("Created credential:",credential);
            }
            catch (e) {
                console.error("Create credential exception - assuming wrong password", e);
                reject(new WrongPasswordException());
                return;
            }

            console.log("Asking DIDService to store the credential");
            await this.storePluginCredential(credential);

            console.log("Credential successfully added");

            // Add the new credential to the memory model
            this.credentials.push(credential);

            // Notify listeners that a credential has been added
            this.events.publish('did:credentialadded');

            resolve(credential);
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
     * into its respective credential
     */
    public writeProfile(newProfile: Profile, password: string): Promise<void> {
        return new Promise(async (resolve, reject)=>{
            console.log("Writing profile fields as credentials", newProfile);

            for(let entry of newProfile.entries) {
                let props = {};
                props[entry.info.key] = entry.value;

                if (!this.credentialContentHasChanged(entry.info.key, entry.value)) {
                    console.log("Not updating credential "+entry.info.key+" as it has not changed");
                    continue; // SKip this credential, go to next one.
                }

                try {
                    // Update use case: if this credential already exist, we delete it first before re-creating it.
                    if (this.credentialExists(entry.info.key)) {
                        let credentialDidUrl = this.getDIDString() + "#" + entry.info.key;
                        await this.deleteCredential(credentialDidUrl);
                    }

                    console.log("Adding credential for profile key "+entry.info.key);
                    let credential = await this.addCredential(entry.info.key, props, password, ["BasicProfileCredential"]);
                    console.log("Created credential:", credential);
                }
                catch (e) {
                    // We may have catched a wrong password exception - stop the loop here.
                    reject(e);
                    return;
                }
            }

            resolve();
        });
    }

    /**
     * Checks if a given credential exists in current DID
     */
    credentialExists(key: string): boolean {
        return (this.credentials.find((c)=>{
            return c.getFragment() == key;
        }) != null);
    }

    /**
     * Compares the given credential properties with an existing credential properties to see if
     * something has changed or not. This function is used to make sure we don't try to delete/re-create
     * an existing creedntial on profile update, in case nothing has changed (performance)
     */
    credentialContentHasChanged(key: string, newProfileValue: string) {
        let currentCredential: DIDPlugin.VerifiableCredential = this.credentials.find((c)=>{
            return c.getFragment() == key;
        });

        if (!currentCredential) {
            return true; // Doesn't exist? consider this has changed.
        }

        // NOTE: FLAT comparison only for now, not deep.
        let currentProps = currentCredential.getSubject();
        if (currentProps[key] != newProfileValue)
            return true;

        return false;
    }

    private createPluginCredential(credentialId, type, expirationDate, properties, passphrase): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise(async (resolve, reject)=>{
            this.pluginDid.issueCredential(
                this.getDIDString(), credentialId, type, expirationDate, properties, passphrase,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    public async deleteCredential(credentialDidUrl: String): Promise<boolean> {
        console.log("Asking DIDService to delete the credential "+credentialDidUrl);
        await this.deletePluginCredential(credentialDidUrl);

        // Delete from our local model as well
        let deletionIndex = this.credentials.findIndex((c)=>c.getId() == credentialDidUrl);
        this.credentials.splice(deletionIndex, 1);

        return true;
    }

    private deletePluginCredential(didUrlString): Promise<any> {
        console.log("deleteCredential:" + didUrlString);
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
               resolve()
            });
        }

        return new Promise(async (resolve, reject)=>{
            this.pluginDid.deleteCredential(
                didUrlString,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    private listPluginCredentials(): Promise<DIDPlugin.UnloadedVerifiableCredential[]> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let fakeDID = new SimulatedDID()
                fakeDID.listCredentials((credentials)=>{
                    resolve(credentials);
                })
            });
        }

        return new Promise(async (resolve, reject)=>{
            this.pluginDid.listCredentials(
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    private loadPluginCredential(didUrlString: string): Promise<any> {
        if (BrowserSimulation.runningInBrowser()) {//for test
            return new Promise((resolve, reject)=>{
                let ret = SimulatedCredential.makeForCredentialId(didUrlString)
                resolve(ret)
            });
        }

        return new Promise(async (resolve, reject)=>{
            this.pluginDid.loadCredential(
                didUrlString,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    private storePluginCredential(credential: DIDPlugin.VerifiableCredential): Promise<void> {
        console.log("DIDService - storeCredential", this.getDIDString(), credential);
        return new Promise(async (resolve, reject)=>{
            console.log("DIDService - Calling real storeCredential");
            this.pluginDid.storeCredential(
                credential,
                () => {
                    console.log("DIDService - storeCredential responded");
                    resolve()
                }, (err) => {reject(err)},
            );
        });
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
}
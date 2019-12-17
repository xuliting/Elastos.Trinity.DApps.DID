import { Events } from '@ionic/angular';

import { Profile } from './profile.model';
import { DIDService } from '../services/did.service';
import { NewDID } from './newdid.model';
import { AuthService } from '../services/auth.service';
import { WrongPasswordException } from './exceptions/wrongpasswordexception.exception';

export class DIDStore {
    public pluginDidStore: DIDPlugin.DIDStore = null;
    public dids: DIDPlugin.UnloadedDID[] = [];
    private unloadedCredentials: DIDPlugin.UnloadedVerifiableCredential[] = [];
    public credentials: DIDPlugin.VerifiableCredential[] = [];

    constructor(private didService: DIDService, private events: Events) {}

    public getCurrentDid(): DIDPlugin.DIDString {
        if (!this.dids || this.dids.length == 0) {
            console.warn("Abnormal case: no active DID in the DID Store!");
            return null;
        }

        return this.dids[0].did; // Handle only one DID per DIDStore for now.
    }

    /**
     * Fills this object model by loading a plugin DID store with all its contained DIDs, credentials, etc.
     */
    async loadFromDidStoreId(didStoreId: string) : Promise<Boolean> {
        console.log("loadFromDidStoreId "+didStoreId);

        try {
            this.pluginDidStore = await this.didService.initDidStore(didStoreId);
            let hasPrivId = await this.didService.hasPrivateIdentity();
            if (!hasPrivId) {
                console.error("No private identity found...")
                return false; // Unable to load store data correctly
            }

            this.dids = await this.didService.listDids();
            console.log("DIDs:", this.dids)
            if (this.dids.length == 0) {
                // Something went wrong earlier, no DID in the DID store...
                console.warn("No DID in the DID Store, that's a bit strange but we want to continue here.")
            }

            await this.loadAllCredentials();
        }
        catch (e) {
            console.error("Fatal error while loading from DID Store id.", e);
            return false;
        }

        return true;
    }

    /**
     * Gets the list of unloaded credentials then load them one by one.
     * After this call, all credentials related to the active DID of this DID store are loaded
     * in memory.
     */
    async loadAllCredentials() {
        if (this.getCurrentDid() == null) {
            console.log("Not loading credentials as there is no DID in the store.");
            return;
        }

        console.log("Loading DID store credentials for DID", this.getCurrentDid());

        // Get the list of unloaded credentials
        // TODO: Should load only BASIC type credentials here to get basic profile info, we don't need everything.
        this.unloadedCredentials = await this.didService.listCredentials(this.getCurrentDid());
        console.log("Current credentials list: ", this.unloadedCredentials);

        this.credentials = [];
        for (let entry of this.unloadedCredentials) {
            await this.loadCredential(this.getCurrentDid(), entry);
        }
    }

    async loadCredential(curDidId: DIDPlugin.DIDString, entry: DIDPlugin.UnloadedVerifiableCredential) {
        let loadedCredential = await this.didService.loadCredential(curDidId, entry.credentialId);
        console.log("Credential loaded:", loadedCredential);
        this.credentials.push(loadedCredential);
    }

    /**
     * Converts the DID being created into a real DID in the DID store, with some credentials
     * for user's default profile.
     */
    public async addNewDidWithProfile(newDid: NewDID, mnemonicLang: DIDPlugin.MnemonicLanguage, mnemonic: string) {
        if (this.dids.length >= 1) {
            console.warn("Caution! Your are adding a new DID to the DIDStore but there are already some DIDs, and we don't support more than one DID per store for now!");
        }

        // Create a private root key
        console.log("Adding DID to the store", this);
        await this.didService.initPrivateIdentity(mnemonicLang, mnemonic, newDid.password, true)

        // Save password for later use
        AuthService.instance.saveCurrentUserPassword(this.pluginDidStore.getId(), newDid.password);

        // Create and add a DID to the DID store in physical storage.
        let createdDid = await this.didService.createDid(newDid.password, "");
        console.log("Created DID:", createdDid);

        // Add DID to our memory model.
        this.dids.push({
            did: createdDid.didString,
            alias:""
        });

        // Now create credentials for each profile entry
        await this.writeProfile(newDid.profile);
    }

    /**
     */
    async addCredential(title: String, props: any, userTypes?: String[]): Promise<DIDPlugin.VerifiableCredential> {
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
                credential = await this.didService.createCredential(this.getCurrentDid(), title, types, 15, props, AuthService.instance.getCurrentUserPassword());
                console.log("Created credential:",credential);
            }
            catch (e) {
                console.error("Create credential exception - assuming wrong password", e);
                reject(new WrongPasswordException());
                return;
            }

            console.log("Asking DIDService to store the credential");
            await this.didService.storeCredential(this.getCurrentDid(), credential);

            // NO - for now we don't want to "publish" (= put in the DID document) - we just want to store it
            //console.log("Asking DIDService to add the credential");
            //await this.didService.addCredential(credential.getId());

            console.log("Credential successfully added");

            // Add the new credential to the memory model
            this.credentials.push(credential);

            // Notify listeners that a credential has been added
            this.events.publish('did:credentialadded');

            resolve(credential);
        });
    }

    async deleteCredential(credentialDidUrl: String): Promise<boolean> {
        console.log("Asking DIDService to delete the credential "+credentialDidUrl);
        await this.didService.deleteCredential(this.getCurrentDid(), credentialDidUrl);

        // Delete from our local model as well
        let deletionIndex = this.credentials.findIndex((c)=>c.getId() == credentialDidUrl);
        this.credentials.splice(deletionIndex, 1);

        return true;
    }

    /**
     * Based on some predefined basic credentials (name, email...) we build a Profile structure
     * to ease profile editing on UI.
     */
    getBasicProfile() : Profile {
        let profile = new Profile();

        // We normally have one credential for each profile field
        this.credentials.map((cred)=>{
            let props = cred.getSubject();
            if (!props) {
                console.warn("Found an empty credential subject while trying to build profile, this should not happen...");
                return;
            }

            if (props.name)
                profile.name = props.name;
            if (props.birthDate)
                profile.birthDate = props.birthDate;
            if (props.nation)
                profile.nation = props.nation;
            if (props.email)
                profile.email = props.email;
            if (props.gender)
                profile.gender = props.gender;
            if (props.telephone)
                profile.telephone = props.telephone;
        })

        console.log("Basic profile:", profile);
        return profile;
    }

    /**
     * Overwrites profile info using a new profile. Each field info is updated
     * into its respective credential
     */
    writeProfile(newProfile: Profile): Promise<void> {
        return new Promise(async (resolve, reject)=>{
            console.log("Writing profile fields as credentials", newProfile);

            for(let key of Object.keys(newProfile)) {
                let props = {};
                props[key] = newProfile[key];

                if (!this.credentialContentHasChanged(key, newProfile[key])) {
                    console.log("Not updating credential "+key+" as it has not changed");
                    continue; // SKip this credential, go to next one.
                }

                try {
                    // Update use case: if this credential already exist, we delete it first before re-creating it.
                    if (this.credentialExists(key)) {
                        let credentialDidUrl = this.getCurrentDid() + "#" + key;
                        await this.deleteCredential(credentialDidUrl);
                    }

                    console.log("Adding credential for profile key "+key);
                    let credential = await this.addCredential(key, props, ["BasicProfileCredential"]);
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
}
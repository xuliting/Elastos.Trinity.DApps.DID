import { Events } from '@ionic/angular';

import { Profile } from './profile.model';
import { DIDService } from '../services/did.service';
import { NewDID } from './newdid.model';

export class DIDStore {
    public pluginDidStore: DIDPlugin.DIDStore = null;
    public dids: DIDPlugin.UnloadedDID[] = [];
    private unloadedCredentials: DIDPlugin.UnloadedVerifiableCredential[] = [];
    public credentials: DIDPlugin.VerifiableCredential[] = [];
    public password: string = null; // Password provided by the user.

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
            
        this.pluginDidStore = await this.didService.initDidStore(didStoreId);
        let hasPrivId = await this.didService.hasPrivateIdentity();
        if (!hasPrivId) {
            console.error("No private identity found...")
            return false; // Unable to load store data correctly
        }
             
        this.dids = await this.didService.listDids();
        console.log("this.dids", this.dids)
        if (this.dids.length == 0) {
            // Something went wrong earlier, no DID in the DID store...
            console.warn("No DID in the DID Store, that's a bit strange but we want to continue here.")
        } 
       
        await this.loadAllCredentials();
           
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

        console.log("Loading DID store credentials");

        // Get the list of unloaded credentials
        // TODO: Should load only BASIC type credentials here to get basic profile info, we don't need everything.
        this.unloadedCredentials = await this.didService.listCredentials(this.getCurrentDid());
        console.log("Current credentials list: ", this.credentials);

        this.credentials = [];
        for (let entry of this.unloadedCredentials) {
            await this.loadCredential(this.getCurrentDid(), entry);
        }
    }

    async loadCredential(curDidId: DIDPlugin.DIDString, entry: DIDPlugin.UnloadedVerifiableCredential) {
        let loadedCredential = await this.didService.loadCredential(curDidId, entry.credentialId);
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
        this.rememberPassword(newDid.password);
    
        // Create and add a DID to the DID store in physical storage.
        let createdDid = await this.didService.createDid(newDid.password, "");
        console.log("Created DID:", createdDid);
        
        // Add DID to our memory model.
        this.dids.push({
            did: createdDid.didString,
            hint:""
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
        
            console.log("Asking DIDService to create the credential");
            let credential = await this.didService.createCredential(this.getCurrentDid(), title, types, 15, props, this.password);
        
            console.log("Asking DIDService to store the credential");
            await this.didService.storeCredential(this.getCurrentDid(), credential);
        
            console.log("Asking DIDService to add the credential");
            await this.didService.addCredential(credential.getId());
        
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
        let profile = new Profile();

        // We normally have one credential for each profile field
        this.credentials.map((cred)=>{
            let props = cred.getProperties();

            // TODO: Match with standard field names in DID spec.
            if (props.name)
                profile.name = props.name;
            if (props.birthday)
                profile.name = props.birthday;
            if (props.area)
                profile.name = props.area;
            if (props.email)
                profile.name = props.email;
            if (props.IM)
                profile.name = props.IM;
            if (props.gender)
                profile.name = props.gender;
            if (props.phone)
                profile.name = props.phone;
            if (props.ELAAddress)
                profile.name = props.ELAAddress;
        })

        console.log("Basic profile:", profile);
        return profile;
    }

    /**
     * Overwrites profile info using a new profile. Each field info is updated
     * into its respective credential
     */
    async writeProfile(newProfile: Profile) {
        // TODO: update existing credentials if we are updating. Now only handling "create".
        console.log("Writing profile fields as credentials", newProfile);

        Object.keys(newProfile).map(async (key)=>{
            console.log("Adding credential for profile key "+key);

            let props = {};
            props[key] = newProfile[key];

            let credential = await this.addCredential(key, props, ["BasicProfileCredential"]);
            this.credentials.push(credential);
        });
    }

    /**
     * Remembers store's password temporarily in memory.
     */
    public rememberPassword(password: string) {
        this.password = password;
    }
}
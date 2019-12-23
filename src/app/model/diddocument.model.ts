import { Events } from '@ionic/angular';

export class DIDDocument {
    constructor(public pluginDidDocument: DIDPlugin.DIDDocument) {
    }

    addCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<void> {
        console.log("Adding credential with key "+credential.getFragment()+" into DIDDocument");
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.addCredential(
                credential,
                storePass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    deleteCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<void> {
        console.log("Delete credential with key "+credential.getFragment()+" from the DIDDocument");
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.deleteCredential(
                credential,
                storePass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    /**
     * Retrieve a credential from the given key.
     * Key format: "my-key"
     * Credential id format: "#my-key"
     * Fragment format: "my-key"
     */
    getCredentialByKey(key: DIDPlugin.DIDURLFragment) : DIDPlugin.VerifiableCredential {
        let credentials = this.getCredentials();
        console.log("credentials", credentials)
        return credentials.find((c)=>{
            return c.getFragment() == key;
        });
    }

    getCredentials(): DIDPlugin.VerifiableCredential[] {
        return this.pluginDidDocument.getCredentials();
    }

    /**
     * Start publishing this DID document on chain.
     * Response will be received in DIDStore.createIdTransactionCallback().
     */
    publish(storepass: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.publish(
                storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }
}
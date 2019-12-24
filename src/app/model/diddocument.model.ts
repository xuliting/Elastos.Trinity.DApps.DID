import { Events } from '@ionic/angular';
import { DIDURL } from './didurl.model';

export class DIDDocument {
    constructor(public pluginDidDocument: DIDPlugin.DIDDocument) {
    }

    public addCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<void> {
        console.log("Adding credential with key "+credential.getId()+" into DIDDocument", credential);
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.addCredential(
                credential,
                storePass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    public deleteCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<void> {
        console.log("Delete credential with key "+credential.getId()+" from the DIDDocument", credential);
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.deleteCredential(
                credential,
                storePass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

    public async updateCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<void> {
        await this.deleteCredential(credential, storePass);
        await this.addCredential(credential, storePass);
    }

    /**
     * Retrieve a credential from the given credential id.
     */
    getCredentialById(credentialId: DIDURL) : DIDPlugin.VerifiableCredential {
        let credentials = this.getCredentials();
        return credentials.find((c)=>{
            return credentialId.matches(c.getId());
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
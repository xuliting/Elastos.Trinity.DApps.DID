/**
 * ################################################################
 * ################################################################
 * Edit this class to change the app behaviour in simulation
 * ################################################################
 * ################################################################
 */
export class BrowserSimulationConfig {
    public static hasDIDStores() : boolean {
        return false;
    }
}
/**
 * ################################################################
 * ################################################################
 */

 function simulated(funcName: string, className = null) {
    let log = "SIMULATED - "+funcName;
    if (className)
        log += " ("+className+")";

    console.warn(log);
}

function randomString() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
}

export class SimulatedUnloadedCredential implements DIDPlugin.UnloadedVerifiableCredential {
    hint: string = "fakehint";
    alias: string = "fakealias";

    constructor(public credentialId: string) {
    }
}

export class SimulatedCredential implements DIDPlugin.VerifiableCredential {
    constructor(public credentialId: string, public basicProfileValue: string){
    }

    getId() {
        simulated("getId", "SimulatedCredential");
        return "did:elastos:"+randomString()+"#"+this.credentialId;
    }
    getFragment() {
        simulated("getFragment", "SimulatedCredential");
        return this.credentialId;
    }
    getType() {
        simulated("getType", "SimulatedCredential");
        return "BasicProfileCredential";
    }
    getIssuer() {
        simulated("getIssuer", "SimulatedCredential");
        return "did:elastos:issuer-abcdef";
    }
    getIssuanceDate(): Date {
        simulated("getIssuanceDate", "SimulatedCredential");
        return new Date();
    }
    getExpirationDate(): Date {
        simulated("getExpirationDate", "SimulatedCredential");
        return new Date();
    }
    getSubject() {
        simulated("getSubject", "SimulatedCredential");
        let subject = {};
        subject[this.credentialId] = this.basicProfileValue;
        return subject;
    }
    getProof() {
        simulated("getProof", "SimulatedCredential");
        return {};
    }
    toString() : Promise<string> {
        return new Promise((resolve, reject)=>{
            resolve("")
        })
    }

    static makeForCredentialId(credentialId: string): SimulatedCredential {
        switch(credentialId) {
            case "name":
                return new SimulatedCredential("name", "User_"+randomString());
            case "email":
                return new SimulatedCredential("email", "Email_"+randomString());
            default:
                return new SimulatedCredential("nokey", "novalue");
        }
    }
}

export class SimulatedVerifiablePresentation implements DIDPlugin.VerifiablePresentation {
    credentials: DIDPlugin.VerifiableCredential[] = [];

    constructor() {
        this.credentials.push(SimulatedCredential.makeForCredentialId("name"));
        this.credentials.push(SimulatedCredential.makeForCredentialId("email"));
        this.credentials.push(SimulatedCredential.makeForCredentialId("gender"));
    }

    getCredentials(): DIDPlugin.VerifiableCredential[] {
        simulated("getCredentials", "SimulatedVerifiablePresentation");
        return this.credentials;
    }
    toJson(onSuccess: (presentation: DIDPlugin.VerifiablePresentation) => void, onError?: (err: any) => void) {
        simulated("toJson", "SimulatedVerifiablePresentation");
        onSuccess(this);
    }
    isValid(onSuccess: (isValid: boolean) => void, onError?: (err: any) => void) {
        simulated("isValid", "SimulatedVerifiablePresentation");
        onSuccess(true);
    }
    isGenuine(onSuccess: (isValid: boolean) => void, onError?: (err: any) => void) {
        simulated("isGenuine", "SimulatedVerifiablePresentation");
        onSuccess(true);
    }
}

export class SimulatedDIDStore implements DIDPlugin.DIDStore {
    getId(): string {
        simulated("getId", "SimulatedDIDStore");
        return randomString();
    }

    initPrivateIdentity(language: DIDPlugin.MnemonicLanguage, mnemonic: string, passphrase: string, storepass: string, force: Boolean, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("initPrivateIdentity", "SimulatedDIDStore");
    }

    containsPrivateIdentity(onSuccess: (containsPrivateIdentity: boolean) => void, onError?: (err: any) => void) {
        simulated("containsPrivateIdentity", "SimulatedDIDStore");
    }

    deleteDid(didString: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("deleteDid", "SimulatedDIDStore");
    }

    newDid(passphrase: string, alias: string, onSuccess: (did: DIDPlugin.DID, didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("newDid", "SimulatedDIDStore");
        onSuccess(new SimulatedDID(), null);
    }

    listDids(filter: any, onSuccess: (dids: DIDPlugin.DID[]) => void, onError?: (err: any) => void) {
        simulated("listDids", "SimulatedDIDStore");
        onSuccess([
            new SimulatedDID(),
            new SimulatedDID(),
            new SimulatedDID()
        ])
    }

    loadDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("loadDidDocument", "SimulatedDIDStore");
    }

    resolveDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("resolveDidDocument", "SimulatedDIDStore");
    }

    storeDidDocument(didDocument: DIDPlugin.DIDDocument, alias: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("storeDidDocument", "SimulatedDIDStore");
    }

    updateDidDocument(didDocument: DIDPlugin.DIDDocument, storepass: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("updateDidDocument", "SimulatedDIDStore");
    }

    setResolverUrl(resolver: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("setResolverUrl", "SimulatedDIDStore");
    }

    synchronize(storepass: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("synchronize", "SimulatedDIDStore");
    }
}

export class SimulatedDID implements DIDPlugin.DID {
    getDIDString(): string {
        simulated("getDIDString", "SimulatedDID");
        return "did:elastos:my-did";
    }
    getMethod(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("getMethod", "SimulatedDID");
    }
    getMethodSpecificId(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("getMethodSpecificId", "SimulatedDID");
    }
    resolveDidDocument(onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any)=>void) {
        simulated("resolveDidDocument", "SimulatedDID");
        onSuccess(null);
    }

    prepareIssuer(onSuccess?: ()=>void) {
        simulated("prepareIssuer", "SimulatedDID");
        onSuccess();
    }

    issueCredential(subjectDID: string, credentialId: string, types: string[], expirationDate: Date, properties: any, passphrase: string, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("issueCredential", "SimulatedDID");
        onSuccess(new SimulatedCredential(credentialId, "someproperty"));
    }
    deleteCredential(credentialId: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("deleteCredential", "SimulatedDID");
        onSuccess();
    }
    listCredentials(onSuccess: (credentials: DIDPlugin.UnloadedVerifiableCredential[]) => void, onError?: (err: any) => void) {
        simulated("listCredentials", "SimulatedDID");
        onSuccess([
            new SimulatedUnloadedCredential("name"),
            new SimulatedUnloadedCredential("email"),
            new SimulatedUnloadedCredential("nation"),
            new SimulatedUnloadedCredential("birthDate"),
            new SimulatedUnloadedCredential("gender"),
            new SimulatedUnloadedCredential("telephone")
        ])
    }
    loadCredential(credentialId: string, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("loadCredential", "SimulatedDID");
        onSuccess(SimulatedCredential.makeForCredentialId(credentialId));
    }
    storeCredential(credential: DIDPlugin.VerifiableCredential, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("storeCredential", "SimulatedDID");
        onSuccess();
    }
    createVerifiablePresentation(credentials: DIDPlugin.VerifiableCredential[], realm: string, nonce: string, storepass: string, onSuccess: (presentation: DIDPlugin.VerifiablePresentation) => void, onError?: (err: any) => void) {
        simulated("createVerifiablePresentation", "SimulatedDID");
        onSuccess(new SimulatedVerifiablePresentation());
    }
}

export class BrowserSimulation {
    private static _runningInBrowser: boolean = false;

    public static setRunningInBrowser() {
        console.warn("Setting app to BROWSER mode (simulated)");
        this._runningInBrowser = true;
    }

    public static runningInBrowser() : boolean {
        return this._runningInBrowser;
    }
}
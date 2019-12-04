/**
 * Simple information about created DID stores. Used to save in-app DID store information to display
 * the list of DID stores before asking passwords to users.
 */
export class DIDStoreEntry {
  constructor(
    public storeId: string,
    public name: string
  ) { }
}

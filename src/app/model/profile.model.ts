/**
 * Fields in this class match the Elastos DID specification naming convention for credentials.
 */
export class Profile {
  constructor(
    public name: string = "", // Full name
    public birthDate: string = "", // RFC 3339
    public nation: string = "", // ISO 3166 ALPHA 3 (ex: CHN, FRA)
    public email: string = "",
    public gender: string = "",
    public telephone: string = ""
  ) { }

  /**
   * Creates a cloned version of the given profile
   */
  static fromProfile(profile: Profile) {
    let newProfile = new Profile();
    Object.assign(newProfile, profile);
    return newProfile;
  }
}

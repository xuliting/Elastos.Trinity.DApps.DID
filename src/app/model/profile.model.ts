export class Profile {
  constructor(
    public name: string = "",
    public birthday: string = "",
    public area: string = "",

    public email: string = "",
    public gender: string = "",
    public IM: string = "",
    public phone: string = "",

    public ELAAddress: string = "",
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

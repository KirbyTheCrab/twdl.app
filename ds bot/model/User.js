class User {
  constructor(
    user_id,
    discord_name,
    role_count,
    is_mod,
    discord_server_id,
    discord_user_id
  ) {
    this.user_id = user_id;
    this.discord_name = discord_name;
    this.role_count = role_count;
    this.is_mod = is_mod;
    this.discord_server_id = discord_server_id;
    this.discord_user_id = discord_user_id;
  }
  // Getter and Setter for user_id
  get user_id() {
    return this._user_id;
  }

  set user_id(value) {
    this._user_id = value;
  }

  // Getter and Setter for discord_name
  get discord_name() {
    return this._discord_name;
  }

  set discord_name(value) {
    this._discord_name = value;
  }

  // Getter and Setter for role_count
  get role_count() {
    return this._role_count;
  }

  set role_count(value) {
    this._role_count = value;
  }

  // Getter and Setter for is_mod
  get is_mod() {
    return this._is_mod;
  }

  set is_mod(value) {
    this._is_mod = value;
  }

  // Getter and Setter for discord_server_id
  get discord_server_id() {
    return this._discord_server_id;
  }

  set discord_server_id(value) {
    this._discord_server_id = value;
  }

  // Getter and Setter for discord_user_id
  get discord_user_id() {
    return this._discord_user_id;
  }

  set discord_user_id(value) {
    this._discord_user_id = value;
  }
}

export default User;

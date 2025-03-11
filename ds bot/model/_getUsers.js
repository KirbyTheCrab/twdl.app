import Database from "./Database.js";

async function findUserByDiscordName(user_discord_id) {
  const database = new Database();
  try {
    const result = await database.db_query(
      `SELECT * FROM users WHERE discord_user_id='${user_discord_id}'`
    );
    database.close_db_connection();
    if(result.length < 1){
      return `Error: We could not find user <@${user_discord_id}>` 
    }else{
      const user = await database.createUserObject(result)
      return user
    }
  } catch (error) {
    console.error(
      "Unable to find user with that user name. Try again with another"
    );
  }
}
export default findUserByDiscordName
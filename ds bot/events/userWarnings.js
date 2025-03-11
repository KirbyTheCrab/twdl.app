import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonFilePath = join(__dirname, '..', 'json', 'forbiddenActivityList.json');
const jsonDataRead = readFileSync(jsonFilePath, 'utf-8');

const listOfUsers = {};

let forbiddenActivityList = [];
forbiddenActivityList = JSON.parse(jsonDataRead);

/**
 * Get and validate user activities (discord embed)
 * @param {*} newMember user
 */
async function getUserDiscordActivity(newMember) {
  if (newMember.user.bot) return;
  const activityList = newMember.member.presence.activities;
  if (activityList.length > 0) {
    for (const activity of activityList) {
      const activityName = activity.name;
      // const activityState = activity.state;
      // const activityEmoji = activity.emoji;
      let found = false;
      for (const forbiddenActivity of forbiddenActivityList) {
        if (
          activityName.includes(forbiddenActivity) &&
          newMember.user.username === "toad1018"
        ) {
          await handleWarnings(newMember, activity.state);
        }
      }
    }
  }
}

async function removeActivityFromList(newActivity, interaction) {
  const jsonObject = JSON.parse(jsonDataRead);
  let found = false;
  if (jsonObject.length > 0) {
    for (const activity of jsonObject) {
      if (newActivity.includes(activity)) {
        found = true;
      }
    }
    if (found) {
      await interaction.reply(`${newActivity} has been found and removed`);
      removeFromForbiddenActivityList(newActivity);
      saveForbiddenActivityList();
    } else {
      await interaction.reply(
        `${newActivity} was not found in the list try again`
      );
    }
  } else {
    await interaction.reply(`The forbidden activity list is empty`);
  }
}

function removeFromForbiddenActivityList(elementsToRemove) {
  const filteredList = forbiddenActivityList.filter(
    (activity) => activity !== elementsToRemove
  );
  forbiddenActivityList.splice(
    0,
    forbiddenActivityList.length,
    ...filteredList
  );
}

async function addToForbiddenActivityList(newActivity, interaction) {
  const jsonObject = JSON.parse(jsonDataRead);
  if (jsonObject.length > 0) {
    let found = false;
    for (const activity of jsonObject) {
      if (newActivity.includes(activity)) {
        found = true;
      }
    }
    if (found) {
      await interaction.reply("This activity already exists, try another one!");
    } else {
      forbiddenActivityList.push(newActivity);
      saveForbiddenActivityList();
      await interaction.reply(
        `${newActivity} was added to the forbidden activity list`
      );
    }
  } else {
    await interaction.reply(
      `${newActivity} was added to the forbidden activity list`
    );
    forbiddenActivityList.push(newActivity);
    saveForbiddenActivityList();
  }
}

/**
 * Get and validate user activities (custom status)
 * @param {*} newMember
 * @param {*} status
 */
async function handleCustomStatus(newMember, status) {
  const customStatusText = status.state;
  // console.log(newMember.user.username);
  if (customStatusText.includes("anime" || "genshin" || "league of legends")) {
    await handleWarnings(newMember, status);
  }
}

async function initialiseForbiddenList() {
  forbiddenActivityList = JSON.parse(jsonDataRead);
  for (const acitivity of forbiddenActivityList) {
    console.log(`Banned Activity: ${acitivity} has been initialised`);
  }
}
/**
 * Handle actions for users with different number of warnings
 * @param {*} newMember memeber to handle
 * @param {*} status activity.state
 */
async function handleWarnings(newMember, status) {
  const guild = newMember.guild;
  await increaseWarning(newMember.user.username);
  console.log(newMember.user.username);
  let warning = await getNoOfWarning(newMember.user.username);
  switch (warning) {
    case 1: {
      console.log("Sent to " + newMember.user.username);
      await newMember.member.send(
        "Our systems have detected illicit activity from your account such as watching anime or playing felonious games, this is your first warning - let it be the last."
      );
      break;
    }
    case 2: {
      await newMember.member.send(
        "This is the second warning on your account. Please cease your nefarious actions to remain in our discord server."
      );
      break;
    }
    case 3: {
      await newMember.member.send(
        "This is your last warning - we DO NOT tolerate pedophilia or other impermissible activities. There will be no more warnings."
      );
      break;
    }
    case 4: {
      guild.members
        .ban(`${newMember.user.id}`, {
          reason: `Three strikes for playing: ${status}`,
        })
        .catch((err) => {
          console.error(err);
          var x = err.message;
        });
      break;
    }
  }
}

async function saveForbiddenActivityList() {
  const JSON_Data = JSON.stringify(forbiddenActivityList, null, 2);
  writeFileSync(jsonFilePath, JSON_Data)
}

/**
 * Get all user names from guild and add to listOfUsers hashmap
 * @param {*} guild
 */
async function getAllUserNamesFromGuild(guild) {
  await guild.members.fetch();
  const usernames = guild.members.cache.map((member) => member.user.username);
  // console.log('Usernames in the guild:', usernames.join(', '));
  for (user of usernames) {
    listOfUsers[user] = { name: user, warning: 0 };
  }
}

/**
 * Get the number of warnings the user has
 * @param {*} userName key
 * @returns number of warnings of specified user
 */
async function getNoOfWarning(userName) {
  try {
    const jsonObject = JSON.parse(jsonDataRead);
    let warning = 0; // Default value in case user doesn't have any warnings
    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key) && key === userName) {
        const record = jsonObject[key];
        warning = record.warning;
        break; // If you want to get the first warning and exit the loop, you can keep this break statement
      }
    }
    return warning; // Return the warning after the loop
  } catch (error) {
    console.error("Error reading userWarning.json:", error);
    return 0; // Return 0 in case of error
  }
}

/**
 * Increase the warning of user, find user record in userWarning.json by username key
 * @param {*} userName key
 */
async function increaseWarning(userName) {
  const jsonObject = JSON.parse(jsonDataRead);
  for (const key in jsonObject) {
    if (jsonObject.hasOwnProperty(key)) {
      const record = jsonObject[key];
      // Check if the value of the 'name' property matches the search value
      if (record.name.toLowerCase() === userName.toLowerCase()) {
        record.warning += 1;
        break;
      }
    }
  }
  const updatedJSON = JSON.stringify(jsonObject, null, 2);
  writeFileSync(jsonFilePath, JSON_Data)
}

/**
 * Save user to JSON file
 * @param {*} user hashmap of user warning
 */
async function saveUserToJSON(user) {
  const JSON_Data = JSON.stringify(listOfUsers, null, 2);
  writeFileSync(jsonFilePath, JSON_Data)
}

// Exporting as default
export default {
  getAllUserNamesFromGuild,
  increaseWarning,
  getNoOfWarning,
  getUserDiscordActivity,
  handleCustomStatus,
  saveForbiddenActivityList,
  forbiddenActivityList,
  initialiseForbiddenList,
  removeActivityFromList,
  addToForbiddenActivityList,
};

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const forbiddenListPath = join(__dirname, "..", "json", "forbiddenActivityList.json");
const warningListPath = join(__dirname, "..", "json", "userWarning.json");

const listOfUsers = {};
let forbiddenActivityList = [];

function readJsonFile(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    console.error(`Failed to read JSON file at ${path}`, error);
    return fallback;
  }
}

function writeJsonFile(path, data) {
  try {
    writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to write JSON file at ${path}`, error);
  }
}

function loadWarnings() {
  const warnings = readJsonFile(warningListPath, {});
  return typeof warnings === "object" && warnings !== null ? warnings : {};
}

function saveWarnings(warnings) {
  writeJsonFile(warningListPath, warnings);
}

/**
 * Get and validate user activities (discord embed)
 * @param {*} newMember user
 */
async function getUserDiscordActivity(newMember) {
  if (!newMember || newMember.user?.bot) {
    return;
  }

  const activityList = newMember.presence?.activities || [];
  if (!activityList.length) {
    return;
  }

  for (const activity of activityList) {
    const activityName = (activity.name || "").toLowerCase();
    for (const forbiddenActivity of forbiddenActivityList) {
      if (activityName.includes(String(forbiddenActivity).toLowerCase())) {
        await handleWarnings(newMember, activity.state || activity.name || "unknown activity");
        return;
      }
    }
  }
}

async function removeActivityFromList(newActivity, interaction) {
  const normalizedActivity = String(newActivity || "").trim();
  if (!normalizedActivity) {
    await interaction.reply("Please provide a valid activity name.");
    return;
  }

  const found = forbiddenActivityList.some(
    (activity) => activity.toLowerCase() === normalizedActivity.toLowerCase()
  );

  if (found) {
    removeFromForbiddenActivityList(normalizedActivity);
    saveForbiddenActivityList();
    await interaction.reply(`${normalizedActivity} has been found and removed`);
  } else {
    await interaction.reply(`${normalizedActivity} was not found in the list try again`);
  }
}

function removeFromForbiddenActivityList(activityToRemove) {
  const filteredList = forbiddenActivityList.filter(
    (activity) => activity.toLowerCase() !== String(activityToRemove).toLowerCase()
  );
  forbiddenActivityList.splice(0, forbiddenActivityList.length, ...filteredList);
}

async function addToForbiddenActivityList(newActivity, interaction) {
  const normalizedActivity = String(newActivity || "").trim();
  if (!normalizedActivity) {
    await interaction.reply("Please provide a valid activity name.");
    return;
  }

  const found = forbiddenActivityList.some(
    (activity) => activity.toLowerCase() === normalizedActivity.toLowerCase()
  );

  if (found) {
    await interaction.reply("This activity already exists, try another one!");
    return;
  }

  forbiddenActivityList.push(normalizedActivity);
  saveForbiddenActivityList();
  await interaction.reply(`${normalizedActivity} was added to the forbidden activity list`);
}

/**
 * Get and validate user activities (custom status)
 * @param {*} newMember
 * @param {*} status
 */
async function handleCustomStatus(newMember, status) {
  const customStatusText = (status?.state || "").toLowerCase();
  const bannedKeywords = ["anime", "genshin", "league of legends"];
  if (bannedKeywords.some((keyword) => customStatusText.includes(keyword))) {
    await handleWarnings(newMember, status?.state || "custom status");
  }
}

async function initialiseForbiddenList() {
  forbiddenActivityList = readJsonFile(forbiddenListPath, []);
  for (const activity of forbiddenActivityList) {
    console.log(`Banned Activity: ${activity} has been initialized`);
  }
}

/**
 * Handle actions for users with different number of warnings
 * @param {*} newMember member to handle
 * @param {*} status activity.state
 */
async function handleWarnings(newMember, status) {
  const guild = newMember.guild;
  await increaseWarning(newMember.user.username);
  const warning = await getNoOfWarning(newMember.user.username);

  switch (warning) {
    case 1:
      await newMember.send(
        "Our systems have detected illicit activity from your account. This is your first warning."
      );
      break;
    case 2:
      await newMember.send(
        "This is the second warning on your account. Please stop prohibited activities to remain in the server."
      );
      break;
    case 3:
      await newMember.send(
        "This is your last warning. Continued violations will result in a ban."
      );
      break;
    default:
      if (warning >= 4) {
        await guild.members.ban(newMember.user.id, {
          reason: `Three strikes for activity: ${status}`,
        });
      }
      break;
  }
}

async function saveForbiddenActivityList() {
  writeJsonFile(forbiddenListPath, forbiddenActivityList);
}

/**
 * Get all user names from guild and add to listOfUsers hashmap
 * @param {*} guild
 */
async function getAllUserNamesFromGuild(guild) {
  await guild.members.fetch();
  const usernames = guild.members.cache.map((member) => member.user.username);
  for (const user of usernames) {
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
    const warnings = loadWarnings();
    const normalizedUserName = String(userName || "").toLowerCase();

    for (const key in warnings) {
      if (!Object.prototype.hasOwnProperty.call(warnings, key)) {
        continue;
      }
      const record = warnings[key];
      if (record?.name?.toLowerCase() === normalizedUserName || key.toLowerCase() === normalizedUserName) {
        return Number(record.warning || 0);
      }
    }

    return 0;
  } catch (error) {
    console.error("Error reading userWarning.json:", error);
    return 0;
  }
}

/**
 * Increase the warning of user, find user record in userWarning.json by username key
 * @param {*} userName key
 */
async function increaseWarning(userName) {
  const warnings = loadWarnings();
  const normalizedUserName = String(userName || "").toLowerCase();
  let found = false;

  for (const key in warnings) {
    if (!Object.prototype.hasOwnProperty.call(warnings, key)) {
      continue;
    }
    const record = warnings[key];
    if (record?.name?.toLowerCase() === normalizedUserName || key.toLowerCase() === normalizedUserName) {
      record.warning = Number(record.warning || 0) + 1;
      found = true;
      break;
    }
  }

  if (!found) {
    warnings[userName] = { name: userName, warning: 1 };
  }

  saveWarnings(warnings);
}

/**
 * Save user to JSON file
 * @param {*} user hashmap of user warning
 */
async function saveUserToJSON(user) {
  writeJsonFile(warningListPath, user || listOfUsers);
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
  saveUserToJSON,
};

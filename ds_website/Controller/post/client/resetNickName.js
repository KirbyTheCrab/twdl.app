import client from "../../../../ds_bot/main.js";
import changeClientNickName from "./changeNickName.js";
export default async function resetClientNickname(request, response) {

    changeClientNickName(request, response);
}
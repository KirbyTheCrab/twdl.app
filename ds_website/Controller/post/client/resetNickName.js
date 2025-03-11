import client from "../../../../ds bot/main.js";
import changeClientNickName from "./changeNickName.js";
export default async function resetClientNickname(request, response) {

    changeClientNickName(request, response);
}
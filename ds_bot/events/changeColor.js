function changeRoleColor(role) {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  // Ensure that the color is a valid 6-digit hexadecimal code
  const validColor = "0".repeat(6 - color.length) + color;
  role
    .setColor(`#${validColor}`)
    .then((update) => console.log(`Updated role color to #${validColor}`))
    .catch(console.error);
}

module.exports = {
  changeRoleColor
}
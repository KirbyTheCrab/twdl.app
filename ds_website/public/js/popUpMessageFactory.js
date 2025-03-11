/**
 * How to use
 * after a fetch call has been made either post or get
 * in the .then((response)=>{}) curly brackets paste
 * new PopUpMessage(response.message || response.error, response.message ? "ok" : "error");
    that is if then call returns a response.json({ok || error})
 */

export default class PopUpMessage {
  constructor(message, status) {
    const responseHTMLdiv = document.createElement("div");
    const responseText = document.createElement("p");
    responseText.textContent = message;
    responseHTMLdiv.classList.add("pop-up-message");
    responseText.classList.add("pop-up-message-text");
    responseHTMLdiv.appendChild(responseText);
    document.body.append(responseHTMLdiv);
    this.showPopUpMessage(responseHTMLdiv, responseText, status);
    setTimeout(() => {
      this.hidePopUpMessage(responseText, responseHTMLdiv);
    }, 5000);
  }

  /**
   *
   * @param {HTMLElement} popUpDiv "HTML element pop up div ID"
   * @param {string} responseText "response from fetch"
   * @param {string} status "ok" or "error"
   */
  showPopUpMessage(popUpDiv, responseText, status) {
    if (responseText.classList.contains("hidden")) {
      responseText.classList.remove("hidden");
    }
    responseText.classList.add("visible");
    if (status === "ok") {
      responseText.style.background = "rgba(0, 255, 0, 0.7)";
    } else if (status === "error") {
      responseText.style.background = "rgba(255, 0, 0, 0.7)";
    }
  }

  hidePopUpMessage(responseText, popUpDiv) {
    if (responseText.classList.contains("visible")) {
      responseText.classList.remove("visible");
    }
    responseText.classList.add("hidden");
    setTimeout(() => {
      popUpDiv.style.display = "none";
      popUpDiv.remove();
    }, 100);
  }
}

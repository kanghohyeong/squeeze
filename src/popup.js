'use strict';

import "./popup.css"
import { squeeze, setConfig } from "./openai.js"

const keyInput = document.getElementById("key_input");
keyInput.addEventListener("change", function () {
  setConfig(this.value);
});
chrome.storage.session.get(["openaiKey"]).then((result) => {
  if (result.openaiKey) {
    keyInput.value = result.openaiKey;
    setConfig(result.openaiKey);
  }
});

const languageInput = document.getElementById("language_input");
const languateList = ["Korean", "Chinese", "Spanish", "Russian", "Japanese"]
languateList.forEach((language) => {
  languageInput.insertAdjacentHTML("beforeend", `<option value=${language}>${language}</option>`);
});
var translatedLanguage = languageInput.value;

languageInput.addEventListener("change", function () {
  translatedLanguage = this.value;
});


const textArea = document.getElementById("text_input");
const textCntTag = document.getElementById("text_counter");

var memoryText = ""
const setDisplayText = (newText) => {
  textArea.value = newText;
  textCntTag.innerText = `${newText.length} / ${memoryText.length}`

}
const setMemoryText = (newText) => {
  memoryText = newText;
  textArea.value = newText;
  textArea.readOnly = true;
  textCntTag.innerText = `${newText.length} / ${memoryText.length}`
}
const resetWithErrorMessage = (message) => {
  memoryText = "";
  textArea.value = message;
  textArea.readOnly = false;
  textCntTag.innerText = "0 / 0";
}

var cnt = 0
const addCnt = () => {
  cnt++;
}
const resetCnt = () => {
  cnt = 0;
}

const squeezBtn = document.getElementById("squeeze_btn");
var isWorking = false;
const startWorking = () => {
  isWorking = true;
  squeezBtn.style.pointerEvents = "none";
  squeezBtn.classList.add("shaking")
  squeezBtn.src = "images/small_fish_resize.png"

}
const finishWorking = () => {
  isWorking = false;
  squeezBtn.style.pointerEvents = "";
  squeezBtn.classList.remove("shaking")
  squeezBtn.src = "images/normal_fish_resize.png"
}

squeezBtn.addEventListener("click", function () {
  startWorking();
  if (cnt === 0) {
    setMemoryText(document.getElementById("text_input").value);
  }
  addCnt();
  if (memoryText.length === 0) {
    resetCnt();
    resetWithErrorMessage("Give me some text here!");
    finishWorking();
    return;
  }

  squeeze(memoryText, cnt, translatedLanguage).then((squeezeText) => {
    setDisplayText(squeezeText);
  }).catch(error => {
    if (error.message === "no api key") {
      resetWithErrorMessage("please enter openai api key");
    } else if (error.message === "openai error") {
      resetWithErrorMessage("something wrong with openai api");
    } else {
      resetWithErrorMessage("unknown error")
    }
    resetCnt();
  }).finally(() => {
    finishWorking();
  })
});
squeezBtn.addEventListener("mouseover", function () {
  if (isWorking == false) {
    this.src = "images/big_fish_resize.png"
  }
});
squeezBtn.addEventListener("mouseout", function () {
  if (isWorking == false) {
    this.src = "images/normal_fish_resize.png"
  }
});
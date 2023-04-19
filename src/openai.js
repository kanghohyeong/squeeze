const { Configuration, OpenAIApi } = require("openai");

var openai = null;
const setConfig = function (apiKey) {
    chrome.storage.session.set({openaiKey: apiKey});
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    openai = new OpenAIApi(configuration);
}

const cleanText = (originText) => {
    return originText.replace(/\s+/g, ' ').trim();
}

const getSqueezeLength = (text, squeezeCnt) => {
    const wordCnt = text.split(" ").length;
    const length = parseInt(wordCnt / Math.pow(2, squeezeCnt))
    return length <= 0 ? 1 : length
}

const squeeze = async function (inputText, devideCnt, language) {

    if (openai === null) {
        throw new Error("no api key");
    }

    const targetText = cleanText(inputText)

    const targetLength = getSqueezeLength(targetText, devideCnt)

    var completion = null
    try{
        completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a sincere assistant. Performs the user's request without exception. Do not write explanations on replies." },
                { role: "user", content: `${inputText} \n ------------- \n make this text into approximately ${targetLength} words. Speak in ${language}.` }]
        });
    
    } catch (e) {
        throw new Error("openai error");
    }
    
    const data = completion.data.choices[0].message;
    return data.content;
}

export { squeeze, setConfig }
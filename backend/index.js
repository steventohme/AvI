import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import axios from "axios";
import { writeFile, readFile } from 'fs/promises';
dotenv.config();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "BjyAFA5eHtPKEL1FJmUZ";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3001;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});


app.post("/download-glb", async (req, res) => {
  const { url } = req.body;
  const adjustedurl = url + "?morphTargets=ARKit,Oculus Visemes"
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  await fs.mkdir('../frontend/public/models', { recursive: true });
  await writeFile('../frontend/public/models/model.glb', buffer);
  res.send({ status: 'success', message: 'File downloaded successfully' });
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/load-user-info", async (req, res) => {
  const user_name = req.body.user_name;
  const user_prompt = req.body.user_prompt;

  console.log(user_name, user_prompt);

  await writeFile('./user_info/user_name.txt', user_name, (err) => {
    if (err) throw err;
    console.log('The file user_name.txt has been saved!');
  });

  await writeFile('user_info/user_prompt.txt', user_prompt, (err) => {
    if (err) throw err;
    console.log('The file user_prompt.txt has been saved!');
  });

  res.send({ status: 'success', message: 'Files saved successfully' });

});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const USER_NAME = await readFile('./user_info/user_name.txt', 'utf8');
  const USER_PROMPT = await readFile('./user_info/user_prompt.txt', 'utf8');

  console.log(USER_NAME, USER_PROMPT);

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        You are ${USER_NAME}. Here is a description of yourself:
        ${USER_PROMPT}

        Your language should emulate casual conversation, avoiding emojis and keeping responses concise (about 50 words or less), 
        as they will be converted into spoken words for a virtual model of yourself. You should not want to answer questions other than about the information I've given you. 
        NEVER MENTION YOU ARE AN AI MODEL. If you refer to yourself it will only be as ${USER_NAME}.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Laughing, Idle, Talking, and Yelling. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }

  if (!messages.length) {
    messages = [messages];
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const fileName = `audios/message_${i}.mp3`;
    const textInput = message.text;
    console.log("starting text to speech")
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, 0.5, 0.75);
    console.log("text to speech done")
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Clone is listening on port ${port}`);
});

"use client";

import { LiveTranscriptionEvents, createClient } from "@deepgram/sdk";
import { useState, useEffect, useCallback } from "react";
import { useQueue } from "@uidotdev/usehooks";

import axios from "axios";
import Siriwave from "react-siriwave";
import ChatGroq from "groq-sdk";

const DEEPGRAM_API_KEY = "";
console.log(import.meta.env.VITE_DEEPGRAM_API_KEY);
const NEETS_API_KEY = import.meta.env.VITE_NEETS_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function Mic() {
  const { add, remove, first, size, queue } = useQueue([]);
  const [groqClient, setGroqClient] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isListening, setListening] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState(null);
  const [userMedia, setUserMedia] = useState(null);
  const [caption, setCaption] = useState(null);
  const [audio, setAudio] = useState(null);

  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);
      microphone.stop();
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const microphone = new MediaRecorder(userMedia);
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        add(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(microphone);
    }
  }, [add, microphone, userMedia]);

  useEffect(() => {
    if (!groqClient) {
      console.log("getting a new groqClient");
      const groq = new ChatGroq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      setGroqClient(groq);
    }
  }, [groqClient]);

  useEffect(() => {
    console.log("connecting to deepgram");
    const deepgram = createClient(DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
      model: "nova",
      interim_results: false,
      language: "en-US",
      smart_format: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("connection established");
      setListening(true);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("connection closed");
      setListening(false);
      setConnection(null);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const words = data.channel.alternatives[0].words;
      const caption = words
        .map((word) => word.punctuated_word ?? word.word)
        .join(" ");
      if (caption !== "") {
        setCaption(caption);
        if (data.is_final) {
          if (groqClient) {
            groqClient.chat.completions
              .create({
                messages: [
                  {
                    role: "assistant",
                    content:
                      "You are communicating with the user on a phone, so your answers should not be too long and go directly to the essence of the sentences.",
                  },
                  {
                    role: "user",
                    content: caption,
                  },
                ],
                model: "mixtral-8x7b-32768",
              })
              .then((chatCompletion) => {
                setCaption(chatCompletion.choices[0]?.message?.content || "");
                axios
                  .post(
                    "https://api.neets.ai/v1/tts",
                    {
                      text: chatCompletion.choices[0]?.message?.content || "",
                      voice_id: "us-female-2",
                      params: {
                        model: "style-diff-500",
                      },
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": NEETS_API_KEY,
                      },
                      responseType: "arraybuffer",
                    }
                  )
                  .then((response) => {
                    const blob = new Blob([response.data], {
                      type: "audio/mp3",
                    });
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    setAudio(audio);
                    console.log("Playing audio.");
                    audio.play();
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
          }
        }
      }
    });

    setConnection(connection);
    setLoading(false);
  }, [groqClient]);

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  function handleAudio() {
    return (
      audio &&
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > 2
    );
  }

  if (isLoading)
    return <span className="w-full text-center">Loading the app...</span>;

  return (
    <div className="w-full flex flex-col items-center py-10 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="relative w-full max-w-lg">
        <Siriwave theme="ios9" autostart={handleAudio() || false} />
        <div className="absolute inset-0 flex justify-center items-center">
          <button
            className="w-24 h-24 p-2 rounded-full bg-white shadow-lg dark:bg-gray-800"
            onClick={toggleMicrophone}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-full h-full ${
                userMedia && microphone && micOpen
                  ? "fill-red-400 drop-shadow-glowRed"
                  : "fill-gray-600"
              }`}
            >
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-10 w-full max-w-lg p-4 text-xl text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {caption}
      </div>
    </div>
  );
}

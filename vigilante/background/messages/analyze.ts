import type { PlasmoMessaging } from "@plasmohq/messaging";

// Utility function for converting a Blob to a base64 string.
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received tweet data in background:", req);
  const tweetData = req.body;
  
  // Extract required fields.
  const tweet_id = tweetData.id;
  const tweet_author = tweetData.mentionedUsers[0];
  console.log("Tweet author:", tweet_author);
  const tweet_text = tweetData.text;
  const timestamp = tweetData.date;
  let base64_image = "";

  // If a media URL exists, fetch the image and convert it to Base64.
  if (tweetData.media && tweetData.media.length > 0) {
    try {
      const imageUrl = tweetData.media[0];
      console.log("Fetching image from URL:", imageUrl);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      base64_image = await blobToBase64(blob);
      console.log("Image successfully converted to base64");
    } catch (error) {
      console.error("Error converting image to base64:", error);
    }
  }

  // Build the payload expected by the FastAPI server.
  const payload = {
    tweet_id,
    tweet_author,
    tweet_text,
    base64_image,
    timestamp
  };

  try {
    // TODO: Make this dynamic
    const API_URL = "http://localhost:8000";
    console.log("Sending payload to FastAPI:", payload, "at", API_URL + '/analyze_tweet');
    const apiResponse = await fetch(API_URL + '/analyze_tweet', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await apiResponse.json();
    console.log("Received response from FastAPI:", json);
    res.send(json);
  } catch (error) {
    console.error("Error sending payload to FastAPI:", error);
    res.send({ error: error.toString() });
  }
};

export default handler;

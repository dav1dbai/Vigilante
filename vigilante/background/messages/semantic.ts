import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received tweet text in background:", req);
  const tweet_text = req.body.text;
  const description = req.body.description;

  if (!description || !tweet_text) {
    console.error("Missing description or tweet data");
    res.send({ error: "Missing description or tweet data" });
    return;
  }

  // Build the payload expected by the FastAPI server.
  const payload = {
    description,
    tweet_text,
  };

  try {
    // TODO: Make this dynamic
    const API_URL = process.env.FASTAPI_URL || "http://localhost:8000";
    console.log("Sending payload to FastAPI:", payload, "at", API_URL + '/semantic_filter');
    const apiResponse = await fetch(API_URL + '/semantic_filter', {
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

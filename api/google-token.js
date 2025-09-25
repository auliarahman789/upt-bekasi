import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const client = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const token = await client.authorize();
    res.status(200).json({ accessToken: token.access_token });
  } catch (err) {
    console.error("Google auth error:", err); // <--- log in terminal
    res.status(500).json({ error: err.message });
  }
}

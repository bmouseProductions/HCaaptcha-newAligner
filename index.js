const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const hcaptchaSecret = "0xb6F0a1455503e6227156f727c41006605F0A6A80";

// Store votes in an array (in-memory)
const votes = [];

app.post("/api/vote", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token do hCaptcha ausente." });
  }

  try {
    const response = await axios.post("https://hcaptcha.com/siteverify", {
      response: token,
      secret: hcaptchaSecret,
    });

    const { success } = response.data;

    if (!success) {
      return res.status(403).json({ error: "Verificação do hCaptcha falhou." });
    }
  } catch (error) {
    console.error("Erro na verificação do hCaptcha:", error);
    return res.status(500).json({ error: "Erro na verificação do hCaptcha." });
  }

  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Store the vote in localStorage (in-memory)
  const vote = {
    hcaptcha_token: token,
    ip_address: ipAddress,
    data: new Date(),
  };

  votes.push(vote);

  res.status(200).json({ message: "Voto computado com sucesso!" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

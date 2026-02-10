const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

// Fibonacci
function fibonacci(n) {
  let series = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    series.push(a);
    [a, b] = [b, a + b];
  }
  return series;
}

// Prime check
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// GCD
function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// HCF
function hcf(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

// LCM
function lcmTwo(a, b) {
  return (a * b) / gcd(a, b);
}

function lcm(arr) {
  return arr.reduce((acc, val) => lcmTwo(acc, val));
}

// GET /health
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

// POST /bfhl
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    // must contain exactly 1 key
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Request must contain exactly one key: fibonacci, prime, lcm, hcf, AI"
      });
    }

    const key = keys[0];
    const value = body[key];

    // Fibonacci
    if (key === "fibonacci") {
      if (!Number.isInteger(value) || value <= 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "fibonacci must be a positive integer"
        });
      }

      return res.status(200).json({
        is_success: true,
        official_email: EMAIL,
        data: fibonacci(value)
      });
    }

    // Prime
    if (key === "prime") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "prime must be a non-empty array of integers"
        });
      }

      const primes = value.filter((x) => Number.isInteger(x) && isPrime(x));

      return res.status(200).json({
        is_success: true,
        official_email: EMAIL,
        data: primes
      });
    }

    // LCM
    if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "lcm must be a non-empty array of integers"
        });
      }

      const valid = value.every((x) => Number.isInteger(x) && x > 0);
      if (!valid) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "lcm array must contain only positive integers"
        });
      }

      return res.status(200).json({
        is_success: true,
        official_email: EMAIL,
        data: lcm(value)
      });
    }

    // HCF
    if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "hcf must be a non-empty array of integers"
        });
      }

      const valid = value.every((x) => Number.isInteger(x) && x > 0);
      if (!valid) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "hcf array must contain only positive integers"
        });
      }

      return res.status(200).json({
        is_success: true,
        official_email: EMAIL,
        data: hcf(value)
      });
    }

    // AI
    // AI
if (key === "AI") {
  if (typeof value !== "string" || value.trim().length === 0) {
    return res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: "AI must be a non-empty string"
    });
  }

  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const geminiResponse = await axios.post(geminiUrl, {
    contents: [
      {
        parts: [{ text: `Answer in one word only: ${value}` }]
      }
    ]
  });

  let answer =
    geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";

  answer = answer.trim().split(" ")[0];

  return res.status(200).json({
    is_success: true,
    official_email: EMAIL,
    data: answer
  });
}

    // Invalid Key
    return res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: "Invalid key. Use fibonacci, prime, lcm, hcf, or AI"
    });

} catch (error) {
  console.log("AI Error:", error.response?.data || error.message);

  return res.status(500).json({
    is_success: false,
    official_email: EMAIL,
    error: "AI service failed"
  });
}

});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

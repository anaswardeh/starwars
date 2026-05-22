// Dependencies
// =============================================================
const express = require("express");
const path = require("path");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Star Wars Characters (DATA)
// =============================================================
const characters = [
  {
    routeName: "yoda",
    name: "Yoda",
    role: "Jedi Master",
    age: 900,
    forcePoints: 2000
  },
  {
    routeName: "darthmaul",
    name: "Darth Maul",
    role: "Sith Lord",
    age: 200,
    forcePoints: 1200
  },
  {
    routeName: "obiwankenobi",
    name: "Obi Wan Kenobi",
    role: "Jedi Master",
    age: 55,
    forcePoints: 1350
  }
];

// Helpers
// =============================================================
function toRouteName(name) {
  return name.replace(/\s+/g, "").toLowerCase();
}

function findCharacter(routeName) {
  return characters.find(function(character) {
    return character.routeName === routeName;
  });
}

// Validates and normalizes the body of a create-character request.
// Returns { character } on success or { error } on failure.
function parseNewCharacter(body) {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";

  if (!name) {
    return { error: "A non-empty 'name' is required." };
  }
  if (!role) {
    return { error: "A non-empty 'role' is required." };
  }

  const age = Number(body.age);
  const forcePoints = Number(body.forcePoints);

  if (!Number.isFinite(age) || age < 0) {
    return { error: "'age' must be a non-negative number." };
  }
  if (!Number.isFinite(forcePoints) || forcePoints < 0) {
    return { error: "'forcePoints' must be a non-negative number." };
  }

  return {
    character: {
      routeName: toRouteName(name),
      name: name,
      role: role,
      age: age,
      forcePoints: forcePoints
    }
  };
}

// Routes
// =============================================================

// Basic route that sends the user first to the view page
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "view.html"));
});

app.get("/add", function(req, res) {
  res.sendFile(path.join(__dirname, "add.html"));
});

// Displays all characters
app.get("/api/characters", function(req, res) {
  res.json(characters);
});

// Displays a single character, or returns a 404
app.get("/api/characters/:character", function(req, res) {
  const chosen = findCharacter(req.params.character);

  if (!chosen) {
    return res.status(404).json({ error: "Character not found." });
  }

  res.json(chosen);
});

// Create New Characters - takes in JSON input
app.post("/api/characters", function(req, res) {
  const result = parseNewCharacter(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  if (findCharacter(result.character.routeName)) {
    return res.status(409).json({ error: "A character with that name already exists." });
  }

  characters.push(result.character);
  res.status(201).json(result.character);
});

// Catch-all for unknown routes
app.use(function(req, res) {
  res.status(404).json({ error: "Resource not found." });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});

const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let filePath = path.join(__dirname, "cricketTeam.db");
let db = null;
initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at 3000 port");
    });
  } catch (e) {
    console.log(`The program is shut due to ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.use(express.json());
app.get("/players/", async (request, response) => {
  const sqlquery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id`;
  const players = await db.all(sqlquery);
  response.send(
    players.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const creatingsql = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES (
        '${playerName}','${jerseyNumber}','${role}'
    )`;
  await db.run(creatingsql);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const gettingsql = `
    SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};`;
  const player_details = await db.get(gettingsql);
  response.send(
    player_details.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const data = request.body;
  const { playerName, jerseyNumber, role } = data;
  const puttingsql = `
    UPDATE cricket_team
    SET
    playerName='${playerName}',
    jerseyNumber='${jerseyNumber}',
    role='${role}'
    WHERE player_id='${playerId}';`;
  await db.run(puttingsql);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleting = `
    DELETE FROM cricket_team
    WHERE player_id=${playerId}`;
  await db.run(deleting);
  response.send("Player Removed");
});

module.exports = app;

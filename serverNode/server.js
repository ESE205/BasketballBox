// import appropriate modules

// mysql module, for mysql requests
const mysql = require('mysql');

// util, to allow us to use async/await
// util is built in to nodejs, so we don't have to install it
const utils = require('util');

// axios, to make API requests
const axios = require('axios');

// express, to maintain our API server
const express = require('express');

// API post body middleware
const bodyParser = require('body-parser');

// local json file with important data/global constants
const config = require('./config.json');

// initialize our API server
const app = express();

// POST body middleware (parses POST body to json for use in routes)
app.use(bodyParser.json());

// establish mysql connection settings
const conn = mysql.createConnection({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase
});

// make conn.query a promise, this allows us to use 'await' instead of a callback
// don't worry about the details of this, just include this line
// now instead of using 'conn.query(query, params, callback)' we'll use 'await query'
const query = utils.promisify(conn.query).bind(conn);

// connect to our mysql database
conn.connect((err) => {
    if (err) {
        console.log('Unable to connect to mysql');
        throw err;
    }
});


// match base route to index.html
// this is a basic express route. the general format is app.get(routeString, callback)
// where 'get' is the HTTP method (i.e. GET/POST/PUT),
// routeString is a string starting with / and 
// callback includes at least two params: (request, response)
app.get('/', (req, res) => {
    // intercepts requests to localhost:PORT/, and renders our index page
    // __dirname is a special nodejs variable containing the current directory path
    res.sendFile(`${__dirname}/public/index.html`);
});

//route to send basic data when called
//get request has two parameters: the request type (get, post, etc.) 
//and the (req, res) body
app.post('/transmit', function (req, res) {
     console.log('basic API route works');
     //res.send('hello world this is my basic API route');
     console.log(req.body);
     res.send("okay");
});

//retreives all hits sustained by that player
//currently just returns that player's first and last name, if they exist
app.get('/getPlayer/:playerID', async (req, res) => {
	console.log("Searching for player number " + req.params.playerID);
	let qString = 'SELECT * FROM players WHERE id = ?';
	const response = await query(qString, [req.params.playerID]);
	if(response.length==0){
		console.log("couldn't find a player with that ID");
		res.send("no player with that ID");
	}
	else{
		console.log("found a player with that ID");
		res.json({
			"first name": response[0].f_name,
			"last name": response[0].l_name
		});
		console.log("returning player number " + req.params.playerID + " with name " + response[0].f_name + " " + response[0].l_name);
	}
});


//retreives all hits sustained by that player over a certain threshold
app.get('/getPlayer/:playerID/:hitThreshold', async (req, res) => {
	let threshold = parseInt(req.params.hitThreshold,10);
	let qString = 'SELECT * FROM hits WHERE player_id = ? AND avg_force > ?'
	const response = await query(qString, [req.params.playerID, threshold]);
	if(response.length==0){
		res.send("no player with that ID with hits of that threshold");
	}
	else{
		res.send("here's the response from sql: " + response[0].f_name + response[0].l_name);
	}
});

app.get('/getTeam/:teamID', async (req, res) => {
	console.log("Searching for players on team " + req.params.teamID);
	let qString = 'SELECT players.f_name, players.l_name, players.id FROM teams LEFT JOIN players ON teams.id=players.team WHERE teams.id = ?';
	const response = await query(qString, [req.params.teamID]);
	if(response.length==0){
		res.send("no player with that ID with hits of that threshold");
	}
	else{
		console.log("Number of players on this team " + response.length);
		res.json({
			"players": response
		});	
	
	}
});

// match all file requests to public folder (this allows js/css links in your html)
// this means to get to our index page, you can either go to localhost:PORT/ or localhost:/PORT/index.html
app.get('/:filename', (req, res) => {
    res.sendFile(`${__dirname}/public/${req.params.filename}`);
});


// run our express server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
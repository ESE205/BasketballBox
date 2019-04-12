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

app.post('/receiveData', (req, res) => {
	console.log(req.body.data);
	console.log("data received:");
	let data = req.body.data;
	for(hit = 0; hit < data.length; hit++){
		let x = data[hit].xAxis;
		let y = data[hit].yAxis;
		let z = data[hit].zAxis;
		let timestamp = data[hit].timestamp;
		console.log("\n x: " + x + "\n y: " + y + "\n z:" + z);
		sendToMySql(1, timestamp, x, y, z);
	}
});

async function sendToMySql(playerID, timestamp, x, y, z) {
	let qString = 'INSERT INTO hits (player_id, marked_bad, timestamp, x_axis, y_axis, z_axis) values (?, false, ?, ?, ?, ?)';
	await query(qString, [playerID, timestamp, x, y, z]);
};

// match all file requests to public folder (this allows js/css links in your html)
// this means to get to our index page, you can either go to localhost:PORT/ or localhost:/PORT/index.html
app.get('/:filename', (req, res) => {
    res.sendFile(`${__dirname}/public/${req.params.filename}`);
});


// run our express server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
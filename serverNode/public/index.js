console.log("Hello from index.js!");

async function searchTeam(){
	console.log("Hello from team search!");

	//retreives the teamID to search for from the input text box
	const teamID = document.getElementById('team-search-box').value;

	//fetches team members and logs the response
	const teamMembers = await fetch(`/getTeam/${teamID}`);
	console.log(teamMembers);
	
	//parses the JSON response
	const data = await teamMembers.json();
	console.log("received response");
	console.log(data);
	const players = data.players;	

	//adds table of players to webpage
	let htmlString = "<tr><th>ID</th><th>First Name</th><th>Last Name</th></tr>"
	//updates table with results
	for(i = 0; i < players.length; i++){
		htmlString += "<tr><td>" + players[i].id + "</td><td>" + players[i].f_name + "</td><td>" + players[i].l_name + "</td></tr>"
	}
	const resultsTable = document.getElementById("team-results");
	resultsTable.innerHTML = htmlString;
	
	//remove welcome message from top
	document.getElementById("team-results").classList.remove("hidden");
	document.getElementById("welcome").classList.add("hidden");
	document.getElementById("player-results").classList.add("hidden");
}

document.getElementById("team-submit").addEventListener("click", searchTeam);

async function searchPlayer(){
	console.log("Hello from player search!");
	const playerID = document.getElementById('player-search-box').value;
	const player = await fetch(`/getHits/${playerID}`);
	console.log(player);
	const data = await player.json();
	console.log("received response");
	console.log(data);
	const hits = data.hits; 
	
	//adds table of hits to webpage
	let htmlString = "<tr><th>X</th><th>Y</th><th>Z</th><th>timestamp</th></tr>"
	//updates table with results
	for(i = 0; i < hits.length; i++){
		htmlString += "<tr><td>" + hits[i].x_axis + "</td><td>" + hits[i].y_axis + "</td><td>" + hits[i].z_axis + "</td><td>" + hits[i].timestamp + "</td></tr>"
	}
	const resultsTable = document.getElementById("player-results");
	resultsTable.innerHTML = htmlString;
	
	//remove welcome message from top
	document.getElementById("player-results").classList.remove("hidden");
	document.getElementById("welcome").classList.add("hidden");
	document.getElementById("team-results").classList.add("hidden");
}

document.getElementById("player-submit").addEventListener("click", searchPlayer);

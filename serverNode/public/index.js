console.log("Hello from index.js!");

async function searchTeam(){
	console.log("Hello from team search!");

	//retreives the teamID to search for from the input text box
	const teamID = document.getElementById('team-search').value;

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
}

document.getElementById("team-submit").addEventListener("click", searchTeam);

async function searchPlayer(){
	console.log("Hello from player search!");
	const playerID = document.getElementById('player-search').value;
	const player = await fetch(`/getPlayer/${playerID}`);
	console.log(player);
	const data = await player.json();
	console.log("received response");
	console.log(data);
}

document.getElementById("player-submit").addEventListener("click", searchPlayer);
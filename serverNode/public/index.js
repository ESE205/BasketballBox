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
	if(players.length == 0){
		alert("No team with this ID found");
	}
	else{
		//adds table of players to webpage
		let htmlString = "<tr><th>ID</th><th>First Name</th><th>Last Name</th></tr>"
		//updates table with results
		for(i = 0; i < players.length; i++){
			htmlString += "<tr><td>" + players[i].id + "</td><td>" + players[i].f_name + "</td><td>" + players[i].l_name + "</td></tr>"
		}
		const resultsTable = document.getElementById("team-results-table");
		resultsTable.innerHTML = htmlString;
	}
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
	console.log("player");
	console.log(player);
	const data = await player.json();
	console.log("received response");
	console.log(data);
	const hits = data.hits; 
	if(hits.length==0){
		console.log("adding no such player paragraph");
		alert("No player with this ID found");
	}
	else{
		//adds table of hits to webpage
		let htmlString = "<tr><th>max</th><th>avg</th><th>timestamp</th></tr>"
		//updates table with results
		for(i = 0; i < hits.length; i++){
			date = new Date(hits[i].timestamp);
			htmlString += "<tr><td>" + hits[i].max_force + "</td><td>" + hits[i].avg_force + "</td><td>" + date + "</td></tr>"
		}
		const resultsTable = document.getElementById("player-results-table");
		resultsTable.innerHTML = htmlString;

		//ADD CHART TO WEBPAGE
		addChart(hits)
	}
	//remove welcome message from top
	document.getElementById("player-results").classList.remove("hidden");
	document.getElementById("welcome").classList.add("hidden");
	document.getElementById("team-results").classList.add("hidden");
}

document.getElementById("player-submit").addEventListener("click", searchPlayer);

function addChart(hits){
	var dataSet = []

	for(i = 0; i < hits.length; i++){
		dataSet.push({
			x:hits[i].timestamp,
			y:new Date(hits[i].max_force)
		});
	}
	
	var options = {
		responsive: true,
		scales: {
			xAxes:[{
				ticks: {
					callback: function(label, index, labels){
						var date = new Date(label);
						return (date.getYear()+1900) + "-" + (date.getMonth()+1) + "-" + date.getDate();
					}
				}
			}]
		}
	};	

	//access chart element by ID
	var chart = document.getElementById("player-results-chart");
	var myChart = new Chart(chart, {
		type: "scatter", 
		data: {
			datasets: [{
				label: "Hits",
				data: dataSet,
			}]
		}, 
		options: options
	});
}

async function thresholdFilter(){
	console.log("Hello from filter by threshold!");

	//retreives the playerID to search from the input text box
	const playerID = document.getElementById('player-search-box').value;

	//retreives the threshold to limit by from the input text box
	const threshold = document.getElementById('threshold-filter-text-box').value;

	//fetches team members and logs the response
	const player = await fetch(`/getHits/${playerID}/max/${threshold}`);
	console.log(player);
	
	const data = await player.json();
	console.log("received response");
	console.log(data);
	const hits = data.hits; 
	if(hits.length == 0){
		alert("No hits above this threshold");
	}
	else{
		//adds table of hits to webpage
		let htmlString = "<tr><th>max</th><th>avg</th><th>timestamp</th></tr>"
		//updates table with results
		for(i = 0; i < hits.length; i++){
			date = new Date(hits[i].timestamp);
			htmlString += "<tr><td>" + hits[i].max_force + "</td><td>" + hits[i].avg_force + "</td><td>" + date + "</td></tr>"
		}
		const resultsTable = document.getElementById("player-results-table");
		resultsTable.innerHTML = htmlString;

		//ADD CHART
		addChart(hits);
	}
	//remove welcome message from top
	document.getElementById("player-results").classList.remove("hidden");
	document.getElementById("welcome").classList.add("hidden");
	document.getElementById("team-results").classList.add("hidden");
}

document.getElementById("threshold-filter-submit").addEventListener("click", thresholdFilter);

async function timeFilter(){
	console.log("Hello from filter by time!");

	//retreives the playerID to search from the input text box
	const playerID = document.getElementById('player-search-box').value;

	//retreives the threshold to limit by from the input text box
	const timeAsDate = document.getElementById('time-filter-text-box').value;
	
	const timeAsUnix = new Date(timeAsDate).getTime() /1000;
	
	console.log(timeAsUnix);

	//fetches team members and logs the response
	const player = await fetch(`/getHits/${playerID}/time/${timeAsUnix}`);
	console.log(player);
	const data = await player.json();
	console.log("received response");
	console.log(data);
	const hits = data.hits; 
	if(hits.length == 0){
			alert("No hits past this date");
	}
		else{
		//adds table of hits to webpage
		let htmlString = "<tr><th>max</th><th>avg</th><th>timestamp</th></tr>"
		//updates table with results
		for(i = 0; i < hits.length; i++){
			date = new Date(hits[i].timestamp);
			htmlString += "<tr><td>" + hits[i].max_force + "</td><td>" + hits[i].avg_force + "</td><td>" + date + "</td></tr>"
		}
		const resultsTable = document.getElementById("player-results-table");
		resultsTable.innerHTML = htmlString;

		//ADD CHART
		addChart(hits);
	}
	//remove welcome message from top
	document.getElementById("player-results").classList.remove("hidden");
	document.getElementById("welcome").classList.add("hidden");
	document.getElementById("team-results").classList.add("hidden");
}

document.getElementById("time-filter-submit").addEventListener("click", timeFilter);

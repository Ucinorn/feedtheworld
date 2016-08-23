window.onload = function() {
	if (!store.enabled) {
		alert('Local storage is not supported by your browser. You will be UNABLE to save or load your game. Please disable "Private Mode", or upgrade to a modern browser. ')
		return;
	}
	window.save = function() {
		console.log('saving game');
		// A manual ssave objct is neccesary because the nested game objects contain circular references.
		// they chould be parsed to JSOn with JSON.stringify before being passed to store.js, but why bother?
		// By forcing the user to unlock and 'buy' each upgrade on startup, we can add balance changes wiping saves.
		var savearray = [];
		nations.forEach(function(n) {
			var values = {
				population: n.population,
				day: n.day,
				discoveries: n.discoveries,
				births: n.births.value,
				deaths: n.deaths.value,
				land: n.land.value,
				water: n.water.value,
				research: n.research.value,
			}
			var saveindustries = {};
			n.industries.forEach(function(i) {
				if (i.unlocked === true) {
					saveindustries[i.name] = {};
					saveindustries[i.name].unlocked = true;
					if (i.trained > 0) {
						saveindustries[i.name].trained = i.trained;
					}
				}
			});
			var saveupgrades = {};
			n.upgrades.forEach(function(u) {
				if (u.count > 0) {
					saveupgrades[u.name] = {};
					saveupgrades[u.name].count = u.count;
				}
			});
			savearray.push({
				'name': n.name,
				'values': values,
				'industries': saveindustries,
				'upgrades': saveupgrades,
			});
			console.log(savearray);
		});
		store.set('feedtheworld', savearray);
	};

	window.load = function() {
		var save = store.get('feedtheworld');
		if (save) {
			console.log('Found Saved Game, loading...');
			save.forEach(function(n) {
				
				console.log(n);
				var target = fetch(nations, n.name);
				target.population = n.values.population;
				target.day = n.values.day;
				target.discoveries = n.values.discoveries;
				target.births.value = n.values.births;
				target.deaths.value = n.values.deaths;
				target.land.value = n.values.land;
				target.water.value = n.values.water;
				target.research.value = n.values.research;
				
				// unlock all purchased industries
				for (var i in n.industries) {
					var targetindustry = fetch(target.industries, i);
					console.log("unlocking " + i);
					targetindustry.unlock(0);
					// reset the number of trained people in an industry.
					targetindustry.trained = n.industries[i].trained;
				}
				// loop through upgrades and re-buy them as many times as they have been bought. 
				console.log(n.upgrades);
				for (var u in n.upgrades) {
					var targetupgrade = fetch(target.upgrades, u);
					var count = n.upgrades[u].count;
					for (i = 0; i <= count; i++) {
						console.log("buying" + targetupgrade.name);
						targetupgrade.buy(0);
					}
				}
			})
		} else {
			console.log('No save found!');
		}
	};

	window.clearsave = function(){
		store.clear();
		window.start();
 }
	
	window.start();
};


window.start = function() {
	var intervalsPerSecond = 50;
	var intervaltime = (1000 / intervalsPerSecond);
	var startloop = function(nation) {
		// Kick the loops to set initial values
		nation.update;
		nation.tick;


		// loop through the whole structure looking for value and resource models. Calling refresh on them ensures that their initial values are correct
		for (var propt in nation) {
			if (nation[propt] instanceof val || nation[propt] instanceof res) {
				//console.log('refreshing nation' + propt);
				nation[propt].refresh();
			}
		}
		nation.industries.forEach(function(industry) {
			for (var industrypropt in industry) {
				if (industry[industrypropt] instanceof val || nation.industries[industrypropt] instanceof res) {
					//console.log('refreshing industry' + industrypropt);
					industry[industrypropt].refresh();
				}
			}
		})
		nation.upgrades.forEach(function(upgrade) {
			for (var upgradepropt in upgrade) {
				if (upgrade[upgradepropt] instanceof val || upgrade[upgradepropt] instanceof res) {
					//console.log('refreshing upgrade' + upgradepropt);
					upgrade[upgradepropt].refresh();
				}
			}
		})

		// load static values and unlock/buy all the upgrades and industries from the save file
		window.load();

		//start loops
		setInterval(nation.update, 1000);
		setInterval(nation.tick, intervaltime);
		
		setInterval(function() {
			window.save();
		}, 300000);
	};
	// we don't have multiple nations for now, but maybe someday we will.
	nations.forEach(function(nation) {
		startloop(nation);
	});


	//bind elements for display after 1 second delay.
	window.setTimeout(function() {
		//We are using nested models, so we only need one binding. Rivets Efficiency!
		var el = document.getElementById('nations');
		rivets.bind(el, {
			nations: nations
		});

	}, 1000);
	window.gameon = true;
};
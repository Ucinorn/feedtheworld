function fetch(container, name) {
	for (var i = 0; i < container.length; i++) {
		if (container[i].name == name)
			return container[i];
	}
}

function round(x, digits) {
	if (digits) {
		return parseFloat(x.toFixed(digits));
	} else {
		return parseFloat(x.toFixed(2));
	}
}

// be very careful with this!!!
function boundeval(currentvalue, index, array) {
	return eval(currentvalue);
}

// Monkey-patch functions passed to all models. 
// The init() function is sacred and is ignored.
function monkeypatch(atts, init) {
	if (atts instanceof Object) {
		for (var key in atts) {
			if (typeof(atts[key]) === 'function' && key !== 'init') {
				// monkey patch new function to old function.
				var oldfunction = this[key];
				var newfunction = atts[key];
				// no arguments passed but we can use .arguments to pass them in future if we need to
				this[key] = function() {
					oldfunction.apply(this);
					newfunction.apply(this);
				}.bind(this);
			}
		}
	}
}

// a simple model that stores a value, but can be effected by multipliers.
var val = function val(attributes) {
	this.value = 1;
	this.base = 1;
	this.rate = 1;
	this.multiplier = 1;
	this.multis = {
		'base': [1]
	};

	//initialisation script. This pulls any function passed when the models are built. 
	if (typeof attributes == 'object' && typeof attributes.init == 'function') {
		attributes.init.apply(this);
		this.firstbase = this.base;
	}

	// refresh multipliers when rates and multipliers change. This should be called in the helper function below
	this.refresh = function() {
		var multiplier = 0;
		for (var multi in this.multis) {
			// Each multiplier group is added to each other
			// The base multiplier is ADDITIVE, ie. each multiplier is added together
			// All named multipliers are CUMULATIVE, ie. each muiltiplier is multiplied by the next one
			if (multi === 'base') {
				multiplier += this.multis[multi].reduce(function(a, b) {
					return a + b;
				});
			} else {
				multiplier += this.multis[multi].reduce(function(a, b) {
					// add 1 to the second multiplier to ensure it acts as a percentage for calculation
					// this is beacsue all multiplier are supplied as decimals ie. 0.1 or 2.4 equals 10% or 240%
					return round(a * (1 + b));
				});
			}
			this.multiplier = multiplier;
			this.value = +(this.base * this.multiplier);
			// this might seem unnessesary but some legacy fnction use rate as the value. 
			// Hangover from when val() and res() where one model
			this.rate = this.value;
		}
	}

	//add a generic base multipler or name it if you want to remove or modify it late
	// the base group is ADDITIVE, ie.( 1 + 0.1 + 0.2 = 130% )
	// any NAMED groups are cumulative ie.( 1 * 0.1 * 0.2 = 132% )
	// All groups are added up 
	this.addmulti = function(amount, name) {
		if (amount !== undefined) {
			if (name === undefined) {
				console.log('Applying multiplier to base')
				this.multis.base.push(amount);
			} else {
				console.log('Applying cumulative named multipler: ' + name)
				if (this.multis[name]) {
					this.multis[name].push(amount);
				} else {
					this.multis[name] = [amount];
				}
			}
		} else {
			console.log('attempted to apply a multiplier without an amount!')
		}
		this.refresh.apply(this);
	}

	this.setmulti = function(amount, name) {
		if (amount !== undefined) {
			if (name === undefined) {
				console.log('No name supplied, can set or reset a multi')
			} else {
				this.multis[name] = [amount];
			}
		} else {
			console.log('attempted to apply a multiplier without an amount!')
		}
		this.refresh.apply(this);
	}

	this.add = function(amount) {
		if (amount === undefined) {
			this.value--;
		} else if (amount > 0) {
			this.value += amount;
		}
	}

	this.take = function(amount) {
		if (amount === undefined) {
			this.value--;
		} else if (amount > 0) {
			this.value -= amount;
		}
	}

	this.refresh.apply(this);

	//monkey patch all other functions
	monkeypatch.apply(this, [attributes]);

}.bind(this);


var res = function res(attributes) {
	this.value = 0;
	this.base = 1;
	this.multiplier = 1;
	this.rate = 1;
	this.multis = {
		'base': [1]
	};

	//initialisation script. This pulls any function passed when the models are built. 
	if (typeof attributes == 'object' && typeof attributes.init == 'function') {
		attributes.init.apply(this);
		this.firstbase = this.base
	}

	// refresh multipliers when rates and multipliers change. This should be called in the helper function below
	this.refresh = function() {
		var multigroup = [];
		for (var multi in this.multis) {
			multigroup.push(this.multis[multi].reduce(function(a, b) {
				return a + b;
			}));
		}
		this.multiplier = multigroup.reduce(function(a, b) {
			return a + b;
		});
		this.rate = +(this.base * this.multiplier);
	}

	//add a generic base multipler or name it if you want to remove or modify it late
	// the base group is ADDITIVE, ie.( 1 + 0.1 + 0.2 = 130% )
	// any NAMED groups are cumulative ie.( 1 * 0.1 * 0.2 = 132% )
	// All groups are added up 
	this.addmulti = function(amount, name) {
		if (amount !== undefined) {
			if (name === undefined) {
				console.log('Applying multiplier to base')
				this.multis.base.push(amount);
			} else {
				console.log('Applying cumulative named multipler: ' + name)
				if (this.multis[name]) {
					this.multis[name].push(amount);
				} else {
					this.multis[name] = [amount];
				}
			}
		} else {
			console.log('attempted to apply a multiplier without an amount!')
		}
		this.refresh.apply(this);
	}

	this.setmulti = function(amount, name) {
		if (amount !== undefined) {
			if (name === undefined) {
				console.log('No name supplied, can set or reset a multi')
			} else {
				this.multis[name] = [amount];
			}
		} else {
			console.log('attempted to apply a multiplier without an amount!')
		}
		this.refresh.apply(this);
	}

	this.inc = function(amount) {
		if (typeof amount === 'number') {
			this.value += +(amount * this.rate);
		} else {
			this.value += this.rate;
		}
	}

	this.add = function(amount) {
		if (amount === undefined) {
			this.value--;
		} else if (amount > 0) {
			this.value += amount;
		}
	}

	this.take = function(amount) {
		if (amount === undefined) {
			this.value--;
		} else if (amount > 0) {
			this.value -= amount;
		}
	}

	this.refresh.apply(this);

	//monkey patch all other functions
	monkeypatch.apply(this, [attributes]);
}.bind(this);



// Nation model - pasds attributes as an object. Function attribites will overwrite existing model function. 
var nation_model = function nation_model(attributes) {

	//static attributes
	this.day = 0;
	this.dayrate = 1; // Increase this to increase the number of days per tick. Just remember to 
	this.daysSinceUpdate = 0;
	this.dayspersecond = 50;
	this.year = 0;
	this.yearlength = 365;
	this.name = '';
	this.food = 1;
	// sets the point at which society decides it has 'enough' food. 
	// TODO
	// Starvation events cause people to become more cautious, overproducing food 
	// Good times causes this to decay as people get more confident, causing more workers to be freed up. 
	this.foodbuffer = 1.10;
	// discovered biomes, animals, plants and features. As your nation grows, you will gain access to these through exploration, unlocks and 
	this.discoveries = {
		ocean: false,
		river: false,
		mountains: false,
		tundra: false,
		arctic: false,
		wheat: false,
		dogs: false,
		cows: false,
		horses: false,
	}

	this.population = 1;
	// the amount of people capable of working in the food production industry. This starts very high; almost all people work from the age of 4 or 5 to their death at 25 to 30
	// this gradually reduces as childhood is invented and education becomes standardised. 
	this.participation = 1;
	// the missing value is used for things like exploration where people leave and come back. 
	this.missing = 0;
	// the base population growth rate for most of history was 0.05%. it peaked in the 70s at 2% and now rests around 1.1%
	this.births = new res({
		init: function() {
			this.base = 0.045; // 45 births per thousand people per year, or a population growth rate of 4.5%. 4.5% is pretty much constant breeding from puberty till death at 35. Modern nations end up around 1.0% or lower.
		}
	});
	this.deaths = new res({
		init: function() {
			this.base = 0.044; // 44 deaths per thousand PEOPLE per year or a population growth rate of -4.4%. This is very high in early history, but reduces dramtically to less than 0.7% as food is plentiful
		}
	});
	this.land = new res({
		init: function() {
			this.value = 10000; // Usable land in square kilometres. Currently the size of a small valley nation. This is enough for nomadic tribes, but becomes a bottleneck as population grows. 
			this.base = 100; // the basic increase in land from exploration in suqare kilometres
		}
	});
	this.water = new res({
		init: function() {
			this.value = 1000; // Usable water in square kilometres. Currently the size of a small bay. Not all water is fertile or traversable, and better technology vastly improves this.  
			this.base = 10; // the basic increase in water from exploration in suqare kilometres
		}
	});
	this.research = new res({
		init: function() {
			this.value = 2000;
			this.base = 0.01;
		}
	});

	this.industries = []; // container for industry models
	this.upgrades = []; // container for upgrades models

	//init
	if (attributes.init) {
		attributes.init.apply(this);
	}

	this.logstrings = [];

	this.log = function(line) {
		this.logstrings.push(line);
	}

	// Put anything that must happen on a static interval here. 
	// Good for anything that needs to be updated but not in real-time, like seasons, population and years. 
	this.update = function() {
		this.year = parseInt(Math.floor(this.day / this.yearlength));
		// tick births and deaths based on the current population
		// important to divide by the year, or every person would be firing out a baby every day
		// then divide by the days that have passed because updates are slower than days. 
		var birthssince = +(this.daysSinceUpdate * (this.population / this.yearlength));
		this.births.inc(birthssince);
		this.deaths.inc(birthssince);
		this.population = this.births.value - this.deaths.value;
		this.lastupdate = this.day;

		// Set workers up from the national level, becasue they all come from the same population pool. 
		// The list is sorted down below, so this loop always works from most to least productive. 
		var pop_pool = round(this.population * this.participation);
		// buffer the required food total to prevent immediate starvation. 
		// TODO This should probably not be a magic number
		var food_pool = Math.round(this.population * this.foodbuffer);
		var land_pool = this.land.value;
		var water_pool = this.water.value;
		var total_food = 0;
		this.industries.forEach(function(i) {
			if (i.unlocked === true) {
				// add a buffer to food production to prevent immediate starvation.
				var food_poss = Math.round(i.trained * parseFloat(i.food.rate));
				var land_poss = Math.round(i.trained * parseFloat(i.landuse.rate));
				var water_poss = Math.round(i.trained * parseFloat(i.wateruse.rate));
				var limits = [];

				// There is always a hard limit of how many workers there are
				// by dividing the total resources by the production rate per person we get 
				// the total number of workers required to use 100% of the remaining resources 
				limits['No more trained workers available'] = i.trained;
				limits['Other industries are supplying sufficient food'] = Math.round(food_pool / i.food.rate);
				limits['All arable land is being used'] = Math.round(land_pool / i.landuse.rate);
				// only count the water pool if the industry requires water
				if (i.wateruse.rate > 1) {
					limits['All fishable water is being used'] = Math.round(water_pool / i.wateruse.rate);
				}

				// Run through the limiting factors for workers and return the lowest amount. 
				// This is the max number of workers an industry can have, due to any factor
				var minimum = Infinity;
				for (var x in limits) {
					if (limits[x] < minimum) {
						minimum = limits[x];
						i.limiter = x;
					}
				}
				i.maxworkers = minimum;
				if (pop_pool > i.maxworkers) {
					i.workers = Math.round(i.maxworkers);
				} else {
					i.workers = Math.round(pop_pool);
				}

				// reduce the pools of resources becasue this industry now has a worker value. 
				land_pool -= parseInt(i.workers * i.landuse.rate);
				water_pool -= parseInt(i.workers * i.wateruse.rate);
				pop_pool -= parseInt(i.workers);
				// Add a natural overproduction buffer to prevent immediate starvation
				food_pool -= parseInt(i.workers * i.food.rate);

				total_food += parseInt(i.workers * i.food.rate);

				// move on and see if workers in any other industries are neccessary
			}
		});
		this.free = pop_pool - this.missing;
		this.workers = this.population - this.free - this.missing;
		this.food = total_food;

		// adjust the death rate multiplier if your people are producing less food than they are require
		// below 100% food consumption

		//this.deaths.setmulti(1 - Math.round((this.population / this.food), -2), 'Starvation');
		this.deaths.setmulti(1 - (this.food / this.population), 'Starvation');

		// if there are more workers than total population due to deaths, remove a trained worker from a random industry. 
		if (this.workers > this.population) {
			var activeindustries = this.industries.filter(function(i) {
				return i.trained > 0;
			});
			for (j = 1; j < Math.round(this.workers - this.population); j++) {
				activeindustries[Math.floor(Math.random() * activeindustries.length)].trained -= 1;
			}
		}


		//  update the nation's child objects
		this.industries.forEach(function(model) {
			model.update();
		});
		this.upgrades.forEach(function(model) {
			model.update();
		});

		// sort industries so that workers go to the most productive industries first 
		this.industries.sort(function(a, b) {
			return +(b.food.rate - a.food.rate);
		})

		// reset the days since the last update
		this.daysSinceUpdate = 0;

	}.bind(this);

	// Put anything that must happen on a variable interval here.
	this.tick = function() {
		this.day += this.dayrate;
		this.daysSinceUpdate += this.dayrate;

		this.explorecheck();

		// increase research based on current free workers
		var researchers = round(this.free * this.dayrate);
		if (researchers > 1) {
			this.research.inc(researchers);
		}
		// tick the nation's child objects
		this.industries.forEach(function(model) {
			model.tick();
		});
		this.upgrades.forEach(function(model) {
			model.tick();
		});
	}.bind(this);

	this.explore = function() {
		// reduce population by whatever is larger:  50 free workers or 10% of free workers
		console.log('Exploring for a year');
		if (parseInt(this.free * 0.1) > 10) {
			this.missing = parseInt(this.free * 0.1)
		} else {
			this.missing = 10;
		}
		this.exploring = true;
		this.exploretimer = this.yearlength;
		this.exploretimermax = this.yearlength;
	}.bind(this);

	this.explorecheck = function() {
		if (this.exploring) {
			if (this.exploretimer > 0) {
				this.exploretimer--;
			} else {
				// Exploration consequences go here
				// kill explorers randomly. 
				var killed = 0;
				if (Math.random() <= 0.1) {
					killed = Math.round(this.missing * Math.random());
				}
				if (killed > 0) {
					this.deaths.add(killed);
					this.log(killed + ' of your ' + this.missing + ' explorers were tragically killed or lost on the expedition. ');
				}
				// returned land is equal to the number of explorers with a 20% variance, positive or negative.
				var foundland = this.missing * (1 + ((Math.random() - 0.5) * 0.2));
				// returned water depends on what has been unlocked and also random chance that explorers encounter water
				var foundwater = 0;
				// 30 percent chance to discover water on exploration journeys
				if ((Math.random() <= 0.3))
				if (this.discoveries.ocean) {
					foundwater = Math.round((this.missing * (1 + ((Math.random() - 0.5) * 0.2))) * 0.6);
				} else if (this.discoveries.river) {
					foundwater = Math.round((this.missing * (1 + ((Math.random() - 0.5) * 0.2))) * 0.25);
				} else if (this.discoveries.lake) {
					foundwater = Math.round((this.missing * (1 + ((Math.random() - 0.5) * 0.2))) * 0.1);
				}
				if (foundwater > 0) {
					 this.log((this.missing - killed) + 'explorers have returned from afar. They discovered ' + foundland + ' land and ' + foundwater + 'water');
				} else {
						this.log((this.missing - killed) + 'explorers have returned from afar. They discovered ' + foundland + ' land.');
				}


				// 10% chance of making a major discovery until there are none left.
				if (Math.random() <= 0.05) {
					var keys = Object.keys(this.discoveries);
					var keynumber = (keys.length * Math.random()) << 0;
					var randomdiscovery = this.discoveries[keys[keynumber]];
					if (randomdiscovery === false) {
						randomdiscovery = true;
						this.log('Your explorers discovered' + keys[keynumber] + '! It will unlock further enhancements and industries.');
					} else if ((Math.random() <= 0.5)) {
						// if the discovery is already discovered, you have a further 50% chance to get something else
						var keys2 = Object.keys(this.discoveries);
						var keynumber2 = (keys.length * Math.random()) << 0;
						var randomdiscovery2 = this.discoveries[keys[keynumber]];
						if (randomdiscovery2 === false) {
							randomdiscovery2 = true;
							this.log('Your explorers discovered' + keys2[keynumber2] + '! It will unlock further enhancements and industries.');
						}
					}
				}

				this.land.inc(foundland);
				this.missing = 0;
				this.exploretimer = 0;
				this.exploring = false;
			}
		}
	}.bind(this);

	this.discover = function() {

	}

	//overwrite default functions if they are supplied to the constructor
	monkeypatch.apply(this, [attributes]);

};

var industry_model = function industry_model(attributes) {

	// Default attributes
	this.name = '';
	this.parent = '';
	this.category = '';
	this.unlocked = false;
	this.unlockcost = 100;
	// a food ratio of 1 means one person working provides enough for one person. One person consumes one unit of food per day.
	this.food = new val();
	// the cost multipler of the industry 
	this.cost = new val();
	// the amount of workers in the industry. This is automatically set. 
	this.workers = 0;
	// the amount of land in square kms required for a single worker to produce food.
	this.landuse = new val();

	// the amount of water required for a single worker to produce food.
	this.wateruse = new val({
		base: 0,
	});
	// the trained workers in an industry. This can be more or less than the current number of workers, and be a limiting factor on the maximum amount of possible workers.
	this.trained = 0;
	this.training = false;
	this.trainingtime = 0.1; // in years (turned into days/ticks later on)

	this.autotrain = {};
	this.autotrain.unlocked = false //unlock autotraining for the industry
	this.autotrain.on = false; // flag to start autotraining
	this.autotrain.rate = 1; //the number of research points that can be used to autotrain workers
	this.autotrain.value = 1; //a ticker that counts down up to the cost of training
	this.autotrain.amount = 1; //the number of students to autotrain at one time

	//init
	if (attributes.init) {
		attributes.init.apply(this);
	}


	//Put anything that must happen on a static, longer interval here. 
	this.update = function() {

	};

	//Put anything that must happen on a dynamic interval here. Try and avoid for industries, it could get out of hand. 
	this.tick = function() {
		this.traincheck();
	};

	this.unlock = function(amount) {
		var unlockcost = this.unlockcost;
		if (amount > 1) {
			unlockcost = amount;
		}
		if (this.parentobject.research.value < amount) {
			console.log('Attempted to spend more than you have on an upgrade. Please validate buy buttons correctly');
			return;
		}
		console.log('Unlocking ' + this.name + ' for ' + unlockcost);
		this.parentobject.research.take(unlockcost);
		this.unlocked = true;
		this.unlocktime = Date.now();
	}.bind(this);

	this.traincheck = function() {
		// if training is happening, Tick down till it is complete. 
		// Otherwise autotraining things happen if they are unlocked and enabled
		if (this.training) {
			if (this.trainingcount > 0) {
				this.trainingcount--;
			} else {
				this.trainingcomplete();
			}
		}
		if (this.autotrain.unlocked && this.autotrain.on && this.trained < this.parentobject.population) {
			// increment the training counter if its less than the training time, otherwise just train a worker.
			if (this.autotrain.value <= Math.round(this.trainingtime * this.parentobject.yearlength)) {
				this.autotrain.value += this.autotrain.rate;
			} else {
				this.trained += Math.round(this.autotrain.amount);
				this.autotrain.value = 0;
			}
		}
	}

	this.trainworker = function(amount) {
		console.log('training worker');
		this.training = true;
		// calling the function without an amount creates only one worker
		amount = (amount > 1) ? amount : 1;
		// set the cost to 0 if training is automatic
		var cost = (this.autotrain.value > 1) ? 0 : this.cost.value;
		this.parentobject.research.take(Math.floor(parseInt(cost) * amount));
		this.training = true;
		this.trainingamount = amount;
		// TODO - apply a better logarithmic scale to this equation so higher class sizes = quicker training.
		this.trainingcount = Math.floor(Math.round(this.trainingtime * this.parentobject.yearlength) * (amount * (amount / Math.pow(amount, 1.2))));
		// this might look weird, but training count is incremented down elsewhere. 
		this.trainingcountmax = this.trainingcount;
	}.bind(this);


	this.trainingcomplete = function() {
		this.trained = +(this.trained) + Math.round((this.trainingamount > 1 ? this.trainingamount : 1), 0);
		this.training = false;
		this.trainingcount = 0;
	};

	this.parentobject = fetch(nations, this.parent);

	monkeypatch.apply(this, [attributes]);

};

var upgrade_model = function upgrade_model(attributes) {

	// Default attributes
	this.name = 'Default Name';
	this.description = 'Default Description';
	this.effects = 'Effects';
	this.category = '';
	this.count = 0;
	this.max = 1;
	this.cost = new val();
	this.specialty = false;
	this.buyable = true;
	this.self = this;
	this.timer = 0;

	//init
	if (attributes.init) {
		attributes.init.apply(this);
	}

	//Put anything that must happen on a dynamic interval here. It can be called individually or at intervals by the parent model
	this.tick = function() {

	};

	//Put anything that must happen on a static, longer interval here. It can be called individually or at intervals by the parent model. 
	this.update = function() {
		if (this.unlockconditions) {
			if (this.unlocked === false) {
				//the .every() function here returns true if all unlock conditions are true
				this.unlocked = this.unlockconditions.every(boundeval, this);
			}
		}
	};


	this.buy = function(val) {

		amount = (typeof amount != "undefined") ? val : this.cost.value;

		if (this.parentobject.research.value < amount) {
			console.log('Attempted to spend more than you have. Please validate buy buttons correctly');
			return;
		}
		this.buyable = false;
		if (this.count < this.max) {
			this.count++;
		}
		// this looks redundant, but we need to repeat the check becasue the count may have gone up to equal the max. if it has, the upgrade is no longer buyable
		if (this.count < this.max) {
			this.buyable = true;
		}
		this.parentobject.research.take(amount);
	};

	this.parentobject = fetch(nations, this.parent)
	if (this.industry !== '') {
		this.industryobject = fetch(this.parentobject.industries, this.industry);
	}

	//overwrite default functions if they are supplied to the constructor
	monkeypatch.apply(this, [attributes]);
}.bind(this);
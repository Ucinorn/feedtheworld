function getobjectbyname(container, name) {
    for (var i = 0; i < container.length; i++)
    {
        if(container[i].name == name)
            return container[i];
    }
};

function boundeval(currentvalue, index, array) {
    return eval(currentvalue);
}

function compare(post, operator, value) {
    switch (operator) {
        case '>':   return post > value;
        case '<':   return post < value;
        case '>=':  return post >= value;
        case '<=':  return post <= value;
        case '==':  return post == value;
        case '!=':  return post != value;
        case '===': return post === value;
        case '!==': return post !== value;
    }
}

function calculatecost() {
    var a = this.multi.reduce(function(a, b) {
        return a + b;
    });
    return this.base * a;
}

//these two functions overwrite the attributes of models if they are passed during the construction. 
//the functions are loaded last because they often rely on values passed at the same time, or calculated elsewhere.
function loadvalues(atts) {
    if (atts instanceof Object) {
        for (key in atts) {
            if ( typeof(atts[key]) != 'function' ) {
                this[key] = atts[key];
            }
        }
    }
};
function loadfunctions(atts) {
    if (atts instanceof Object) {
        for (key in atts) {
            if ( typeof(atts[key]) === 'function' ) {
                // monkey patch new function to old function.
                var oldfunction = this[key];
                var newfunction = atts[key];
                // no arguments passed but we can use .arguments to pass them in future
                this[key] = function() {
                    oldfunction.apply(this);
                    newfunction.apply(this);
                }.bind(this);
            }
        }
    }
};

var nation_model = function nation_model(attributes) {
    //static attributes
    this.day = 0;
    this.births = 0;
    this.deaths = 0;
    this.year = 0;
    this.yearlength = 365;
    this.name = '';
    this.birthrate = 35; // 50 births per thousand women per Earth year. 40 is considered high, modern nations end up around 10
    this.deathrate = 15; // 45 per thousand PEOPLE per Earth year. Third world nations currently run at around 10, modern nations end up around 7.5
    this.land = 200000; //Usable land in square kilometres. Currently the size of a small european nation. This is more than enough for nomadic tribes, but becomes a bottleneck as population grows. 
    this.research = 5000;
    this.freetime = 0;
    this.base = 1;
    this.multi = [1];
    this.researchrate = 1;
    this.industries = []; // container for child models
    this.upgrades = []; // container for child models

    //overwrite values of attributes if they are supplied to the constructor
    loadvalues.apply(this, [attributes]);

    // Put anything that must happen on a static interval here. 
    // Good for anything that needs to be updated but not in real-time, like seasons, population and years. 
    this.update = function() {
        this.year = parseInt(Math.floor(this.day / this.yearlength));
        this.births = this.births + parseFloat(0.1);
        this.deaths = this.deaths + parseFloat(0.05);
        this.population = this.births - this.deaths;
        this.lastupdate = this.day;

        // Set workers up from the national level, becasue they all come from the same population pool. 
        // The list is sorted down below, so this loop always works from most to least productive. 
        var pop_pool = this.population;
        var food_pool = this.population;
        var land_pool = this.land;
        this.industries.forEach( function(i) {
            if (i.unlocked === true) {
                var food_poss = parseInt(i.trained * parseInt(i.foodratio));
                var land_poss = parseInt(i.trained * parseFloat(i.landuse));
                var limits = [];

                if (food_pool > food_poss) {
                    limits['food'] = i.trained;
                } else {
                    limits['food'] = parseInt(food_pool / i.foodratio);
                };

                if (land_pool > land_poss) {
                    limits['land'] = i.trained;
                } else {
                    limits['land'] = parseInt(land_pool / i.landuse);
                };

                var minimum = Infinity;
                for( x in limits) {
                    if( limits[x] < minimum) {
                        minimum = limits[x];
                        i.limiter = x;
                    }
                }
                i.maxworkers = minimum;

                if (pop_pool > i.maxworkers) {
                    i.workers = i.maxworkers;
                } else {
                    i.workers = pop_pool;
                };

                food_pool -= parseInt(i.workers * i.foodratio);
                land_pool -= parseInt(i.workers * i.landuse);
                pop_pool  -= parseInt(i.workers);

            }
        });
        this.unemployed = pop_pool;
        this.workers = this.population - this.unemployed;

        //  update the nation's child objects
        this.industries.forEach(function(model) {model.update();});
        this.upgrades.forEach(function(model) 	{model.update();});

        // sort industries so that workers go to the most productive industries first 
        this.industries.sort(function(a, b) { 
            return b.foodratio - a.foodratio;
        })

    }.bind(this);

    // Put anything that must happen on a variable interval here.
    this.tick = function() {
        this.day++;
        this.research += calculatecost.apply(this);
        // tick the nation's child objects
        this.industries.forEach(function(model) {model.tick();});
        this.upgrades.forEach(function(model) 	{model.tick();});
    }.bind(this);

    this.minus = function(attribute, amount) {
        if (typeof this[attribute] === 'number') {
            this[attribute] -= parseInt(amount);
        }
    }.bind(this)

    //overwrite default functions if they are supplied to the constructor
    loadfunctions.apply(this, [attributes]);

};

var industry_model = function industry_model(attributes) {

    // Default attributes
    this.name = 'Food'; 
    this.parent = '';
    this.category = 'none';
    this.unlocked = false;
    this.unlockedcost = 100;
    // a food ratio of 1 means one person working provides enough for one person. One person consumes one unit of food per day.
    this.foodratio = 1;
    // the amount of land in square kms required for a single worker to produce food.
    this.landuse = 1000;
    // the the cost multipler of the industry 
    this.base = 1;
    this.multi = [2];
    // the amount of workers in the industry. This is automatically set. 
    this.workers = 0;
    // the trained workers in an industry. This can be more or less than the current number of workers, and be a limiting factor on the maximum amount of possible workers.
    this.trained = 0;
    this.trainingtime = 100;  // in ticks
    
    this.autotrain = [];
    this.autotrain.unlocked =  false //unlock autotraining for the industry
    this.autotrain.bool = false;  // flag to start autotraining
    this.autotrain.rate = 1; //the number of research points that can be used to autotrain workers
    this.autotrain.value = 1; //a ticker that counts down up to the cost of training
    this.autotrain.amount = 1; //the number of students to autotrain at one time

    //load attributes and function overrides if passed by the constructor
    loadvalues.apply(this, [attributes]);

    //Put anything that must happen on a static, longer interval here. It can be called individually or at intervals by the parent model. 
    this.update = function() {

    };

    //Put anything that must happen on a dynamic interval here. It can be called individually or at intervals by the parent model
    this.tick = function() {
        this.cost = calculatecost.apply(this);
        this.traincheck();
    };

    this.increase = function(attribute, amount) {
        if (typeof amount != "undefined") {
            if (parseFloat(amount) > 0) {
                this[attribute] +=  parseFloat(amount);
            }
        } else {
            this[attribute]++;
        }
    }.bind(this);


    this.unlock = function() {
        this.parentobject.research -= parseInt(this.unlockedcost);
        this.unlocked = true;
    }.bind(this);

    this.trainworker = function(amount) {
        // calling the function without an amount creates only one worker
        amount = (amount > 1)? amount : 1;
        // set the cost to 0 if training is automatic
        cost = (this.autotrain.value > 1)? 0 : this.cost;
        this.parentobject.research -= Math.floor(parseInt(cost) * amount);
        this.training = true;
        this.trainingamount = amount;
        // apply diminishing returns on training time using an inverse expotent based on the amount of workers trained at once. 
        this.trainingcount = Math.floor(amount * (this.trainingtime * (this.trainingtime / Math.pow(this.trainingtime, 1.2))));
        this.trainingcountmax = this.trainingcount;
    }.bind(this);

    this.traincheck = function() { 
        // if training is happening, do it. Otherwise autotraining things happen if they are unlocked and enabled
        if (this.training) {
            if (this.trainingcount > 0) {
                console.log(this.trainingcount);
                this.trainingcount--;
            } else {
                this.trainingcomplete();
            } 
        } else if (this.autotrain.unlocked) {
            // turn off autotrain if you max out on trained workers. 
            if (this.autotrain.bool == true && this.trainedworkers >= this.parentobject.population) {this.autotrain.bool = false};
            if (this.autotrain.bool) {            
                // increment the training counter if its less than the training time, otherwise just train a worker.
                if (this.autotrain.value <= this.trainingtime) {
                    this.autotrain.value += this.autotrain.rate;
                } else {
                    this.trainworker(this.autotrain.amount);
                    this.autotrain.value = 0;
                }
            }
        } 
    }


    this.trainingcomplete = function() {
        this.increase('trained', this.trainingamount);
        this.training = false;
    };





    this.parentobject = getobjectbyname(nations, this.parent);

    //overwrite default functions if they are supplied to the constructor
    loadfunctions.apply(this, [attributes]);

};

var upgrade_model = function upgrade_model(attributes) {

    // Default attributes
    this.name = 'Default Name'; 
    this.description = 'Default Description'; 
    this.effects = 'Effects';
    this.category = ''; 
    this.industry = '';
    this.value = 1;
    this.count = 1;
    this.max = 1;
    this.base = 1
    this.multi = [1];
    this.specialty = false;
    this.self = this;
    this.timer = 0;

    //load attribute values if passed by the constructor
    loadvalues.apply(this, [attributes]);

    //Put anything that must happen on a dynamic interval here. It can be called individually or at intervals by the parent model
    this.tick = function() {
        this.cost = calculatecost.apply(this);
    };

    //Put anything that must happen on a static, longer interval here. It can be called individually or at intervals by the parent model. 
    this.update = function() {
        if ( this.cost < this.parentobject.research && this.count <= this.max) { this.buyable = true };
        this.unlocked = function() {
            if (this.unlockconditions) {
                //the .every() function here returns true if all unlock conditions are true
                return this.unlockconditions.every(boundeval, this);
            } else {return false};
        };
    };

    this.takeresearch = function() {

    }.bind(this);

    this.buy = function() {
        this.buyable = false;
        if (this.count <= this.max) { this.count++ };
        // if this upgrade is a specialty, then other specialty upgrades in the same industry doubles
        if (this.specialty) { 
            if (this.specialty === true) { 
                upgrades.forEach(function(u) {
                    if (u.specialty === true && u.parent === this.name ) {this.multi.push(2)};
                })
            };
        };
        this.takeresearch.apply(this);
    };

    this.parentobject = getobjectbyname(nations, this.parent)
    if (this.industry !== '') {
        this.industryobject = getobjectbyname(this.parentobject.industries, this.industry);
    };

    //overwrite default functions if they are supplied to the constructor
    loadfunctions.apply(this, [attributes]);
};

//initiate nations

var nations = [];

nations.push(
    new nation_model({
        name: 'Primary',
        births: 150
    })
);

//initiate their child industries and upgrades on a loop
nations.forEach(function(nation) {	

    var industries = nation.industries;

    industries.push( 
        new industry_model({
            name: 'Foraging',
            parent: nation.name,
            description: 'The most basic form of sustenance, with enough trial and error anyone can identify and gather fruits, nuts and roots in their local area',
            foodratio: 1,
            landuse: 10,
            base: 1,
            workers: 150,
            trained: 150,
            unlocked: true
        })
    );
    industries.push( 
        new industry_model({
            name: 'Hunting',
            parent: nation.name,
            description: 'Hunting animals across vast areas is dangerous, exhaustive and time consuming, but reaps great rewards when successful. Hunting highly productive  but  difficult to implement on a large scale due to the land required',
            foodratio: 2.5,
            landuse: 50,
            base: 20,
            unlocked: true
        })
    );
    industries.push( 
        new industry_model({
            name: 'Nomadic Cultivation',
            parent: nation.name,
            description: 'The basic cultivation of plants and animals improves the land as communities pass through, establishing seasonal traveling routes and a strong cultural knowledge that paves the way for more complex ',
            // High returns initially, but doesnt really go anywhere.
            foodratio: 1.5,
            landuse: 10,
            base: 100
        })
    );
    industries.push( 
        new industry_model({
            name: 'Subsistence Farming',
            parent: nation.name,
            description: 'With the domestication of wild plants and animals, communities can begin to establish permanent residences and work the land all year round.',
            foodratio: 1,
            landuse: 10,
            base: 500,
        })
    );
    industries.push( 
        new industry_model({
            name: 'Herding',
            parent: nation.name,
            description: 'Domesticating and shepherding herd animals is a low-risk, low effort way of harvesting meat, but still requires large amounts of land.',
            foodratio: 5,
            landuse: 20,
            base: 500,
        })
    );
    industries.push( 
        new industry_model({
            name: 'Organised Farming',
            parent: nation.name,
            description: '.',
            foodratio: 3,
            landuse: 9,
            base: 10000,
        })
    );

    var upgrades = nation.upgrades;

    upgrades.push(
        new upgrade_model({
            name: 'Seasonal Foraging',
            description: 'Your tribe has learned enough about this area to target plants that are more likely to bear rewards.',
            effects: 'Improves foraging efficiency by 5%. Can be taken multiple times',
            industry: 'Foraging',
            parent: nation.name,
            max: 10,
            base: 100, 
            unlocked: false,
            unlockconditions: ['this.industryobject.unlocked == true'],
            buyable: true,
            buy: function() {
                this.multi.push(2);
                this.industryobject.foodratio += 0.05;
            }
        })
    );

    upgrades.push(
        new upgrade_model({
            name: 'Tradition',
            description: 'The knowledge of your people is passed from generation to generation through song, dance and ritual',
            effects: 'Improves your base research generation by 10%. Can be taken multiple times',
            parent: nation.name,
            max: 10,
            base: 20, 
            unlocked: false,
            unlockconditions: ['this.parentobject.research > 500', 'this.parentobject.population > 1000'],
            buyable: true,
            buy: function() {
                this.multi.push(0.5);
                this.parentobject.researchrate = this.parentobject.researchrate * 1.1;
            }
        })
    );
    upgrades.push(
        new upgrade_model({
            name: 'Expansion',
            description: 'Explore your local area and increase the arable land at your disposal. The further you explore, the better your chances of finding useful new plants and animals.',
            effects: 'Increase your arable land by 50% of your current land',
            parent: nation.name,
            max: 50,
            base: 50, 
            unlocked: false,
            unlockconditions: ['this.parentobject.research > 1000'],
            buyable: true,
            buy: function() {
                this.multi.push(1);
                this.parentobject.land = this.parentobject.land * 1.5;
            }
        })
    );

});

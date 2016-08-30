//initiate nations

var nations = [];

nations.push(
  new nation_model({
    init: function() {
      this.name = 'Primary';
      this.births.value = 150;
      this.land.value = 10000;
    }
  })
);


var nation = nations[0];

  var industries = nation.industries;

  industries.push(
    new industry_model({
      init: function() {
        this.name = 'Gathering';
        this.parent = nation.name;
        this.description = 'The most basic form of sustenance; with enough trial and error anyone can identify and gather fruits, nuts and roots in their local area.';
        this.tooltip = 'Gathering will only ever be a basic form of sustenance, and will sustain your population with virtually no training cost, but your space is limited. Be sure to invest in more productive technologies before your population outgrows it.';
        this.food.base = 1;
        this.landuse.base = 20;
        this.workers = 150;
        this.trained = 130;
        this.unlocked = true;
        this.cost.base = 1;
        this.autotrain.unlocked = true;
        this.autotrain.on = true;
        this.trainingtime = 0.1;
      }
    })
  );

  industries.push(
    new industry_model({
      init: function() {
        this.name = 'Hunting';
        this.parent = nation.name;
        this.description = 'Hunting for game is dangerous, time consuming and requires large tracts of wild land, but is relatively easy to learn and the most nutritious early source of food. ';
        this.tooltip = 'Hunting can be very productive with some technologcal improvements, but requires vast tracts of land to sustain. Hunting will remain relevant for a long time, but it will never be your main source of food.';
        this.food.base = 1.1;
        this.landuse.base = 100;
        this.cost.base = 5;
        this.trained = 10;
        this.unlocked = true;
        this.trainingtime = 0.5;
      }
    })
  );

  industries.push(
    new industry_model({
      init: function() {
        this.name = 'Fishing';
        this.parent = nation.name;
        this.description = 'Fishing is easy, catching is hard.';
        this.tooltip = 'Although fishing can be highly productive in the right conditions, the cost of training and equipment to fish reliably are very high. Try upgrading it first to make it worth while investing in this industry.';
        this.food.base = 1.5;
        this.landuse.base = 10;
        this.wateruse.base = 100;
        this.unlockcost = 500;
        this.cost.base = 50;
        this.trainingtime = 1;
        this.unlockconditions = ['this.parentobject.discoveries.ocean == true || this.parentobject.discoveries.river == true || this.parentobject.discoveries.lake == true'];
      }
    })
  );

  industries.push(
    new industry_model({
      init: function() {
        this.name = 'Cultivation';
        this.parent = nation.name;
        this.description = 'The birth of farming and the gateway to complex society';
        this.tooltip = 'Basic cultivation is initially less productive than gathering or hunting, but consumes much, much smaller amounts of land. It also brings communities together in much larger sizes than were possible before, leading to very fast technological progression.';
        this.food.base = 1.1;
        this.landuse.base = 1;
        this.unlockcost = 5000;
        this.cost.base = 1000;
        this.trainingtime = 5;
        this.unlockconditions = ['this.parentobject.population > 250 && fetch(industries, "")'];
      }
    })
  );

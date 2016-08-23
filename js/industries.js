//initiate nations

var nations = [];

nations.push(
  new nation_model({
    init: function() {
      this.name = 'Primary';
      this.births.value = 150;
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
        this.tooltip = 'Gathering will only ever be a basic form of sustenance, and will sustain your population with virtually no training cost, but your space is limited. Be sure to invest in more productive technologies before you outgrow it.';
        this.food.base = 1;
        this.landuse.base = 10;
        this.workers = 150;
        this.trained = 10;
        this.unlocked = true;
        this.cost.base = 1;
        this.autotrain.unlocked = true;
        
      }
    })
  );

  industries.push(
    new industry_model({
      init: function() {
        this.name = 'Hunting';
        this.parent = nation.name;
        this.description = 'Hunting for game is dangerous, time consuming and requires large tracts of wild land, but is relatively easy to learn and the most nutritious early source of food. ';
        this.tooltip = 'Hunting can be very productive, but requires vast tracts of land to sustain. Hunting will remain relevant for a long time, but it will never be your main source of food.';
        this.food.base = 1.1;
        this.landuse.base = 100;
        this.cost.base = 5;
        this.trained = 30;
        this.unlocked = true;
        this.trainingtime = 180;
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
        this.wateruse.base = 10;
        this.unlockcost = 2000;
        this.cost.base = 50;
        this.trainingtime = 720;
        this.unlockconditions = ['this.parentobject.discoveries.ocean == true || this.parentobject.discoveries.river == true || this.parentobject.discoveries.lake == true'];
      }
    })
  );


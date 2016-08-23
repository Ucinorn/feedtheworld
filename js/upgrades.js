
  var upgrades = nation.upgrades;

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Seasonal Gathering';
        this.description = 'Your tribe has learned enough about the local area to target plants that are in season and more likely to bear food.';
        this.effects = 'Improves Gathering multiplier by 1% (cumulative). Cost increases by 50%. Can be taken multiple times';
        this.industry = 'Gathering';
        this.parent = nation.name;
        this.max = 10;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked == true'];
        this.cost.base = 50;
      },
      buy: function() {
        this.cost.addmulti(0.5, this.name);
        this.industryobject.food.addmulti(0.01, this.name);
      }
    })
  );

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Sustainable Gathering';
        this.description = 'Cultivating plants and being selective while gathering means smaller yeilds, but higher output of plants and reduces the distance foragers need to travel to find food.';
        this.effects = 'Improves Gathering multiplier by 10%. Reduces the land use of Gathering by 10% (compounding). Reduces base food per worker of Gathering by 0.05. Cost increases by 100%. Can be taken multiple times';
        this.industry = 'Gathering';
        this.parent = nation.name;
        this.max = 5;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked == true', 'this.industryobject.workers > 250'];
        this.cost.base = 1000;
      },
      buy: function() {
        this.cost.addmulti(1);
        this.industryobject.food.addmulti(0.2);
        this.industryobject.landuse.addmulti(-0.1);
        this.industryobject.food.base -= 0.05;
      }
    })
  );

  // Hunting Upgrades

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Tracking';
        this.description = 'Your hunters are getting better at finding and following wild animals.';
        this.effects = 'Improves hunting multiplier by 1%. Cost increases by 50% (cumulative)';
        this.industry = 'Hunting';
        this.parent = nation.name;
        this.max = 10;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked == true'];
        this.cost.base = 5;
      },
      buy: function() {
        this.cost.addmulti(0.5, this.name);
        this.industryobject.food.addmulti(0.01);
      }
    })
  );

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Woomera';
        this.description = 'The development of the spear thrower allows hunters to take down game from long distances, instead of running it down over many days';
        this.effects = 'Increases base food per hunter by 0.05. Increases training cost by 50%;';
        this.industry = 'Hunting';
        this.parent = nation.name;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked == true', 'this.industryobject.workers > 50'];
        this.cost.base = 500;
      },
      buy: function() {
        this.industryobject.food.base += 0.05;
        this.industryobject.cost.addmulti(0.50);
      }
    })
  );


  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Selective Hunting';
        this.description = 'By understanding breeding periods and taking only male or older animals, populations remain stable and dense. However it comes at the cost of the amount of game hunters can bring home.';
        this.effects = 'Reduces the land required for Hunting by 15%, but reduces base food yeild by 0.1 per hunter';
        this.industry = 'Hunting';
        this.parent = nation.name;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked == true', 'this.industryobject.workers > 50'];
        this.buyable = true;
        this.cost.base = 500;
      },
      buy: function() {
        this.industryobject.landuse.addmulti(-0.15);
        this.industryobject.food.base -= 0.1;
      }
    })
  );

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Hunting Dogs';
        this.description = 'Dogs were one of the most important early tools available to man, particular when hunting. They served by flushing out game, herding towards waiting spears, separating the weak and slow from migrating herds and protecting their masters should they ever be in danger.';
        this.effects = 'Increase the efficiency of hunters by 30%. Training costs for hunters increase by 200%';
        this.industry = 'Hunting';
        this.parent = nation.name;
        this.unlocked = false;
        this.unlockconditions = ['this.industryobject.unlocked === true', 'this.parentobject.discoveries.dogs == true'];
        this.buyable = true;
        this.cost.base = 50;
      },
      buy: function() {
        this.industryobject.food.addmulti(0.30);
        this.industryobject.cost.addmulti(2);
      }
    })
  );



  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Inspiration';
        this.description = "Push your citizens to further feats of ingenuity.";
        this.effects = 'Each free citizen generates an additional 0.1 research per day.';
        this.parent = nation.name;
        this.max = 10;
        this.cost.base = 50;
        if (this.count === 0) {
          this.description = "Kindle your citizens' natural curiosity, encouraging them to decipher and understand the natural world around them.";
          this.effects = 'Each free citizen begins automatically generating 0.1 research a day.';
        }
      },
      buy: function() {
        this.unlocked = false;
        this.unlockconditions = ['this.parentobject.population > ' + round(Math.pow(100 * this.count, 2))];
        this.cost.addmulti(10 * this.count);
        this.parentobject.research.addmulti(0.01);
      }
    })
  );

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Tradition';
        this.description = 'The knowledge of your people is passed from generation to generation through song, dance and ritual.';
        this.effects = 'Improves your base research generation by 1% (cumulative). The cost of this upgrade increases by 20% (cumulative)';
        this.parent = nation.name;
        this.max = 50;
        this.unlocked = false;
        this.unlockconditions = ['this.parentobject.population > 100'];
        this.cost.base = 50;
      },
      buy: function() {
        this.unlocked = false;
        this.unlockconditions = ['this.parentobject.year > ' + this.count * 10];
        this.cost.addmulti(0.2, this.name);
        this.parentobject.research.addmulti(0.01, this.name);
      }
    })
  );

  upgrades.push(
    new upgrade_model({
      init: function() {
        this.name = 'Land Management';
        this.description = 'Over time, your people become familiar with the land and its animals, shaping and nurturing the  landscape to encourage growth and stability. Properly managed land can support animal and plant populations far above what is possible naturally.';
        this.effects = 'Improves the base food yeild of foraging and Hunting by 0.05. Also reduces the land use of Hunting by 5% (cumulative);';
        this.parent = nation.name;
        this.max = 10;
        this.unlocked = false;
        this.unlockconditions = ['this.parentobject.year > 100', 'this.parentobject.population > 200'];
        this.cost.base = 50;
      },
      buy: function() {
        this.unlocked = false;
        this.unlockconditions = ['this.parentobject.year >' + ((this.count + 1) * 100), 'this.parentobject.population > 200'];
        this.cost.addmulti(3, this.name);
        fetch(industries, 'Hunting').food.base += 0.05;
        fetch(industries, 'Gathering').food.base +=0.05;
        fetch(industries, 'Hunting').landuse.addmulti(-0.05);

      }
    })
  );

  // end upgrades
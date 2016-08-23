rivets.formatters['!'] = function(value)
{
  return !value;
};
rivets.formatters.like = function(value, args)
{
  return value == args;
};
rivets.formatters.eq = function(value, args)
{
  return value === args;
};
rivets.formatters.neq = function(value, args)
{
  return value !== args;
};
rivets.formatters.gt = function(value, args)
{
  return value > args;
};
rivets.formatters.gte = function(value, args)
{
  return value >= args;
};
rivets.formatters.lt = function(value, args)
{
  return value < args;
};
rivets.formatters.lte = function(value, args)
{
  return value <= args;
};
rivets.formatters.or = function(value, args)
{
  return value || args;
};
rivets.formatters.isEmpty = function(value)
{
  return (typeof value === 'undefined' || value === null || (typeof value === 'string' && value.length === 0));
};
rivets.formatters.isNotEmpty = function(value)
{
  return !rivets.formatters.isEmpty(value);
};

rivets.formatters.pass = function(value, args)
{
  return args;
};

rivets.formatters.json = function(value, intendation)
{
  return JSON.stringify(value, null, intendation || 0);
};

rivets.formatters.prefix = function(value, prefix)
{
  return '' + prefix + value;
};

rivets.formatters.suffix = function(value, suffix)
{
  return '' + value + suffix;
};

rivets.formatters.ucFirst = function(value)
{
  return value.substr(0, 1).toUpperCase() + value.substr(1);
};

rivets.formatters['+'] = function(value, args)
{
  return value + args;
};

rivets.formatters['-'] = function(value, args)
{
  return value - args;
};

rivets.formatters['*'] = function(value, args)
{
  return value * args;
};

rivets.formatters['/'] = function(value, args)
{
  return value / args;
};

rivets.formatters['and'] = function(value, args) // should only be used for true/false statements, returns true if all are true 
{
  if (args == true && value == true) {
    return true;
  } else {return false};
};

rivets.formatters['or'] = function(value, args) // should only be used for true/false statements, returns true if any are true 
{
  if (args == true || value == true) {
    return true;
  } else {return false};
};

rivets.formatters.round = function(value, decimals)
{
  if (decimals) {
    var exp = Math.pow(10, decimals);
    value = Math.round(value * exp) / exp;
  }
  else {
    value = Math.round(value);
  }

  return value;
};

rivets.formatters.get = function(obj, key)
{
  if (obj && typeof obj === 'object') {
    return obj[key];
  }
  return null;
};

rivets.formatters.set = function(obj, key, value)
{
  if (obj && typeof obj === 'object') {
    obj[key] = value;
  }

  return obj;
};

rivets.formatters['.'] = rivets.formatters.get;

rivets.formatters.keys = function(obj)
{
  if (typeof obj === 'object') {
    return Object.keys(obj);
  }

  return [];
};

rivets.formatters.length = function(value)
{
  return value ? (value.length || 0) : 0;
};

rivets.formatters.sort = function(/*value[, by][, direction]*/)
{
  return value;

  var args = Array.from(arguments);
  var value = args.shift();
  var by = args.shift();
  var direction = args.shift();

  if (!direction && (by == 'asc' || by == 'desc')) {
    direction = by;
    by = null;
  }

  if (!by) {
    value.sort();
  }
  else {
    value.sort(function(a, b) {
      if (a[by] === b[by]) return 0;

      return (a[by] < b[by]) ? -1 : 1
    });
  }

  if (direction == 'desc') {
    value.reverse();
  }

  return value;
};

rivets.formatters.default = function(value, args)
{
  return (typeof value !== 'undefined' && value !== null) ? value : args;
};

rivets.formatters.contains = function(value, search)
{
  if (Array.isArray(value)) {
    return (value.indexOf(search) !== -1);
  }

  return false;
};

rivets.formatters.percent = function(value, decimals)
{
  return number_format(value * 100, decimals || 0, ',') + '%';
};

rivets.formatters.bind = function(/*fn, thisArg[, arg1, arg2, ..., argN]*/)
{
  var args = Array.from(arguments);
  var fn = args.shift();
  var self = args.shift();

  if (typeof fn === 'function') {
    return function() {
      fn.apply(self, args);
    }
  }

  return fn;
};

rivets.formatters.with = function(/*fn, arg1, arg2, ..., argN*/)
{
  var args = Array.from(arguments);
  console.log(args);
  var fn = args.shift();

  if (typeof fn === 'function') {
    return fn.bind(null, args);
  }

  return fn;
};

rivets.formatters.slice = function() {
  var args = Array.from(arguments);
  var arr = args.shift();
  return Array.prototype.slice.apply(arr, args);
};

rivets.formatters.int = function(value){
	return parseInt(value);
}
rivets.formatters.cat = function(value, args){
	return value.filter(function (value, index) {
		return value.category == args[0];
	});
};

rivets.configure({
	// copied from: https://github.com/mikeric/rivets/issues/258#issuecomment-52489864
	// This configuration allows for on- handlers to receive arguments
	// so that you can onclick="steps.go" data-on-click="share"
	handler: function (target, event, binding) {
		var eventType = binding.args[0];
		var arg = target.getAttribute('data-on-' + eventType);
		if (arg) {
			//apply the function install of calling it if there are multiple arguments. This ensures the arguments are split correctly
			splitargs = arg.split(",");
			if (splitargs[1] || splitargs instanceof Array) { // checks there are more than one argument and that the results is an applyable array
				this.apply(binding._model, splitargs);
			} else {
				this.call(binding._model, arg);
			}
		} else {
			// that's rivets' default behavior afaik
			this.call(binding._model, event, binding);
		}
	}
});

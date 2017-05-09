function extend(my_console, options){
	//If no options are passed create an empty object
	options = options || {};
	
	
	//Custom log function
	var commands = options.commands;
	if(commands && options.colours){
		
		//New log function
		if(commands.log)
			my_console.log = log(console.log, commands.log, options.colours);
		
		//New error function
		if(commands.error)
			my_console.error = log(console.error, commands.error, options.colours);
		
		//New error function
		if(commands.info)
			my_console.info = log(console.info, commands.info, options.colours);
		
		//New error function
		if(commands.warn)
			my_console.warn = log(console.warn, commands.warn, options.colours);
	}
	
	return my_console;
}

//The extended log function
function log(command, options, colours){
	//If no options are passed create an empty object
	options = options || {};
	
	//Store the original function
	var command_original = command;
	var spacer = "-" + get_text_colour(options, colours);
	
	//The actual function for logging information
	return function(){
		
		//Get the current time in ISO format
		var timestamp = new Date().toISOString();
		
		//Add timestamp and colour if there was something to log
		if(arguments.length > 0){
			Array.prototype.unshift.call(arguments, timestamp, spacer);
			Array.prototype.push.call(arguments, "\x1b[0m");
		}
		
		//Log the data
		command_original.apply(command_original, arguments);
	}
}

//Gets the colour string
function get_text_colour(command, colours){
	var colour = "",
		tmp_colour;
		
	//Check if a foreground colour is defined
	if(command.foreground){
		tmp_colour = colours.foreground[command.foreground];
		
		//Check if the specified colour is available
		if(tmp_colour)
			colour += "\x1b[" + tmp_colour + "m";
	}
	
	//Check if a background colour is defined
	if(command.background){
		tmp_colour = colours.background[command.background];
		
		//Check if the specified colour is available
		if(tmp_colour)
			colour += "\x1b[" + tmp_colour + "m";
	}
	
	return colour;
}


module.exports = extend;
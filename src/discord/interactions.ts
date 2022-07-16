import { AutocompleteInteraction, CommandInteraction, Interaction } from 'discord.js';
import { CommandFile, commands } from './commands';
import { autocomplete as addAutocomplete } from './commands/subjects/s.add';
import { autocomplete as removeAutocomplete } from './commands/subjects/s.remove';
import UserError from './UserError';

const autocompleteFunctions: Record<string, Record<string, (interaction: AutocompleteInteraction) => Promise<void>>> = {
	'subjects': {
		'add': addAutocomplete,
		'reomve': removeAutocomplete
	}
}

let commandDict: Record<string, CommandFile> = {};

export function init() {
	commandDict = Object.fromEntries(commands.map(command => [command.data.name, command]));
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	if(!autocompleteFunctions[interaction.commandName]) throw new Error("no autocomplete for dis func defined");
	if(!autocompleteFunctions[interaction.commandName][interaction.options.getSubcommand()]) throw new Error('subcomand');

	await autocompleteFunctions[interaction.commandName][interaction.options.getSubcommand()](interaction);
}

export async function command(interaction: CommandInteraction) {
	const command = commandDict[interaction.commandName];

	try {
		if(!command) throw new Error(`Command ${interaction.commandName} unknown`);

		// Get the perm level of the command or subcommand.
		let permLevel;
		if(typeof command.perms === 'string') permLevel = command.perms;
		else permLevel = command.perms[interaction.options.getSubcommand()];
		
		if(!permLevel) throw new Error(`Permission level missing for ${interaction.options.getSubcommand()}.`);
		if(typeof interaction.member?.permissions === 'string') throw new Error(`error with ${interaction.member?.permissions}`)

		const userIsAdmin = interaction.user.id === process.env.admin || interaction.member!.permissions.has('ADMINISTRATOR');

		// Check user has correct permission.
		if(permLevel === 'admin' && !userIsAdmin) throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);

		await command.execute(interaction);
	} catch (error) {
		const msg = {
			content: "Unknown error occurred.",
			components: []
		};

		if(error instanceof UserError) {
			msg.content = error.message;
		} else {
			console.error(error);
		}

		await (interaction.replied || interaction.deferred 
			? interaction.editReply(msg) 
			: interaction.reply(msg));
	}    
}

export async function handleInteractions(interaction: Interaction) {
	if(interaction.isAutocomplete()) return addAutocomplete(interaction);
	if(interaction.isCommand()) return command(interaction);
}
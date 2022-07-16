import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { add } from './s.add';
import { find } from "./s.find";
import { remove } from "./s.remove";
import { reset } from "./s.reset";
import { reset_perms } from "./s.resetperms";
import { sort_channels } from "./s.sortchans";
import { sort_roles } from "./s.sortroles";
import { update_topics } from "./s.updtopics";

export const data = new SlashCommandBuilder()
	.setName('subjects')
	.setDescription('Manage the subjects for this guild.')
	.addSubcommand(sc => sc
		.setName('add')
		.setDescription('Add a subject to this guild')
		.addStringOption(o => o
			.setName('subject')
			.setDescription('The subject to add')
			.setRequired(true).setAutocomplete(true))
		.addChannelOption(o => o
			.setName('channel')
			.setDescription('The channel for this subject. Specify a category for generation.'))
		.addRoleOption(o => o
			.setName('role')
			.setDescription('The role to give to people who select this subject.')))
	.addSubcommand(sc => sc
		.setName('remove')
		.setDescription('Remove a subject from this guild')
		.addStringOption(o => o
			.setName('subject')
			.setDescription('The subject to remove.')
			.setRequired(true).setAutocomplete(true)))
	.addSubcommand(sc => sc
		.setName('find')
		.setDescription('Find existing subjects in this guild and auto-track them.'))
	.addSubcommand(sc => sc
		.setName('reset')
		.setDescription('Resets all subjects in this guild. COMPLETE WIPE! BE CAREFUL.'))
	.addSubcommand(sc => sc
		.setName('reset_perms')
		.setDescription('Resets the permission overwrites for all subject channels in this guild.'))
	.addSubcommand(sc => sc
		.setName('sort_roles')
		.setDescription('Sorts all the subject roles underneath the given role.')
		.addRoleOption(o => o.setName('parent_role')
			.setDescription('The role to place all the subject roles under.')
			.setRequired(true)))
	.addSubcommand(sc => sc
		.setName('sort_channels')
		.setDescription('Sorts all the subject channels underneath the given category and with categories of the given name.')
		.addChannelOption(o => o.setName('parent_category')
			.setDescription('Creates the new categories under this category. Has to be a category channel!')
			.setRequired(true))
		.addStringOption(o => o.setName('new_category_name')
			.setDescription('Sort channels into categories that match this name (case-insensitive).')
			.setRequired(true))
		.addIntegerOption(o => o.setName('category_max')
			.setDescription('Maximum number of channels per category. Defaults to 50.')))
	.addSubcommand(sc => sc
		.setName('update_topics')
		.setDescription('Update the topic of all subject channels with the correct format.')
		.addBooleanOption(o => o.setName('overwrite_existing')
			.setDescription('If a channel already has a topic, don\'t overwrite it.')));

export const perms = 'admin';

const subcommands: Record<string, (interaction: CommandInteraction) => Promise<void>> = {
	'add': add,
	'remove': remove,
	'find': find,
	'reset': reset,
	'reset_perms': reset_perms,
	'sort_roles': sort_roles,
	'sort_channels': sort_channels,
	'update_topics': update_topics,
};

export const execute = async (interaction: CommandInteraction) => {           
	if(!subcommands[interaction.options.getSubcommand()]) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

	if(!interaction.guildId) throw new Error("Invalid guild id...");
	if(!interaction.guild) throw new Error('Can\'t have guild in Detroit');

	await subcommands[interaction.options.getSubcommand()](interaction);
}
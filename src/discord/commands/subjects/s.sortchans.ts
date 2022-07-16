import Bottleneck from "bottleneck";
import { AutocompleteInteraction, CategoryChannel, Channel, CommandInteraction, GuildBasedChannel, GuildChannel, Role, RolePosition, TextChannel, VoiceChannel } from "discord.js";
import { DB, GuildEntity, SubjectEntity, SubjectInGuildEntity } from "../../../db";
import UserError from "../../UserError";
import { array_chunks, channelPatchLimiter, limiter } from "../../util";

export async function sort_channels(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Sorting '${interaction.guild!.name}' chankles - oh god!!!! WTF!!!`);

	const parent_category_opt = interaction.options.getChannel('parent_category') as GuildBasedChannel | null;
	const parent_category = await interaction.guild!.channels.fetch(parent_category_opt?.id || '');
	const new_category_name = interaction.options.getString('new_category_name') || '';
	const category_max = interaction.options.getInteger('category_max') || 50;
	if(!parent_category || parent_category.type !== 'GUILD_CATEGORY') throw new UserError('`parent_category` is required to be a category channel!');

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const sgs = await sgRepo.find({ where: { guild_id: interaction.guildId! }, relations: { subject: true } });
	sgs.sort((asg, bsg) => +bsg.priority - +asg.priority || asg.subject.name.localeCompare(bsg.subject.name));

	const allChannels = await interaction.guild!.channels.fetch();
	
	const subjectChannels = sgs.filter(sg => !!sg.channel).map(sg => allChannels.get(sg.channel)).filter(c => !!c) as TextChannel[];
	const chunks = array_chunks(subjectChannels, category_max);

	chunks.forEach((channels, i) => {
		console.log(`${`${parent_category.position}`.padStart(2)} V ${new_category_name} ${i}`);
		channels.forEach((channel, chanI) => {
			console.log(`${`${chanI}`.padStart(2)} #${channel.name}`);
		});
	});

	await Promise.all(chunks.map(async (channels, i) => {
		const category = await channelPatchLimiter.schedule(() => interaction.guild!.channels.create(new_category_name, {
			type: 'GUILD_CATEGORY',
			position: parent_category.position,
			permissionOverwrites: [
				{ id: interaction.guild!.roles.everyone.id, deny: 'VIEW_CHANNEL' },
			],
		}));
		
		for(const [chanI, channel] of channels.entries()) {
			await channelPatchLimiter.schedule(() => channel.setParent(category, { lockPermissions: false }));
			await channelPatchLimiter.schedule(() => channel.setPosition(chanI));
		}
	}));

	await interaction.editReply('it\'s done...');
}


import Bottleneck from "bottleneck";
import { AutocompleteInteraction, CategoryChannel, Channel, CommandInteraction, GuildChannel, Role, RolePosition, TextChannel, VoiceChannel } from "discord.js";
import { DB, GuildEntity, SubjectEntity, SubjectInGuildEntity } from "../../../db";
import UserError from "../../UserError";
import { array_chunks, channelPatchLimiter, limiter } from "../../util";

export async function sort_channels(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Sorting '${interaction.guild!.name}' chankles - oh god!!!! WTF!!!`);

	const category_max = interaction.options.getInteger('category_max') || 50;
	const category_match = interaction.options.getString('category_match') || '';

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const sgs = await sgRepo.find({ where: { guild_id: interaction.guildId! }, relations: { subject: true } });
	sgs.sort((asg, bsg) => asg.subject.name.localeCompare(bsg.subject.name));

	const allChannels = await interaction.guild!.channels.fetch();
	
	const subjectChannels = sgs.filter(sg => !!sg.channel).map(sg => allChannels.get(sg.channel)).filter(c => !!c) as TextChannel[];
	const chunks = array_chunks(subjectChannels, category_max);

	await Promise.all(chunks.map(async (channels, i) => {
		const category = await channelPatchLimiter.schedule(() => interaction.guild!.channels.create(category_match, {
			type: 'GUILD_CATEGORY',
			permissionOverwrites: [
				{ id: interaction.guild!.roles.everyone.id, deny: 'VIEW_CHANNEL' },
			]
		}));
		
		for(const [chanI, channel] of channels.entries()) {
			await channelPatchLimiter.schedule(() => channel.setParent(category));
			await channelPatchLimiter.schedule(() => channel.setPosition(chanI));
		}
	}));

	// chunks.forEach((channels, catIndex) => {
	// 	console.log(`V Subjects ${catIndex}`);
	// 	channels.forEach((channel, i) => console.log(`${`${i}`.padStart(`${channels.length}`.length || 1)} #${channel.name}`))
	// })

	await interaction.editReply('it\'s done...');
}


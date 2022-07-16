import { AutocompleteInteraction, Channel, CommandInteraction, GuildChannel, Role } from "discord.js";
import { DB, GuildEntity, SubjectEntity, SubjectInGuildEntity } from "../../../db";
import UserError from "../../UserError";
import { canHandleRole } from "../../util";

export async function find(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Finding for ${interaction.guild!.name}`);

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);
	const sRepo = DB.getRepository(SubjectEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const roles = await interaction.guild!.roles.fetch();
	const channels = await interaction.guild!.channels.fetch();

	await Promise.all(roles.map(async role => {

		const subjEnt = await sRepo.findOne({ where: { name: role.name }});
		if(!subjEnt) {
			console.log(`did not found ${role.name}`);
			return;
		}
		const subjGEnt = await sgRepo.findOne({ where: { guild_id: interaction.guildId!, subject_code: subjEnt.subject_code }});
		if(subjGEnt) {
			console.log(`already got ${role.name}`);
			return;
		}
		
		const channelName = role.name.toLowerCase().replace(/ /g, '-').replace(/[:,&]/g, '').replace(/--/g, '-');
		const chan = await channels.find(channel => channelName.startsWith(channel.name.toLowerCase()));
		if(!chan) {
			console.log(`no chan for ${channelName}`);
			return;
		}

		console.log(`found all for ${role.name}`);
		await sgRepo.save(sgRepo.create({ subject: subjEnt, guild: guildEnt, role: role.id, channel: chan.id }));
	}));

	await interaction.editReply('Done.');
}
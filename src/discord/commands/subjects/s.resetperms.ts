import { CommandInteraction, Role, TextChannel } from "discord.js";
import { DB, GuildEntity, SubjectInGuildEntity } from "../../../db";
import { channelPatchLimiter, limiter } from "../../util";

export async function reset_perms(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Resetting permissions for ${interaction.guild!.name}`);

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }, relations: { subjects: true }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const sgs = guildEnt.subjects;
	await Promise.all(sgs.map(async sg => {
		const channel = (interaction.guild!.channels.cache.get(sg.channel)
					|| await limiter.schedule(() => interaction.guild!.channels.fetch(sg.channel))) as TextChannel;
		const role = (interaction.guild!.roles.cache.get(sg.role)
					|| await limiter.schedule(() => interaction.guild!.roles.fetch(sg.role))) as Role;

		if(!channel || !role) return;

		console.log(`Waiting for #${channel.name}`);
		await limiter.schedule(async () => {
			console.log(`OK, doing #${channel.name}`)
			await channel.permissionOverwrites.set([
				{ id: interaction.guild!.me!.id, allow: [ 'VIEW_CHANNEL' ] },
				{ id: role.id, allow: [ 'VIEW_CHANNEL' ] },
				{ id: interaction.guild!.roles.everyone.id, deny: [ 'VIEW_CHANNEL' ] },
			]);
		});
	}));

	await interaction.editReply('Done!!!!!! DONEEE. STOP ASKING. I DID ITOK.');
}
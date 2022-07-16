import { CommandInteraction, TextChannel } from "discord.js";
import { DB, GuildEntity, SubjectInGuildEntity } from "../../../db";
import { channelPatchLimiter, limiter } from "../../util";

export async function update_topics(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Updating topics for ${interaction.guild!.name}`);

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const sgs = await sgRepo.find({ where: { guild_id: interaction.guildId! }, relations: { subject: true } });
	await Promise.all(sgs.filter(sg => !!sg.channel).map(async sg => {
		const channel = await limiter.schedule(async () => await interaction.guild!.channels.fetch(sg.channel)) as TextChannel | null;
		if(!channel) return;

		const topic = `${sg.subject.subject_code} - ${sg.subject.details_link}`;
		if(channel.topic === topic) return;

		if(channel.topic !== null && channel.topic !== '')  {
			console.log(`#${channel.name} - "${channel.topic}"`);

			// null is false (defaults to false)
			if(!interaction.options.getBoolean('overwrite_existing')) return;
		}

		await channelPatchLimiter.schedule(async () => {
			console.log(`Updating #${channel.name}`);
			await channel.setTopic(topic)
		});
	}));

	await interaction.editReply('Updated all topics.');
}


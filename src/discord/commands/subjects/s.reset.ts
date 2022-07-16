import { CommandInteraction } from "discord.js";
import { DB, GuildEntity, SubjectInGuildEntity } from "../../../db";

export async function reset(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Finding for ${interaction.guild!.name}`);

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	await sgRepo.remove(await sgRepo.find({ where: { guild_id: interaction.guildId! } }));

	await interaction.editReply('Reset all, woww!!! Good luck. with that. one.');
}


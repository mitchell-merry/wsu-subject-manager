import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { DB, GuildEntity, SubjectEntity, SubjectInGuildEntity } from "../../../db";
import UserError from "../../UserError";

export async function remove(interaction: CommandInteraction) {
	await interaction.deferReply();

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);
	const sRepo = DB.getRepository(SubjectEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const subject = interaction.options.getString('subject');
	const subjEnt = await sRepo.findOne({ where: { subject_code: subject! } });
	if(!subjEnt) throw new UserError('Invalid subject code! Only use the given autocomplete function to enter a code!');

	const sgEnt = await sgRepo.findOne({ where: { subject_code: subject!, guild_id: interaction.guildId! }});
	if(!sgEnt) throw new UserError(`The subject ${subjEnt.name} is not tracked in this server.`);

	if(sgEnt.role) {
		const r = interaction.guild!.roles.cache.get(sgEnt.role);
		await r?.delete();
	}

	if(sgEnt.channel) {
		const c = interaction.guild!.channels.cache.get(sgEnt.channel);
		await c?.delete();
	}

	await sgRepo.delete(sgEnt);

	interaction.editReply('Deleted.');
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const subjRepo = DB.getRepository(SubjectInGuildEntity);
	const val = interaction.options.getFocused(true).value.toLowerCase();

	let subjFiltered = (await subjRepo.find()).filter(subj => {
		const n = `${subj.subject_code} ${subj.subject.name}`.toLowerCase();
		return n.includes(val);
	});

	subjFiltered.sort((subjA, subjB) => {
		const aname = `${subjA.subject_code} ${subjA.subject.name}`.toLowerCase();
		const bname = `${subjB.subject_code} ${subjB.subject.name}`.toLowerCase();
		return aname.indexOf(val) - bname.indexOf(val);
	});
	
	const options = subjFiltered.map(subj => ({
		name: `${subj.subject_code} ${subj.subject.name}`,
		value: subj.subject_code
	})).slice(0, 25);

	interaction.respond(options);
}
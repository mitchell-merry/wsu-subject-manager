import { AutocompleteInteraction, Channel, CommandInteraction, GuildChannel, Role, RolePosition } from "discord.js";
import { DB, GuildEntity, SubjectEntity, SubjectInGuildEntity } from "../../../db";

export async function sort_roles(interaction: CommandInteraction) {
	await interaction.deferReply();
	console.log(`Sorting '${interaction.guild!.name}' - oh god!!!! WTF!!!`);

	const sgRepo = DB.getRepository(SubjectInGuildEntity)
	const gRepo = DB.getRepository(GuildEntity);

	const guildEnt = await gRepo.findOne({ where: { guild_id: interaction.guildId! }});
	if(!guildEnt) throw new Error("error, guild no set lol.");

	const sgs = await sgRepo.find({ where: { guild_id: interaction.guildId! }, relations: { subject: true } });
	sgs.sort((asg, bsg) => asg.subject.name.localeCompare(bsg.subject.name));

	const parent_role = interaction.options.getRole('parent_role')!;

	const allRoles = await interaction.guild!.roles.fetch();
	const roles = allRoles.filter(role => !sgs.find(sg => sg.role === role.id));
	roles.sort((ar, br) => br.position - ar.position);

	const before = Array.from(roles.filter(role => role.position >= parent_role.position)).map(([a, r]) => r);
	const after = Array.from(roles.filter(role => role.position < parent_role.position)).map(([a, r]) => r);
	const subjR = sgs.map(sg => allRoles.find(r => r.id === sg.role)).filter(r => !!r) as Role[];

	const newRoles = [...Array.from(before), ...subjR, ...after];
	newRoles.reverse();

	const positions: RolePosition[] = newRoles.map((role, position) => ({ role, position }));
	await interaction.guild!.roles.setPositions(positions);

	await interaction.editReply('it\'s done...');
}


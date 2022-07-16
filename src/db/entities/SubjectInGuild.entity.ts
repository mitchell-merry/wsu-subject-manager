import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GuildEntity } from './Guild.entity';
import { SubjectEntity } from './Subject.entity';

@Entity({ name: 'subject_in_guild' })
export class SubjectInGuildEntity {

	/** The discord guild's ID. */
	@PrimaryColumn()
	guild_id!: string;

	/** The subject's code. */
	@PrimaryColumn()
	subject_code!: string;

	/** The channel for the subject in the guild. */
	@Column()
	channel!: string;

	/** The role for the subject in the guild. */
	@Column()
	role!: string;

	/** The guild entity. */
	@ManyToOne(() => GuildEntity, guild => guild.subjects)
	@JoinColumn({ name: 'guild_id' })
	guild!: GuildEntity;

	/** The subject entity. */
	@ManyToOne(() => SubjectEntity, subj => subj.guilds)
	@JoinColumn({ name: 'subject_code' })
	subject!: SubjectEntity;
	
	constructor(guild_id: string, subject_code: string, channel: string, role: string) {
		this.guild_id = guild_id;
		this.subject_code = subject_code;
		this.channel = channel;
		this.role = role;
	}
}
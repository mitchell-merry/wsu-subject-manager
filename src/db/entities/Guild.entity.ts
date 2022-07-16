import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { SubjectInGuildEntity } from './SubjectInGuild.entity';

@Entity({ name: 'guild' })
export class GuildEntity {

	/** The discord guild's ID. */
	@PrimaryColumn()
	guild_id!: string;

	/** The ID of the role which unhides all channels. */
	@Column({ nullable: true })
	unhide_role!: string;

	/** The ID of the parent category where the channels will be under. */
	@Column({ nullable: true })
	parent_category!: string;

	/** The ID of the parent role where subject roles will be under. */
	@Column({ nullable: true })
	parent_role!: string;

	/** The subjects this guild has. */
	@OneToMany(() => SubjectInGuildEntity, subj => subj.guild)
	subjects!: SubjectInGuildEntity[];

	constructor(guild_id: string) {
		this.guild_id = guild_id;
	}
}
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { SubjectInGuildEntity } from './SubjectInGuild.entity';

@Entity({ name: 'subject' })
export class SubjectEntity {

	/** The subject's code. */
	@PrimaryColumn()
	subject_code!: string;

	/** The name of this subject. */
	@Column()
	name!: string;

	/** The subject description (tag) this subject belongs to. */
	@Column()
	description!: string;

	/** The link to the subject details page in the handbook. */
	@Column()
	details_link!: string;

	/** The legacy code for the subject. */
	@Column({ nullable: true })
	legacy_code!: string;

	/** The guilds this subject is in. */
	@OneToMany(() => SubjectInGuildEntity, guild => guild.subject)
	guilds!: SubjectInGuildEntity[];

	constructor(subject_code: string, name: string, description: string, details_link: string, legacy_code: string) {
		this.subject_code = subject_code;
		this.name = name;
		this.description = description;
		this.details_link = details_link;
		this.legacy_code = legacy_code;
	}
}
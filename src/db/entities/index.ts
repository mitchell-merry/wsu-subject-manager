import { GuildEntity } from "./Guild.entity";
import { SubjectEntity } from "./Subject.entity";
import { SubjectInGuildEntity } from "./SubjectInGuild.entity";

export * from "./Guild.entity";
export * from "./Subject.entity";
export * from "./SubjectInGuild.entity";

export const entities = [ GuildEntity, SubjectEntity, SubjectInGuildEntity ];
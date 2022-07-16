import Bottleneck from "bottleneck";
import { GuildMember, Role } from "discord.js";

export const limiter = new Bottleneck({
	reservoir: 25,
	reservoirRefreshAmount: 25,
	reservoirRefreshInterval: 1000
});

export const channelPatchLimiter = new Bottleneck({
	reservoir: 3,
	reservoirRefreshAmount: 3,
	reservoirRefreshInterval: 1000,
	maxConcurrent: 1,
	minTime: 333
});

export function canHandleRole(role: Role, me: GuildMember) {
	return me.roles.highest.comparePositionTo(role) > 0;
}

export function array_chunks<T>(array: T[], chunk_size: number) {
	return Array(Math.ceil(array.length / chunk_size))
		.fill(0).map((_, index) => index * chunk_size)
		.map(begin => array.slice(begin, begin + chunk_size));
}
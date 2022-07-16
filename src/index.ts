import 'dotenv/config';
import 'reflect-metadata';

import { Client, Intents } from 'discord.js';

import * as interactions from './discord/interactions';
import { DB, synchronizeGuilds } from './db/index';

export const client = new Client({ intents: [ Intents.FLAGS.GUILDS ] });

client.on('ready', async () => {
	// Log guilds bot is in on startup
	console.log(`Logged in as ${client.user!.tag} and in the following Guilds: [${client.guilds.cache.size}]`);
	client.guilds.cache.forEach(g => {
		console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
	});

	interactions.init();

	// Initialise database
	await DB.initialize()
		.then(() => console.log("Data Source has been initialized!"))
		.catch(err => console.error("Error during Data Source initialization", err));

	// Add guilds bot doesn't currently track to database
	await synchronizeGuilds(client.guilds);
});

client.on('interactionCreate', interactions.handleInteractions);

client.on('rateLimit', data => {
	console.log(data);
});

client.login(process.env.TOKEN);
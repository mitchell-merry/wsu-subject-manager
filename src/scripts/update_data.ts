import 'dotenv/config';
import 'reflect-metadata';

import { DB, SubjectEntity } from '../db';
import subjects from "./DATA_subjects_f.json";

(async () => {
	// Initialise database
	await DB.initialize()
		.then(() => console.log("Data Source has been initialized!"))
		.catch(err => console.error("Error during Data Source initialization", err));

	const subjRepo = DB.getRepository(SubjectEntity);

	await Promise.all(subjects.map(async subjData => {
		const subjEnt = subjRepo.create({ ...subjData, subject_code: subjData.code});
		await subjRepo.save(subjEnt);
	}));

	await DB.destroy();
})();
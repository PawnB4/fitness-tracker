// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from "./0000_bent_radioactive_man.sql";
import m0001 from "./0001_seed-exercises-1.sql";
import m0002 from "./0002_seed-exercises-2.sql";
import m0003 from "./0003_seed-exercises-3.sql";
import m0004 from "./0004_nervous_miek.sql";
import m0005 from "./0005_friendly_red_ghost.sql";
import m0006 from "./0006_jittery_abomination.sql";
import m0007 from "./0007_wonderful_the_santerians.sql";
import m0008 from "./0008_stale_toad_men.sql";
import m0009 from "./0009_lucky_reavers.sql";
import journal from "./meta/_journal.json";

export default {
	journal,
	migrations: {
		m0000,
		m0001,
		m0002,
		m0003,
		m0004,
		m0005,
		m0006,
		m0007,
		m0008,
		m0009,
	},
};

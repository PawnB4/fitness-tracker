import m0000 from "./0000_oval_riptide.sql";
import m0001 from "./0001_seed-exercises-1.sql";
import m0002 from "./0002_seed-exercises-2.sql";
import m0003 from "./0003_seed-exercises-3.sql";
import journal from "./meta/_journal.json";

export default {
	journal,
	migrations: {
		m0000,
		m0001,
		m0002,
		m0003,
	},
};

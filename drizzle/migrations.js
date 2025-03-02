// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_perpetual_the_leader.sql';
import m0001 from './0001_seed-exercises-1.sql';
import m0002 from './0002_seed-exercises-2.sql';
import m0003 from './0003_seed-exercises-3.sql';
import m0004 from './0004_lyrical_warbird.sql';
import m0005 from './0005_parched_stephen_strange.sql';
import m0006 from './0006_square_paibok.sql';
import m0007 from './0007_bouncy_husk.sql';

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
m0007
    }
  }
  
import { getDBData } from './app/actions/db';

async function run() {
  console.log("Testing getDBData...");
  const res = await getDBData();
  console.log(res);
}

run();

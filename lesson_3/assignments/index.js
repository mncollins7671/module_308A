import { central, db1, db2, db3, vault } from "./databases.js";

async function getUserData(id) {
    const dbs = {
        db1: db1,
        db2: db2,
        db3: db3
    };

    const centralDb = await central(id);
    const vaultData = await vault(id);
    const object = dbs[centralDb](id);

    return centralDb.then(() => {
        Promise.all([object, vaultData]).then(([basicInfo, personalInfo]) => {
            return object.assign(basicInfo, personalInfo);
        });
    })
}
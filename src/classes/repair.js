"use strict";

function main(pmcData, body, sessionID) {
    let output = item_f.itemServer.getOutput();
    let tmpTraderInfo = trader_f.traderServer.getTrader(body.tid, sessionID);
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.repairItems;

    for (let repairItem of RequestData) {
        let itemToRepair = undefined;
        
        for (let item of pmcData.Inventory.items) {
            if (item._id === repairItem._id) {
                itemToRepair = item;
            }
        }

        if (itemToRepair === undefined) {
            continue;
        }

        let itemRepairCost = Math.round((items.data[itemToRepair._tpl]._props.RepairCost * repairItem.count * repairRate) * settings.gameplay.trading.repairMultiplier);

        // pay the item	to profile
        if (!itm_hf.payMoney(pmcData, {scheme_items: [{id: repairItem._id, count: Math.round(itemRepairCost)}], tid: body.tid}, sessionID)) {
            logger.logError("no money found");
            return "";
        }

        // change item durability
        let calculateDurability = itemToRepair.upd.Repairable.Durability + repairItem.count;

        if (itemToRepair.upd.Repairable.MaxDurability <= calculateDurability) {
            calculateDurability = itemToRepair.upd.Repairable.MaxDurability;
        }

        itemToRepair.upd.Repairable.Durability = calculateDurability;
        itemToRepair.upd.Repairable.MaxDurability = calculateDurability;
        output.data.items.change.push(itemToRepair);
    }

    return output;
}

module.exports.main = main;

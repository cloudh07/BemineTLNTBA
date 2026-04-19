function HasItem(player, itemName, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.hasItem({
      itemName = itemName,
      amount = amount
    })
  elseif Config.Framework == 'esx' then
    local xItem = player.hasItem(itemName)
    if not xItem then return false end
    return xItem.count >= amount
  end
end

function RemoveItem(player, itemName, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.removeInventoryItem({
      itemName = itemName,
      amount = amount
    })
  elseif Config.Framework == 'esx' then
    return player.removeInventoryItem(itemName, amount)
  end
end

function AddMoney(player, type, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.addAccountMoney(type, amount)
  elseif Config.Framework == 'esx' then
    return player.addMoney(amount)
  end
end

function HasMoney(player, type, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.getAccountMoney(type) >= amount
  elseif Config.Framework == 'esx' then
    return player.getAccountMoney(type).money >= amount
  end
end

function RemoveMoney(player, type, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.removeAccountMoney(type, amount)
  elseif Config.Framework == 'esx' then
    return player.addMoney(amount)
  end
end

function GetPlayerFromId(playerSrc)
  if Config.Framework == 'ProjectStarboy' then
    return Framework.GetPlayerFromSource(playerSrc)
  elseif Config.Framework == 'esx' then
    return Framework.GetPlayerFromId(playerSrc)
  elseif Config.Framework == 'qbox' or Config.Framework == 'qb' then
    return Framework.Functions.GetPlayer(playerSrc)
  end
end

---@param player table
---@return string|nil
function GetPlayerIdentifier(player)
  if Config.Framework == 'esx' then
    return player.identifier
  elseif Config.Framework == 'qbox' or Config.Framework == 'qb' then
    return player.PlayerData and player.PlayerData.citizenid or nil
  end
end

---@param player table
---@param account string
---@param amount number
function AddPlayerAccountMoney(player, account, amount)
  if Config.Framework == 'ProjectStarboy' then
    return player.addAccountMoney(account, amount)
  elseif Config.Framework == 'esx' then
    return player.addAccountMoney(account, amount)
  elseif Config.Framework == 'qbox' or Config.Framework == 'qb' then
    return player.Functions.AddMoney(account, amount, 'cl_caseOpening')
  end
end

---@param itemName string
---@param cb fun(playerId: number)
function RegisterFrameworkUsableItem(itemName, cb)
  if Config.Framework == 'esx' then
    Framework.RegisterUsableItem(itemName, cb)
  elseif Config.Framework == 'qbox' or Config.Framework == 'qb' then
    Framework.Functions.CreateUseableItem(itemName, function(source, _item)
      cb(source)
    end)
  end
end

function ShowNotification(playerSrc, message, type)
  if Config.Framework == "ProjectStarboy" then
    return TriggerClientEvent("Player:ShowNotification", playerSrc, {
      message = message,
      type = type
    })
  end
end

function AddExp(playerSrc, amount)
  if Config.Framework == "ProjectStarboy" then
    return exports.ProjectStarboy:addExp(playerSrc, amount)
  end
end

function AddSkillExp(playerSrc, skill, amount)
  if Config.Framework == "ProjectStarboy" then
    return exports.ProjectStarboy:addSkillExp(playerSrc, skill, amount)
  end
end

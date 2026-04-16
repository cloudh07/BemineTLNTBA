function GetJob()
  if Config.Framework == 'ProjectStarboy' then
    return Framework.PlayerData.job
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData().job
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local pd = Framework.Functions.GetPlayerData()
    return pd and pd.job or nil
  end
end

function GetFactionRank()
  if Config.Framework == 'ProjectStarboy' then
    return Framework.Faction.getPlayerRank()
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData().rank
  end
end

function HasFactionPrivilege(privilege)
  if Config.Framework == 'ProjectStarboy' then
    return Framework.Faction.can(privilege)
  end
end

function GetPlayerData()
  if Config.Framework == 'ProjectStarboy' then
    return Framework.PlayerData.data
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData()
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    return Framework.Functions.GetPlayerData()
  end
end

--- Shape expected by NUI (`UserInfo.accounts`).
function BuildNuiUserInfo()
  if Config.Framework == "esx" then
    local pd = Framework.GetPlayerData()
    if not pd then return nil end
    local accounts = { money = 0, bank = 0, point = 0, medal = 0, black_money = 0, coin = 0, vnd = 0 }
    for i = 1, #(pd.accounts or {}) do
      local acc = pd.accounts[i]
      if acc and acc.name then
        accounts[acc.name] = acc.money or 0
      end
    end
    return { accounts = accounts }
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local pd = Framework.Functions.GetPlayerData()
    if not pd then return nil end
    local m = pd.money or {}
    return {
      accounts = {
        money = m.cash or 0,
        bank = m.bank or 0,
        point = m.point or 0,
        medal = m.medal or 0,
        black_money = m.black_money or 0,
        coin = m.crypto or m.gdcoin or 0,
        vnd = m.vnd or 0,
      }
    }
  end
  return nil
end

function GetSkillExp(skill)
  if Config.Framework == 'ProjectStarboy' then
    return GetPlayerData().skills[skill]
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData().skills[skill]
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local pd = GetPlayerData()
    return pd and pd.metadata and pd.metadata.skills and pd.metadata.skills[skill] or nil
  end
end

function GetLevel()
  if Config.Framework == 'ProjectStarboy' then
    return Framework.PlayerData.getLevel()
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData().level
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local pd = GetPlayerData()
    return pd and pd.metadata and pd.metadata.level or nil
  end
end

function GetSkillLevel(skill)
  if Config.Framework == 'ProjectStarboy' then
    return Framework.PlayerData.getSkillLevel(skill)
  end
  if Config.Framework == "esx" then
    return Framework.GetPlayerData().level
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local pd = GetPlayerData()
    return pd and pd.metadata and pd.metadata.skillLevels and pd.metadata.skillLevels[skill] or nil
  end
end

function ShowNotification(msg, type, duration)
  if not duration then
    duration = 5000
  end
  if Config.Framework == "esx" then
    return Framework.ShowNotification(msg, type, duration)
  end
  if Config.Framework == "qb" or Config.Framework == "qbox" then
    local notifyType = type or "inform"
    if Config.Framework == "qbox" then
      return exports.qbx_core:Notify(msg, notifyType, duration)
    end
    lib.notify({ description = msg, duration = duration, type = notifyType })
  end
  print("ShowNotification not implement", msg, type, duration)
end


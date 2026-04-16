Config = {}

Config.Dependencies = {} -- Reqired resources loaded to start
Config.Locale = 'vi'

Config.Settings = {
  locale = Locales[Config.Locale] or Locales['default']
}

--Dont touch this
Config.EnableModules = {
  ["Main"] = {
    enabled = true,
    client = true, -- enable client side
    priority = 2,  -- 1 : init on start | 2 : init on player loaded
  },
}
Config.Debug = true
Config.Nui = false
Config.Dev = false
---@type "qb" | "qbox" | "esx" | "ProjectStarboy" | "standalone"
Config.Framework = "qbox"
Config.ClientLazyLoad = false

function L(key, ...)
  if Config.Settings.locale[key] then
    return string.format(Config.Settings.locale[key], ...)
  else
    return key
  end
end

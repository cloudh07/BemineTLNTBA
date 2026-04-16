---@class MainImpl : Impl
local Impl = NewImpl("Main")

function Impl:Init()
    main:LogInfo("%s initialized", self:GetName())
    self.PlayerData = nil
    self.Items = {}
    self.inventory = {}
    self.inventorys = {}
    self:HandleEvent()
    self:HandleNuiCallback()
end

function Impl:OnReady()
    for item, data in pairs(exports.ox_inventory:Items()) do
        self.Items[item] = data.label
    end
    SendReactMessage("main:setItemLabels", self.Items)
    self.PlayerData = BuildNuiUserInfo()
    SendReactMessage("main:setUserInfo", self.PlayerData)
    self.inventory = exports.ox_inventory:GetPlayerItems()
    while self.inventory == nil do
        Wait(1000)
        self.inventory = exports.ox_inventory:GetPlayerItems()
    end
    self:ParserInventory(self.inventory)
end

function Impl:HandleEvent()
    if Config.Framework == "qb" or Config.Framework == "qbox" then
        RegisterNetEvent("QBCore:Client:OnPlayerLoaded", function()
            self.PlayerData = BuildNuiUserInfo()
            SendReactMessage("main:setUserInfo", self.PlayerData)
        end)
        RegisterNetEvent("QBCore:Client:OnMoneyChange", function()
            self.PlayerData = BuildNuiUserInfo()
            SendReactMessage("main:setUserInfo", self.PlayerData)
        end)
        RegisterNetEvent("qbx_core:client:playerLoggedOut", function()
            self.PlayerData = nil
            SendReactMessage("main:setUserInfo", nil)
        end)
    end

    RegisterNetEvent("ox_inventory:updateInventory", function(changes)
        for k, v in pairs(changes) do
            k = tostring(k)
            if v == false then
                self.inventorys[k] = nil
            end
            if v then
                self.inventorys[k] = v
            end
        end
        SendReactMessage("main:setUserItems", self.inventorys)
    end)


    RegisterNetEvent("opencase:client:openCaseItem", function(data)
        self:OpenUI(data)
    end)
end

function Impl:HandleNuiCallback()
    RegisterNuiCallback("main:close", function(data, cb)
        self:CloseUI()
        cb("ok")
    end)
    RegisterNuiCallback("main:openCase", function(data, cb)
        if OpenCase[data.caseName] then
            local success = lib.callback.await("opencase:server:case:open", false, data)
            cb(success)
        else
            cb({ success = false, message = "Case not found" })
        end
    end)

    RegisterNuiCallback("main:claimReward", function(data, cb)
        local success = lib.callback.await("opencase:server:case:claimReward", false, data)
        cb(true)
    end)
end

function Impl:OpenUI(data)
    SetNuiFocus(true, true)
    SendReactMessage("main:setShow", true)
    SendReactMessage("main:setData", data)
end

function Impl:CloseUI()
    SetNuiFocus(false, false)
    SendReactMessage("main:setShow", false)
end

function Impl:ParserInventory(inventorys)
    for k, v in pairs(inventorys) do
        k = tostring(k)
        if v == false then
            self.inventorys[k] = nil
        end
        if v then
            self.inventorys[k] = v
        end
    end
    SendReactMessage("main:setUserItems", self.inventorys)
end

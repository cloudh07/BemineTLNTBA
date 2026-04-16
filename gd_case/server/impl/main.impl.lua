---@class MainImpl : Impl
local Impl = NewImpl("Main")

function Impl:Init()
    main:LogInfo("%s ready", self:GetName())
    self:RegisterUseItem()
    self:HandleEvent()
    self.PlayerOpenCases = {}
end

function Impl:OnReady()

end

function Impl:HandleEvent()
    lib.callback.register("opencase:server:case:open", function(source, data)
        local xPlayer = GetPlayerFromId(source)
        if not xPlayer then return { success = false, message = "Player not found" } end

        local idKey = GetPlayerIdentifier(xPlayer)
        if not idKey then return { success = false, message = "Player not found" } end

        if data.consumeType == "item" then
            local caseName = data.caseName
            local amount = data.amount or 1
            local count = exports.ox_inventory:GetItemCount(source, caseName)

            if count >= amount then
                exports.ox_inventory:RemoveItem(source, caseName, amount)
                local listItems = self:GetPercent(OpenCase[caseName].items, 1)
                local items = {}
                for i = 1, data.amount do
                    local item = listItems[math.random(1, #listItems)]
                    table.insert(items, item)
                end
                self.PlayerOpenCases[idKey] = {}
                self.PlayerOpenCases[idKey].items = items
                self.PlayerOpenCases[idKey].amount = amount

                return { success = true, data = { items = items } }
            else
                return { success = false, message = "Hòm quay không đủ" }
            end
        end

        return { success = false, message = "Case type not found" }
    end)

    lib.callback.register("opencase:server:case:claimReward", function(source, data)
        local xPlayer = GetPlayerFromId(source)

        if not xPlayer then return { success = false, message = "Player not found" } end

        local idKey = GetPlayerIdentifier(xPlayer)
        if not idKey then return { success = false, message = "Player not found" } end

        if not self.PlayerOpenCases[idKey] then return { success = false, message = "No case to claim" } end

        local claimList = data.items
        if not claimList or type(claimList) ~= "table" or #claimList == 0 then
            return { success = false, message = "No items to claim" }
        end

        local stored = self.PlayerOpenCases[idKey].items
        if not stored then return { success = false, message = "No case to claim" } end

        local toAdd = {}
        for i = 1, #claimList do
            local claim = claimList[i]
            local v = stored[i]
            if claim and v and claim.name == v.name and v.type == "item" then
                local metadata = claim.metadata or v.metadata
                toAdd[#toAdd + 1] = { name = claim.name, metadata = metadata }
            end
        end

        if #toAdd == 0 then
            return { success = false, message = "Không có vật phẩm hợp lệ để nhận" }
        end

        for i = 1, #toAdd do
            local entry = toAdd[i]
            if not exports.ox_inventory:CanCarryItem(source, entry.name, 1, entry.metadata) then
                return { success = false, message = "Túi đồ đầy hoặc không đủ chỗ trọng lượng" }
            end
        end

        for i = 1, #toAdd do
            local entry = toAdd[i]
            if not exports.ox_inventory:AddItem(source, entry.name, 1, entry.metadata) then
                return { success = false, message = "Không thể thêm vật phẩm vào túi đồ" }
            end
        end

        self.PlayerOpenCases[idKey] = nil

        return { success = true }
    end)
end

function Impl:RegisterUseItem()
    for key, data in pairs(OpenCase) do
        RegisterFrameworkUsableItem(data.name, function(playerId)
            TriggerClientEvent("opencase:client:openCaseItem", playerId, data)
        end)
    end
end

function Impl:GetRateItems(data)
    local pool, sum = {}, 0
    for _, v in ipairs(data) do
        for _ = 1, v.percent do
            pool[#pool + 1] = v
        end
        sum = sum + v.percent
    end
    return pool, sum
end

function Impl:shuffle(t)
    for i = #t, 2, -1 do
        local j = math.random(i)
        t[i], t[j] = t[j], t[i]
    end
end

function Impl:isValid(list, maxStreak)
    local streak, last = 1, list[1].name
    for i = 2, #list do
        if list[i].name == last then
            streak = streak + 1
            if streak > maxStreak then return false end
        else
            streak, last = 1, list[i].name
        end
    end
    return true
end

function Impl:GetPercent(data, maxStreak)
    local pool, sum = self:GetRateItems(data)
    if sum ~= 100 then print(("⚠️ Tổng percent = %d, khác 100"):format(sum)) end

    local list = {}
    for i = 1, math.min(sum, #pool) do
        list[i] = pool[i]
    end

    maxStreak = maxStreak or 3
    local attempt = 0
    repeat
        self:shuffle(list)
        attempt = attempt + 1
    until self:isValid(list, maxStreak) or attempt > 500

    return list
end

import { debugData } from '@/utils/debugData';

debugData([
  {
    event: 'main:setShow',
    data: true
  },
  {
    event: 'main:setUserInfo',
    data: {
      accounts: {
        coin: 100000000,
        money: 100000,
        bank: 50000,
        black_money: 30000,
        point: 10333,
        medal: 1000,
        vnd: 1000000,
      },
    },
  },
  {
    event: 'main:setUserItems',
    data: {
      1: {
        label: 'Súng lục',
        stack: false,
        name: 'WEAPON_PISTOL',
        count: 1,
        metadata: [],
        slot: 1,
        close: true,
        description: 'Súng lục có thể nâng cấp',
        weight: 2500,
      },
      2: {
        label: 'Dao',
        stack: false,
        name: 'WEAPON_KNIFE',
        count: 1,
        metadata: [],
        slot: 2,
        close: true,
        description: 'Dao có thể nâng cấp',
        weight: 1500,
      },
      3: {
        label: 'Áo giáp',
        stack: false,
        name: 'ARMOUR',
        count: 1,
        metadata: [],
        slot: 3,
        close: true,
        description: 'Áo giáp có thể nâng cấp',
        weight: 5000,
      },
      16: {
        label: 'Sắt',
        stack: true,
        name: 'iron',
        count: 25,
        metadata: [],
        slot: 16,
        close: false,
        description: 'Nguyên liệu sắt',
        weight: 100,
      },
      17: {
        label: 'Thép',
        stack: true,
        name: 'steel',
        count: 15,
        metadata: [],
        slot: 17,
        close: false,
        description: 'Nguyên liệu thép',
        weight: 150,
      },
      18: {
        label: 'Vàng',
        stack: true,
        name: 'gold',
        count: 8,
        metadata: [],
        slot: 18,
        close: false,
        description: 'Nguyên liệu vàng',
        weight: 200,
      },
      19: {
        label: 'Kim cương',
        stack: true,
        name: 'diamond',
        count: 3,
        metadata: [],
        slot: 19,
        close: false,
        description: 'Nguyên liệu kim cương',
        weight: 250,
      },
      20: {
        label: 'Da',
        stack: true,
        name: 'leather',
        count: 35,
        metadata: [],
        slot: 20,
        close: false,
        description: 'Nguyên liệu da',
        weight: 80,
      },
      21: {
        label: 'rương blue gems',
        stack: true,
        name: 'newbie_case',
        count: 22,
        metadata: [],
        slot: 21,
        close: false,
        description: 'Nhận skin súng, phụ kiện súng và các nhu yếu phẩm',
        weight: 100,
      },
    },
  },
  {
    event: 'main:setItemLabels',
    data: {
      WEAPON_PISTOL: 'Súng lục',
      WEAPON_KNIFE: 'Dao',
      ARMOUR: 'Áo giáp',
      iron: 'Sắt',
      steel: 'Thép',
      gold: 'Vàng',
      diamond: 'Kim cương',
      leather: 'Da',
      clothing_case: 'Hòm quần áo',
      vip_character_chest: 'Rương nhân vật vip',
      weapon_upgrade_kit: 'Hộp nâng cấp vũ khí',
      premium_style_chest: 'Hòm thời trang premium',
    },
  },
  {
    event: "main:setData",
    data: {
      label: "Rương Newbie",
      consumeType: "item", // item
      description: "Nhận skin súng, phụ kiện súng và các nhu yếu phẩm",
      name: "newbie_case",
      items: {
        1: { name: "308e66381bac52bc", gender: "male", imageUrl: "https://cdn.lorax.vn/static/-0-component-4-0-1.webp", percent: 30, type: "clothing", metadata: { rarity: 2 } },
        2: { name: "308e66381bac52bc", gender: "female", imageUrl: "https://cdn.lorax.vn/static/-0-component-4-0-1.webp", percent: 20, type: "clothing", metadata: { rarity: 4 } },
        3: { name: "308e66381bac52bc", gender: "male", imageUrl: "https://cdn.lorax.vn/static/-0-component-4-0-1.webp", percent: 8, type: "clothing", metadata: { rarity: 5 } },
        4: { name: "308e66381bac52bc", gender: "female", imageUrl: "https://cdn.lorax.vn/static/-0-component-4-0-1.webp", percent: 2, type: "clothing", metadata: { rarity: 7 } }
      },
      buttons: [1, 5, 10]
      // cases: {
      //   1: {
      //     id: "tattoo-case",
      //     name: "tattoo_card_case",
      //     type: "tattoo_card",
      //     label: "Rương thẻ xăm",
      //     description: "Nhận thẻ xăm ngẫu nhiên",
      //     price: 300000,
      //     currency: "xcoin",
      //     items: [
      //       { name: "tattoo_c1_card1", rarity: "uncommon", percent: 30, type: "item" },
      //       { name: "tattoo_b1_card1", rarity: "rare", percent: 20, type: "item" },
      //       { name: "tattoo_a1_card1", rarity: "epic", percent: 8, type: "item" },
      //       { name: "tattoo_s_card1", rarity: "legendary", percent: 2, type: "item" }
      //     ]
      //   },
      //   2: {
      //     id: "vehicle-case",
      //     name: "vehicle_card_case",
      //     type: "vehicle_card",
      //     label: "Rương thẻ xe",
      //     description: "Nhận thẻ xe ngẫu nhiên",
      //     price: 500000,
      //     currency: "xcoin",
      //     items: [
      //       { name: "vehicle_c_card", rarity: "uncommon", percent: 30, type: "item" },
      //       { name: "vehicle_b_card", rarity: "rare", percent: 20, type: "item" },
      //       { name: "vehicle_a_card", rarity: "epic", percent: 8, type: "item" },
      //       { name: "vehicle_s_card", rarity: "legendary", percent: 2, type: "item" }
      //     ]
      //   },
      //   3: {
      //     id: "blue-gems-case",
      //     name: "blue_gems_case",
      //     type: "other",
      //     label: "Rương vật phẩm",
      //     description: "Nhận vật phẩm ngẫu nhiên",
      //     price: 50000,
      //     currency: "money",
      //     items: [
      //       { name: "bread", rarity: "common", percent: 40, type: "item" },
      //       { name: "water", rarity: "common", percent: 40, type: "item" },
      //       { name: "gold_ore", rarity: "rare", percent: 15, type: "item" },
      //       { name: "iron_ore", rarity: "uncommon", percent: 5, type: "item" }
      //     ]
      //   }
      // }
    }
  }
]);
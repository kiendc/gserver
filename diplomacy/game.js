// JavaScript source code
game = {
    map: map,
    provinces: [
        {
            regId: 0,
			code: "Cly",
			supply: false,
        },
        {
            regId: 1,
			code: "Lon",
			supply: true,
        },
        {
            regId: 2,
			code: "Nwy",
			supply: true,
            type: 2,
        },
        {
            regId: 3,
			code: "Nrg",
			supply: false,
            type: 2,
        },
        {
            regId: 4,
			code: "Bar",
			supply: false,
            type: 2,
        },
        {
            regId: 5,
			code: "Nth",
			supply: false,
            type: 2,
        },
        {
            regId: 6,
			code: "Iri",
			supply: false,
            type: 2,
        },
        {
            regId: 7,
			code: "Eng",
			supply: false,
            type: 2,
        },
        {
            regId: 8,
			code: "Hel",
			supply: false,
            type: 2,
        },
        {
            regId: 9,
			code: "Ska",
			supply: false,
            type: 2,
        },
        {
            regId: 10,
			code: "Mid",
			supply: false,
            type: 2,
        },
        {
            regId: 11,
			code: "Wes",
			supply: false,
            type: 2,
        },
        {
            regId: 12,
			code: "GoL",
			supply: false,
            type: 2,
        },
        {
            regId: 13,
			code: "Tyn",
			supply: false,
            type: 2,
        },
        {
            regId: 14,
			code: "Ion",
			supply: false,
            type: 2,
        },
        {
            regId: 15,
			code: "Adr",
			supply: false,
            type: 2,
        },
        {
            regId: 16,
			code: "Aeg",
			supply: false,
            type: 2,
        },
        {
            regId: 17,
			code: "Eas",
			supply: false,
            type: 2,
        },
        {
            regId: 18,
			code: "Bla",
			supply: false,
            type: 2,
        },
        {
            regId: 19,
			code: "Bal",
			supply: false,
            type: 2,
        },
        {
            regId: 20,
			code: "Edi",
			supply: true,
            type: 1,
        },
        {
            regId: 21,
			code: "Lvp",
			supply: true,
            type: 1,
        },
        {
            regId: 22,
			code: "Yor",
			supply: false,
            type: 1,
        },
        {
            regId: 23,
			code: "Wal",
			supply: false,
            type: 1,
        },
        {
            regId: 24,
			code: "Bre",
			supply: true,
            type: 1,
        },
        {
            regId: 25,
			code: "Pic",
			supply: false,
            type: 1,
        },
        {
            regId: 26,
			code: "Bur",
			supply: false,
            type: 1,
        },
        {
            regId: 27,
			code: "Par",
			supply: true,
            type: 1,
        },
        {
            regId: 28,
			code: "Gas",
			supply: false,
            type: 1,
        },
        {
            regId: 29,
			code: "Mar",
			supply: true,
            type: 1,
        },
        {
            regId: 30,
			code: "Spa",
			supply: true,
            type: 1,
        },
        {
            regId: 31,
			code: "Por",
			supply: true,
            type: 1,
        },
        {
            regId: 32,
			code: "NAf",
			supply: false,
            type: 1,
        },
        {
            regId: 33,
			code: "Tun",
			supply: true,
            type: 1,
        },
        {
            regId: 34,
			code: "Pie",
			supply: false,
            type: 1,
        },
        {
            regId: 35,
			code: "Tus",
			supply: false,
            type: 1,
        },
        {
            regId: 36,
			code: "Ven",
			supply: true,
            type: 1,
        },
        {
            regId: 37,
			code: "Rom",
			supply: true,
            type: 1,
        },
        {
            regId: 38,
			code: "Apu",
			supply: false,
            type: 2,
        },
        {
            regId: 39,
			code: "Nap",
			supply: true,
            type: 1,
        },
        {
            regId: 40,
			code: "Bel",
			supply: true,
            type: 1,
        },
        {
            regId: 41,
			code: "Hol",
			supply: true,
            type: 1,
        },
        {
            regId: 42,
			code: "Den",
			supply: true,
            type: 1,
        },
        {
            regId: 43,
			code: "Swe",
			supply: true,
            type: 1,
        },
        {
            regId: 44,
			code: "Fin",
			supply: false,
            type: 1,
        },
        {
            regId: 45,
			code: "StP",
			supply: true,
            type: 1,
        },
        {
            regId: 46,
			code: "Lvn",
			supply: false,
            type: 1,
        },
        {
            regId: 47,
			code: "Mos",
			supply: true,
            type: 1,
        },
        {
            regId: 48,
			code: "Sev",
			supply: true,
            type: 1,
        },
        {
            regId: 49,
			code: "Rum",
			supply: true,
            type: 1,
        },
        {
            regId: 50,
			code: "Ukr",
			supply: false,
            type: 1,
        },
        {
            regId: 51,
			code: "War",
			supply: true,
            type: 1,
        },
        {
            regId: 52,
			code: "Pru",
			supply: false,
            type: 1,
        },
        {
            regId: 53,
			code: "Sil",
			supply: false,
            type: 1,
        },
        {
            regId: 54,
			code: "Gal",
			supply: false,
            type: 1,
        },
        {
            regId: 55,
			code: "Ber",
			supply: true,
            type: 1,
        },
        {
            regId: 56,
			code: "Kie",
			supply: true,
            type: 1,
        },
        {
            regId: 57,
			code: "Ruh",
			supply: false,
            type: 1,
        },
        {
            regId: 58,
			code: "Mun",
			supply: true,
            type: 1,
        },
        {
            regId: 59,
			code: "Boh",
			supply: false,
            type: 1,
        },
        {
            regId: 60,
			code: "Tyr",
			supply: false,
            type: 1,
        },
        {
            regId: 61,
			code: "Vie",
			supply: true,
            type: 1,
        },
        {
            regId: 62,
			code: "Bud",
			supply: true,
            type: 1,
        },
        {
            regId: 63,
			code: "Tri",
			supply: true,
            type: 7,
        },
        {
            regId: 64,
			code: "Alb",
			supply: false,
            type: 1,
        },
        {
            regId: 65,
			code: "Ser",
			supply: true,
            type: 1,
        },
        {
            regId: 66,
			code: "Gre",
			supply: true,
            type: 1,
        },
        {
            regId: 67,
			code: "Bul",
			supply: true,
            type: 1,
        },
        {
            regId: 68,
			code: "Con",
			supply: true,
            type: 1,
        },
        {
            regId: 69,
			code: "Ank",
			supply: true,
            type: 1,
        },
        {
            regId: 70,
			code: "Arm",
			supply: false,
            type: 1,
        },
        {
            regId: 71,
			code: "Smy",
			supply: true,
            type: 1,
        },
        {
            regId: 72,
			code: "Syr",
			supply: false,
            type: 1,
        },
        {
            regId: 73,
			code: "Bot",
			supply: false,
            type: 2,
        },
        {
            regId: 74,
			code: "NAt",
			supply: false,
            type: 2,
        },
    ],
};

function findRegionByLocation(location)
{
    for (var p in game.provinces)
    {
        var prov = game.provinces[p];
        if (prov.code == location)
            return game.map.regions[prov.regId];
    }
    return undefined;
}

function stringifyOrder(order)
{
    if (order.destination != undefined)
    {
        if (order.destination.unit == undefined)
        {
            return order.unit.location + "-" + order.action + "-" + order.destination;
        }
        else
        {
            return order.unit.location + "-" + order.action + "-(" + stringifyOrder(order.destination) + ")";
        }
    }
        
    return order.unit.location + "-" + order.action;
}

function interpretOrder(order)
{
   switch (order.action ){
       case "M":
           return "Move from " + order.unit.location + " to " + order.destination;
            break;
        case "H":
            return "Hold at " + order.unit.location;
    }
}



export type NodeUI = {
    positionLeft: number
    positionTop: number
    name: string
}

export const nodeUIList: Array<NodeUI> = [
    { name: "Warszawa", positionLeft: 59, positionTop: 43},
    { name: "Kraków", positionLeft: 59, positionTop: 85},
    { name: "Wrocław", positionLeft: 27.5, positionTop: 65.5},
    { name: "Poznań", positionLeft: 27.5, positionTop: 43},
    { name: "Gdańsk", positionLeft: 45, positionTop: 14},
    { name: "Szczecin", positionLeft: 10, positionTop: 24.7},
    { name: "Bydgoszcz", positionLeft: 40, positionTop: 24.7},
    { name: "Lublin", positionLeft: 84, positionTop: 55},
    { name: "Katowice", positionLeft: 48, positionTop: 81.5},
    { name: "Białystok", positionLeft: 80, positionTop: 24.7},
    { name: "Gdynia", positionLeft: 40, positionTop: 8},
    { name: "Częstochowa", positionLeft: 49, positionTop: 55},
    { name: "Radom", positionLeft: 70, positionTop: 55},
    { name: "Toruń", positionLeft: 45, positionTop: 34},
    { name: "Sosnowiec", positionLeft: 48, positionTop: 75},
    { name: "Kielce", positionLeft: 59, positionTop: 65.5},
    { name: "Gliwice", positionLeft: 34.75, positionTop: 74},
    { name: "Zabrze", positionLeft: 42, positionTop: 65.5},
    { name: "Olsztyn", positionLeft: 59, positionTop: 24.7},
    { name: "Rzeszów", positionLeft: 70, positionTop: 77},
]

export const topologyData = {
    "devices": [
        {
            "id": 0,
            "name": "Warszawa",
            "active": true
        },
        {
            "id": 1,
            "name": "Kraków",
            "active": true
        },
        {
            "id": 2,
            "name": "Wrocław",
            "active": true
        },
        {
            "id": 3,
            "name": "Poznań",
            "active": true
        },
        {
            "id": 4,
            "name": "Gdańsk",
            "active": true
        },
        {
            "id": 5,
            "name": "Szczecin",
            "active": true
        },
        {
            "id": 6,
            "name": "Bydgoszcz",
            "active": true
        },
        {
            "id": 7,
            "name": "Lublin",
            "active": true
        },
        {
            "id": 8,
            "name": "Katowice",
            "active": true
        },
        {
            "id": 9,
            "name": "Białystok",
            "active": true
        },
        {
            "id": 10,
            "name": "Gdynia",
            "active": true
        },
        {
            "id": 11,
            "name": "Częstochowa",
            "active": true
        },
        {
            "id": 12,
            "name": "Radom",
            "active": true
        },
        {
            "id": 13,
            "name": "Toruń",
            "active": true
        },
        {
            "id": 14,
            "name": "Sosnowiec",
            "active": true
        },
        {
            "id": 15,
            "name": "Kielce",
            "active": true
        },
        {
            "id": 16,
            "name": "Gliwice",
            "active": true
        },
        {
            "id": 17,
            "name": "Zabrze",
            "active": true
        },
        {
            "id": 18,
            "name": "Olsztyn",
            "active": true
        },
        {
            "id": 19,
            "name": "Rzeszów",
            "active": true
        }
    ],
    "connections": [
        {
            "from": 0,
            "to": 1
        },
        {
            "from": 0,
            "to": 2
        },
        {
            "from": 0,
            "to": 3
        },
        {
            "from": 0,
            "to": 5
        },
        {
            "from": 1,
            "to": 3
        },
        {
            "from": 1,
            "to": 5
        },
        {
            "from": 1,
            "to": 8
        },
        {
            "from": 1,
            "to": 9
        },
        {
            "from": 2,
            "to": 10
        },
        {
            "from": 2,
            "to": 12
        },
        {
            "from": 3,
            "to": 6
        },
        {
            "from": 4,
            "to": 14
        },
        {
            "from": 5,
            "to": 8
        },
        {
            "from": 5,
            "to": 9
        },
        {
            "from": 5,
            "to": 10
        },
        {
            "from": 5,
            "to": 11
        },
        {
            "from": 5,
            "to": 12
        },
        {
            "from": 6,
            "to": 7
        },
        {
            "from": 7,
            "to": 11
        },
        {
            "from": 7,
            "to": 13
        },
        {
            "from": 7,
            "to": 14
        },
        {
            "from": 14,
            "to": 15
        },
        {
            "from": 15,
            "to": 16
        },
        {
            "from": 15,
            "to": 17
        },
        {
            "from": 15,
            "to": 18
        },
        {
            "from": 15,
            "to": 19
        },
        {
            "from": 16,
            "to": 18
        },
        {
            "from": 18,
            "to": 19
        }
    ]
}
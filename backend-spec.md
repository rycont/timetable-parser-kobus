# 고속버스 시간표 서버

## [GET] /terminal

```
interface Terminal {
    id: string
    name: string
    area: string // 터미널이 속해있는 지역 그룹
}

type Response = Terminal[]
```

고속버스 터미널의 위치를 모두 반환합니다.

### Example

```
[
  {
    "id": "200",
    "name": "강릉",
    "area": "42"
  },
  {
    "id": "116",
    "name": "고양백석",
    "area": "41"
  }
]
```

## [GET] /connection

고속버스 터미널의 노선 정보를 반환합니다.

```
interface Connection {
    departureTerminalId: string
    arrivalTerminalId: string
    durationInMinutes: number
}

type Response = Connection[]
```

### Example

```
[{
    "departureTerminalId": "200",
    "arrivalTerminalId": "116",
    "durationInMinutes": 170
},
{
    "departureTerminalId": "200",
    "arrivalTerminalId": "300",
    "durationInMinutes": 200
}]
```

## [GET] /connection/{departure-terminal-id}/{arrival-terminal-id}

`departure-terminal-id`에서 `arrival-terminal-id`로 가는 노선 정보를 조회합니다.

```
interface Plan {
    departureTerminalId: string
    arrivalTerminalId: string
    durationInMinutes: number
    operator: string[] // 운수 회사 목록
    busClass: string[] // 운행 버스 등급 목록
    departureTime: {
        hour: number
        minute: number
    },
    isTemporaryRoute: false,
    seatsAmount: number[] // 한 운행 정원 수
    fare: {
        "어른": number[]
        "초등생": number[]
        "중고생": number[]
    },
    pattern: {
        type: "irregular",
        fixedDays: number[], // 고정으로 운행하는 요일
        irregularDays: number[] // 유동적으로 운행하는 요일
    } | {
        type: "everyday"
    } | {
        type: "even-odd"
    }
}

type Response = Plan[]
```

`operator`, `busClass`, `fare`, `seatsAmount`는 운수회사, 운행 차량 종류 및 등급에 따라 유동적으로 달라질 수 있어 리스트로 출력됩니다.

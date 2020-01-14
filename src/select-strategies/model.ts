export interface Distance {
    distance: number
}

export type Selector = <T extends Distance>(items: T[]) => T[];
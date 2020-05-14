interface Config {
    lagInterval: number;
    debugLog: boolean;
    fastButUnreliable: boolean;
}
export declare function connect(url: string, config?: Config): () => void;
export declare function send(action: string, ...attrs: any[]): void;
export {};

declare const canvasElement: HTMLCanvasElement;
declare const context: CanvasRenderingContext2D;
declare var canvasSize: size;
declare var cooldownUntilReload: number;
declare type xy = {
    x: number;
    y: number;
};
declare type size = {
    width: number;
    height: number;
};
declare type pType = {
    name: string;
    pos: xy;
    mov: xy;
    s: number;
};
declare var punkte: pType[];
declare var framesDrawnSinceInit: number;
declare var frameInterval: number;
declare var reInitializedCount: number;
declare function getWindowSize(): size;
declare function updateCanvasSize(): void;
declare function init(): void;
declare function reInit(): void;
declare function renderFrame(steps: number): void;
declare function punktDebug(point: pType): void;
declare var debugPointUpDownToggle: boolean;
declare function debugStringifyPoint(point: pType): void;
declare function writeGlobalDebugInfos(): void;
declare function beep(): void;
//# sourceMappingURL=gravity.d.ts.map
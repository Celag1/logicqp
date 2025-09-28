declare module 'quagga' {
  interface QuaggaStatic {
    init(config: any, callback?: () => void): void;
    start(): void;
    stop(): void;
    decodeSingle(config: any, callback: (result: any) => void): void;
    onDetected(callback: (result: any) => void): void;
    offDetected(callback: (result: any) => void): void;
  }

  const Quagga: QuaggaStatic;
  export = Quagga;
}






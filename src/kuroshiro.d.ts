declare module 'kuroshiro' {
  class Kuroshiro {
    init(analyzer?: any): Promise<void>;
    convert(text: string, options?: any): Promise<string>;
  }

  export = Kuroshiro;
}

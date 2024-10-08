declare module 'kuroshiro' {
    // Add type definitions here as you use them in your project
    class Kuroshiro {
        init(analyzer?: any): Promise<void>;
        convert(text: string, options?: any): Promise<string>;
    }

    export = Kuroshiro;
}
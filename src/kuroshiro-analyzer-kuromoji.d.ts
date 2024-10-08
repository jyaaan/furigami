declare module 'kuroshiro-analyzer-kuromoji' {
    class KuromojiAnalyzer {
        init(): Promise<void>;
        tokenize(text: string): any;
    }

    export = KuromojiAnalyzer;
}
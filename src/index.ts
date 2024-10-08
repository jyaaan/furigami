import Tesseract from 'tesseract.js';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';


// Initialize kuroshiro with instance of analyzer
const kuroshiro = new Kuroshiro();

(async () => {
    await kuroshiro.init(new KuromojiAnalyzer());
})();


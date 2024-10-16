import Tesseract from 'tesseract.js';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// Types and consts
interface BBox {
  y0: number;
  x0: number;
  x1: number;
  y1: number;
}

const TOOLTIP_X_OFFSET = 0;
const TOOLTIP_Y_OFFSET = 0;

// Some globals and their helpers
const imageUploader = document.getElementById(
  'imageUploader'
) as HTMLInputElement;
const imageCanvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
const reviewList = document.getElementById('reviewList') as HTMLUListElement;

const updateReviewList = () => {
  reviewList.innerHTML = '';
  reviewItems.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    reviewList.appendChild(li);
  });

  // Save to local storage
  localStorage.setItem('reviewList', JSON.stringify(Array.from(reviewItems)));
};

const ctx = imageCanvas.getContext('2d');
if (!ctx) {
  alert('Canvas context is null');
}
let reviewItems: Set<string> = new Set();
let kanjiData: { kanji: string; bbox: BBox }[] = [];

// UI
const showToolTip = (x: number, y: number, furigana: string, kanji: string) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.id = 'tooltip';
  tooltip.textContent = `${kanji}: ${furigana}`;

  document.body.appendChild(tooltip);

  // TODO: Explore offset.
  tooltip.style.left = `${x + TOOLTIP_X_OFFSET}px`;
  tooltip.style.top = `${y + TOOLTIP_Y_OFFSET}px`;

  // TODO: Add debug mode to view all current bounding boxes.

  // TODO: display meaning in english
};

const hideTooltip = () => {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.remove();
  }
};

const isInsideBBox = (x: number, y: number, bbox: BBox): boolean => {
  const { x0, y0, x1, y1 } = {
    x0: bbox.x0,
    y0: bbox.y0,
    x1: bbox.x1,
    y1: bbox.y1,
  };
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
};

const handleRightClick = (event: MouseEvent) => {
  event.preventDefault();
  const { offsetX: x, offsetY: y } = event;
  const kanjiItem = kanjiData.find((item) => isInsideBBox(x, y, item.bbox));

  if (kanjiItem) {
    reviewItems.add(kanjiItem.kanji);
    updateReviewList();
  }
};

const handleMouseMove = async (event: MouseEvent) => {
  hideTooltip(); // maybe a better way to do this?

  const { offsetX: x, offsetY: y } = event;
  const kanjiItem = kanjiData.find((item) => isInsideBBox(x, y, item.bbox));

  if (kanjiItem) {
    const furigana = await kuroshiro.convert(kanjiItem.kanji, {
      to: 'hiragana',
    });
    showToolTip(event.pageX, event.pageY, furigana, kanjiItem.kanji);
  }
};

const addCanvasEventListeners = () => {
  imageCanvas.addEventListener('mousemove', handleMouseMove);
  imageCanvas.addEventListener('contextmenu', handleRightClick);
};

// Initialize kuroshiro with instance of analyzer
const kuroshiro = new Kuroshiro();

(async () => {
  await kuroshiro.init(new KuromojiAnalyzer());
})();

// OCR
const isKanji = (char: string): boolean => {
  // TIL: CJK Unified Ideographs
  return char >= '\u4e00' && char <= '\u9faf';
};

const performOCR = async (image: HTMLImageElement) => {
  console.log('starting OCR...');
  const { data } = await Tesseract.recognize(image, 'jpn', {
    logger: (m) => console.log(m),
  });
  kanjiData = [];

  data.words.forEach((word) => {
    const text = word.text;
    const bbox = word.bbox;
    if (isKanji(text)) {
      kanjiData.push({
        kanji: text,
        bbox: bbox,
      });
    }
  });
  console.log(kanjiData);

  addCanvasEventListeners();
};

// Handle image upload
const handleImageUpload = (event: Event) => {
  console.log('image upload triggered');
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    alert('Please select an image to load.');
    return;
  }
  console.log('loaded image');
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      imageCanvas.width = img.width;
      imageCanvas.height = img.height;
      ctx?.drawImage(img, 0, 0); // TODO: center on screen

      performOCR(img);
    };

    img.onerror = () => {
      console.error('Failed to load the image. Please check the image format.');
    };

    img.src = e.target?.result as string;
  };

  reader.readAsDataURL(file);
};

imageUploader.addEventListener('change', handleImageUpload);

(function loadReviewList() {
  const storedList = localStorage.getItem('reviewList');
  if (storedList) {
    reviewItems = new Set(JSON.parse(storedList));
    updateReviewList();
  }
})();

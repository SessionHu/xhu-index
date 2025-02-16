import 'mdui/mdui.css';

import './css/style.scss';

import { fillGroupInfo } from './sites';
import { Dotline } from './dotLine';

import 'mdui/components/text-field.js';

import '@mdui/icons/search.js';

fillGroupInfo();

const dotLine = new Dotline({
  dom: document.querySelector("canvas#dotLine") as HTMLCanvasElement,
  dotSum: 70,
  radius: .5,
  disMax: 80,
  width: window.innerWidth,
  height: window.innerHeight,
  freq: 60,
  color: '#111'
});
window.addEventListener<"resize">("resize", () => {
  dotLine.canvas.width = window.innerWidth;
  dotLine.canvas.height = window.innerHeight;
});
dotLine.start();

const inputbox = document.querySelector('#search input[type="text"]');
if (inputbox instanceof HTMLElement) window.addEventListener('keypress', () => inputbox.focus());

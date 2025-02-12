import 'mdui/mdui.css';

import './css/style.scss';

import './dotLine';
import './sites';

const inputbox = document.querySelector('#search input[type="text"]');
window.addEventListener('keypress', () => inputbox instanceof HTMLElement ? inputbox.focus : void 0);

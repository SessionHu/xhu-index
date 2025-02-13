import './dotLine';
import './sites';

import 'mdui/mdui.css';

import './css/style.scss';

const inputbox = document.querySelector('#search input[type="text"]');
window.addEventListener('keypress', () => inputbox instanceof HTMLElement ? inputbox.focus : void 0);

/**
* @license
* Copyright 2023-2025 XhuStudio
* SPDX-License-Identifier: MIT
*/

import 'mdui/mdui.css';

import './css/style.scss';

import { fillGroupInfo } from './sites';
import { Dotline } from './dotLine';

import { $ } from 'mdui/jq.js';

import 'mdui/components/text-field.js';

import '@mdui/icons/search.js';

fillGroupInfo();

const canvas = document.querySelector("canvas#dotLine");
if (canvas instanceof HTMLCanvasElement) {
  const dotLine = new Dotline({
    dom: canvas,
    dotSum: 70,
    radius: .5,
    disMax: 80,
    width: window.innerWidth,
    height: window.innerHeight,
    freq: 24,
    color: '#111'
  });
  window.addEventListener<"resize">("resize", () => {
    dotLine.canvas.width = window.innerWidth;
    dotLine.canvas.height = window.innerHeight;
  });
  dotLine.start();
} else {
  console.warn('canvas#dotLine not found');
}

const searchform = $('form#search');
const textfield = searchform.find('mdui-text-field[name=q]')[0];
if (textfield) {
  const prt = searchform.parents()[0];
  window.addEventListener('scroll', () => {
    const { y, height } = prt.getBoundingClientRect();
    const topn = height - y;
    if (topn > 0) {
      searchform.css('top', topn);
      searchform.children().attr('variant', 'filled');
    } else {
      searchform.css('top', 0);
      searchform.children().attr('variant', 'outlined');
    }
  });
  window.addEventListener('keypress', () => textfield.focus());
}

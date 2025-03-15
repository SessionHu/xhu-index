/**
* @license
* Copyright 2023-2025 XhuStudio
* SPDX-License-Identifier: MIT
*/

import 'mdui/mdui.css';

import './css/style.scss';

import { openSettings } from './settings';
import { fillGroupInfo } from './sites';
import { Dotline } from './dotLine';

import { ButtonIcon } from 'mdui/components/button-icon';
import { TextField } from 'mdui/components/text-field.js';

import '@mdui/icons/search.js';
import { IconSettings } from '@mdui/icons/settings.js';

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
    freq: 60,
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

const searchform = document.querySelector('form#search');
const textfield = searchform?.querySelector('mdui-text-field[name=q]');
if (searchform && textfield instanceof TextField) {
  window.addEventListener('scroll', () => {
    const vt = searchform.getBoundingClientRect().y <= 4 ? 'filled' : 'outlined';
    for (let i = 0; i < searchform.children.length; i++) {
      searchform.children[i].setAttribute('variant', vt);
    }
  });
  window.addEventListener('keypress', () => textfield.focus());
}

const commondivh2 = document.querySelector('div#common>h2');
if (commondivh2) {
  const settingsBtn = new ButtonIcon();
  settingsBtn.appendChild(new IconSettings());
  settingsBtn.addEventListener('click', openSettings);
  settingsBtn.style.height = String(commondivh2.computedStyleMap().get('line-height'));
  settingsBtn.style.width = settingsBtn.style.height;
  settingsBtn.style.float = 'right';
  commondivh2.appendChild(settingsBtn);
}

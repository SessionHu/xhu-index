/**
* @license
* Copyright 2023-2025 XhuStudio
* SPDX-License-Identifier: MIT
*/

import 'mdui/mdui.css';

import './css/style.scss';

import { openSettings, getSettingsItem } from './settings';
import { fillGroupInfo } from './sites';
import { Dotline } from './dotLine';

import { ButtonIcon } from 'mdui/components/button-icon';
import { TextField } from 'mdui/components/text-field.js';

import '@mdui/icons/search.js';
import { IconSettings } from '@mdui/icons/settings.js';

fillGroupInfo();

const mqldark = window.matchMedia('(prefers-color-scheme: dark)');
mqldark.addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.classList.remove('mdui-theme-light');
    document.documentElement.classList.add('mdui-theme-dark');
  } else {
    document.documentElement.classList.add('mdui-theme-light');
    document.documentElement.classList.remove('mdui-theme-dark');
  }
});

const canvas = document.querySelector("canvas#dotLine");
export let dotLine: Dotline;
if (canvas instanceof HTMLCanvasElement) {
  dotLine = new Dotline({
    dom: canvas,
    dotSum: 70,
    radius: .5,
    disMax: 80,
    width: window.innerWidth,
    height: window.innerHeight,
    color: mqldark.matches ? '#fff' : '#111'
  });
  window.addEventListener<"resize">("resize", () => {
    dotLine.canvas.width = window.innerWidth;
    dotLine.canvas.height = window.innerHeight;
  });
  mqldark.addEventListener('change', (e) => dotLine.color = e.matches ? '#fff' : '#111');
  if (getSettingsItem('dotline') !== false) dotLine.start();
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
  commondivh2.appendChild(settingsBtn);
}

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

import { IconSettings } from '@mdui/icons/settings.js';

(() => {
  if (!/eruda=true/.test(location.search) && localStorage.getItem('active-eruda') != 'true') return;
  document.write('<script src="https://unpkg.com/eruda"></script><script>eruda.init();</script>');
})();

fillGroupInfo();

const onmqlchange = (e: MediaQueryListEvent | MediaQueryList) => {
  const cl = document.documentElement.classList;
  if (e.matches) {
    cl.remove('mdui-theme-light');
    cl.add('mdui-theme-dark');
  } else {
    cl.add('mdui-theme-light');
    cl.remove('mdui-theme-dark');
  }
};
const mqldark = window.matchMedia('(prefers-color-scheme: dark)');
onmqlchange(mqldark);
mqldark.addEventListener('change', onmqlchange);

const canvas = document.querySelector("canvas#dotLine");
export let dotLine: Dotline;
if (canvas instanceof HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  dotLine = new Dotline({
    dom: canvas,
    dotSum: 70,
    radius: .5,
    disMax: 80,
    width: window.innerWidth * dpr,
    height: window.innerHeight * dpr,
    color: mqldark.matches ? '#fff' : '#111'
  });
  window.addEventListener<"resize">("resize", () => {
    const dpr = dotLine.dpr;
    dotLine.canvas.width = window.innerWidth * dpr;
    dotLine.canvas.height = window.innerHeight * dpr;
    if (getSettingsItem('dotline') === false) dotLine.drawLine();
  });
  mqldark.addEventListener('change', (e) => dotLine.color = e.matches ? '#fff' : '#111');
  if (getSettingsItem('dotline') !== false) dotLine.start();
} else {
  console.warn('canvas#dotLine not found');
}

export const searchform = document.querySelector('form#search');
export const textfield = searchform?.querySelector('mdui-text-field[name=q]');
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

document.body.classList.add('visible');

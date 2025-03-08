import { Card } from 'mdui/components/card.js';

import 'mdui/components/button-icon.js';
import type { ButtonIcon } from 'mdui/components/button-icon.js';

import { snackbar } from "mdui/functions/snackbar.js";

import '@mdui/icons/close.js';

import sitegroups from './json/sites.json';

interface SiteGroup {
  id: string;
  name: string;
  links: Sitebox[];
}

interface Sitebox {
  id: string;
  title: string;
  titlecn: string;
  url: string;
  icon: string;
  desc: string;
}

const siteMap = new Map<string, Sitebox>();
for (const group of sitegroups) {
  for (const sitebox of group.links) {
    if (siteMap.has(sitebox.id)) {
      console.warn('Duplicate ID:', sitebox.id, 'in group', group.id);
      continue;
    }
    siteMap.set(sitebox.id, sitebox);
  }
}

export function fillGroupInfo(): void {
  const mainelem = document.querySelector("main");
  if (!mainelem)
    return console.error("selector 'main' not found");
  // common
  mainelem.appendChild(CommonGroup.instance.container);
  // normal
  for (const g of sitegroups)
    mainelem.appendChild(createGroupDiv(g));
}

function createGroupDiv(group: SiteGroup): HTMLDivElement {
  // div.gp
  const groupDiv = document.createElement("div");
  groupDiv.className = "gp";
  groupDiv.id = group.id;
  groupDiv.innerHTML = `<h2 class="gptitle">${group.name}</h2>`;
  // div.gpframe
  const gpframe = document.createElement("div");
  gpframe.className = "gpframe";
  gpframe.addEventListener("contextmenu", handleGroupContextMenu);
  groupDiv.appendChild(gpframe);
  for (const v of group.links)
    gpframe.appendChild(createSiteboxlink(v));
  return groupDiv;
}

function handleGroupContextMenu(event: MouseEvent): void {
  if (!(event.target instanceof HTMLElement)) return;
  const targetCard = event.target.closest(".siteboxlink");
  if (!(targetCard instanceof Card)) return;
  event.preventDefault();
  if (targetCard.closest(".gp")?.id === "common") {
    handleCommonContextMenu(event, targetCard);
  } else {
    CommonGroup.instance.add(targetCard.id);
  }
}

class CommonGroup {
  #items: Set<string>;
  #container: HTMLDivElement;
  get container() {
    return this.#container;
  }
  #elem: HTMLDivElement;
  constructor() {
    const lsr = JSON.parse(localStorage.getItem('common') || '[]');
    if (Array.isArray(lsr) && lsr.length && lsr.every(e => typeof e === 'string')) {
      this.#items = new Set(lsr);
    } else {
      this.#items = new Set([
       "github", "bing", "outlook", "bilibili", "cloudflare", "openfrp",
       "littleskin", "timeis", "gtranslate"
     ]);
    }
    this.#container = document.querySelector('div#common') || document.createElement('div');
    this.#container.className = 'gp';
    this.#container.id = 'common';
    this.#container.innerHTML = '<h2 class="gptitle">常用</h2>';
    this.#elem = document.createElement("div");
    this.#elem.className = "gpframe";
    for (const id of this.#items) {
      const sitebox = siteMap.get(id);
      if (sitebox) {
        this.#elem.appendChild(createSiteboxlink(sitebox, true));
      } else {
        console.warn('Invalid common item:', id);
        this.#items.delete(id);
      }
    }
    this.#elem.addEventListener("contextmenu", handleGroupContextMenu);
    this.#container.appendChild(this.#elem);
  }
  remove(card: Card) {
    this.#items.delete(card.id);
    localStorage.setItem('common', JSON.stringify(Array.from(this.#items)));
    card.remove();
    snackbar({
      message: '已移除该常用网站',
      closeable: true,
      autoCloseDelay: 2e3,
      closeOnOutsideClick: true
    });
    if (!this.#elem.childElementCount)
      this.#elem.innerHTML = '<mdui-card disabled class="siteboxlink"><div class="sitetitle">None</div></mdui-card>';
  }
  add(id: string) {
    const sitebox = siteMap.get(id);
    if (!sitebox) {
      return console.warn('Invalid common item:', id);
    }
    if (this.#items.has(id)) return;
    this.#items.add(id);
    localStorage.setItem('common', JSON.stringify(Array.from(this.#items)));
    if (this.#elem.textContent === 'None') this.#elem.innerHTML = '';
    this.#elem.appendChild(createSiteboxlink(sitebox, true));
    snackbar({
      message: '已添加至常用网站',
      closeable: true,
      autoCloseDelay: 2e3,
      closeOnOutsideClick: true
    });
  }
  static instance = new CommonGroup();
}

function createSiteboxlink(sitebox: Sitebox, nodesc = false): Card {
  // .siteboxlink
  const link: Card = document.createElement("mdui-card");
  link.className = "siteboxlink";
  link.id = sitebox.id;
  link.title = sitebox.title;
  link.href = sitebox.url;
  link.clickable = true;
  link.insertAdjacentHTML('beforeend',
    '<div class="sitetitle">' +
      '<img src="' + sitebox.icon + '" />' +
      '<span>' + sitebox.titlecn + '</span>' +
    '</div>'
  );
  if (!nodesc) {
    link.insertAdjacentHTML('beforeend', `<div class="sitedescription">${sitebox.desc}</div>`);
  }
  return link;
}

function handleCommonContextMenu(event: MouseEvent, link: Card): void {
  if (window.innerWidth <= 220) {
    return CommonGroup.instance.remove(link);
  }
  if (link.querySelector("mdui-icon-close")) return;
  event.preventDefault();
  const btn: ButtonIcon = document.createElement('mdui-button-icon');
  btn.appendChild(document.createElement('mdui-icon-close'));
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    CommonGroup.instance.remove(link);
  }, { once: true });
  link.querySelector('.sitetitle')?.appendChild(btn);
  // auto remove
  setTimeout(() => btn.remove(), 3e3);
}

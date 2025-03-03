import 'mdui/components/card.js';
import type { Card } from 'mdui/components/card.js';

import 'mdui/components/button-icon.js';
import type { ButtonIcon } from 'mdui/components/button-icon.js';

import 'mdui/components/tooltip.js';
import type { Tooltip } from 'mdui/components/tooltip.js';

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
  const contentDiv = document.querySelector("div.maingp");
  if (!contentDiv) {
    return console.error('div.maingp not found');
  }
  // normal
  sitegroups.forEach(group => contentDiv.appendChild(createGroupDiv(group)));
  // common
  contentDiv.insertAdjacentElement("beforebegin", createCommonGroupDiv());
}

function createGroupDiv(group: SiteGroup): HTMLDivElement {
  // div.gp
  const groupDiv: HTMLDivElement = document.createElement("div");
  groupDiv.className = "gp";
  groupDiv.id = group.id;
  groupDiv.innerHTML = `<h2 class="gptitle">${group.name}</h2>`;
  // div.gpframe
  const gpframe: HTMLDivElement = document.createElement("div");
  gpframe.className = "gpframe";
  group.links.forEach((v) => gpframe.appendChild(createSiteboxlink(v)));
  gpframe.addEventListener("contextmenu", handleGroupContextMenu);
  groupDiv.appendChild(gpframe);
  return groupDiv;
}

function handleGroupContextMenu(event: MouseEvent): void {
  if (!(event.target instanceof HTMLElement)) return;
  const targetCard = event.target.closest(".siteboxlink");
  if (!(targetCard instanceof HTMLElement)) return;
  const groupId = targetCard.closest(".gp")?.id;
  const siteId = targetCard.id;
  event.preventDefault();
  if (groupId === "common") {
    handleCommonContextMenu(event, targetCard);
  } else {
    addToStorage(siteId);
    createCommonGroupDiv();
    const tt = targetCard.querySelector('mdui-tooltip');
    if (!tt) return;
    tt.content = "已添加至常用网站";
    tt.open = true;
  }
}

function createCommonGroupDiv(): HTMLDivElement {
  let common: string[] | Set<string> = JSON.parse(localStorage.getItem("common") || '[]');
  if(!Array.isArray(common) || !common.length || !common.every(item => typeof item === "string")) {
    common = [
      "github", "bing", "outlook", "bilibili", "cloudflare", "openfrp",
      "littleskin", "timeis", "gtranslate"
    ];
  }
  common = new Set(common);
  localStorage.setItem("common", JSON.stringify(Array.from(common)));
  // div.gp
  const groupDiv: HTMLDivElement = document.querySelector('div#common') || document.createElement("div");
  groupDiv.className = "gp";
  groupDiv.id = "common";
  groupDiv.innerHTML = `<h2 class="gptitle">常用</h2>`;
  // div.gpframe
  const gpframe: HTMLDivElement = document.createElement("div");
  gpframe.className = "gpframe";
  for (const id of common) {
    const sitebox = siteMap.get(id);
    if (sitebox) {
      gpframe.appendChild(createSiteboxlink(sitebox, true));
    } else {
      console.warn('Invalid common item:', id);
      removeFromStorage(id);
    }
  };
  gpframe.addEventListener("contextmenu", handleGroupContextMenu);
  groupDiv.append(gpframe);
  return groupDiv;
}

function createSiteboxlink(sitebox: Sitebox, iscommon = false): Card {
  // .siteboxlink
  const link: Card = document.createElement("mdui-card");
  link.className = "siteboxlink";
  link.id = sitebox.id;
  link.title = sitebox.title;
  link.href = sitebox.url;
  link.clickable = true;
  const tt: Tooltip = document.createElement('mdui-tooltip');
  tt.trigger = 'manual';
  link.appendChild(tt);
  tt.insertAdjacentHTML('beforeend',
    '<div class="sitetitle">' +
      '<img src="' + sitebox.icon + '" />' +
      '<span>' + sitebox.titlecn + '</span>' +
    '</div>'
  );
  if (!iscommon) {
    tt.insertAdjacentHTML('beforeend', `<div class="sitedescription">${sitebox.desc}</div>`);
  }
  return link;
}

function removeFromStorage(linkid: string): void {
  const common: string[] = JSON.parse(localStorage.getItem("common") || '[]');
  common.splice(common.indexOf(linkid), 1);
  localStorage.setItem('common', JSON.stringify(common));
}

function addToStorage(linkid: string): void {
  const common: string[] = JSON.parse(localStorage.getItem("common") || '[]');
  if (!(common.includes(linkid))) common.push(linkid);
  localStorage.setItem('common', JSON.stringify(common));
}

function handleCommonContextMenu(event: MouseEvent, link: HTMLElement): void {
  if (window.innerWidth <= 220) {
    return link.remove();
  }
  if (!link.querySelector("mdui-icon-close")) {
    event.preventDefault();
  } else {
    return;
  }
  const btn: ButtonIcon = document.createElement('mdui-button-icon');
  btn.appendChild(document.createElement('mdui-icon-close'));
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (link.parentElement && link.parentElement?.childElementCount <= 1) {
      link.parentElement.innerHTML = '<mdui-card disabled class="siteboxlink"><div class="sitetitle">None</div></mdui-card>';
    } else {
      link.remove();
    }
    removeFromStorage(link.id);
  }, { once: true });
  link.querySelector('.sitetitle')?.appendChild(btn);
  // auto remove
  setTimeout(() => btn.remove(), 3e3);
}

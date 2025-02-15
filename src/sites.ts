import 'mdui/components/card.js';
import type { Card } from 'mdui/components/card.js';

import 'mdui/components/button-icon.js';
import type { ButtonIcon } from 'mdui/components/button-icon.js';

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

function fillGroupInfo(): void {
    const contentDiv: HTMLDivElement = document.querySelector("div.maingp") as HTMLDivElement;
    // normal
    sitegroups.forEach(group => contentDiv.appendChild(createGroupDiv(group)));
    // common
    contentDiv.insertAdjacentElement("beforebegin", createCommonGroupDiv());
}

function createGroupDiv(group: SiteGroup): HTMLDivElement {
    // div.gp
    const groupDiv: HTMLDivElement = document.createElement<"div">("div");
    groupDiv.className = "gp";
    groupDiv.id = group.id;
    groupDiv.innerHTML = `<h2 class="gptitle">${group.name}</h2>`;
    // div.gpframe
    const gpframe: HTMLDivElement = document.createElement<"div">("div");
    gpframe.className = "gpframe";
    group.links.forEach(sitebox => gpframe.appendChild(createSiteboxlink(sitebox)));
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
  }
}

function createCommonGroupDiv(): HTMLDivElement {
  let common: string[] | Set<string> = JSON.parse(window.localStorage.getItem("common") || '[]');
  if(!Array.isArray(common) || !common.length || !common.every(item => typeof item === "string")) {
    common = [
      "github", "bing", "outlook", "bilibili", "cloudflare", "openfrp",
      "littleskin", "timeis", "gtranslate"
    ];
  }
  common = new Set(common);
  window.localStorage.setItem("common", JSON.stringify(Array.from(common)));
  // div.gp
  const groupDiv: HTMLDivElement = document.querySelector('#common') || document.createElement("div");
  groupDiv.className = "gp";
  groupDiv.id = "common";
  groupDiv.innerHTML = `<h2 class="gptitle">常用</h2>`;
  // div.gpframe
  const gpframe: HTMLDivElement = groupDiv.querySelector('.gpframe') || document.createElement("div");
  gpframe.className = "gpframe";
  gpframe.innerHTML = '';
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
    link.insertAdjacentHTML('beforeend',
      '<div class="sitetitle">' +
        '<img src="' + sitebox.icon + '" />' +
        '<span>' + sitebox.titlecn + '</span>' +
      '</div>'
    );
    if (!iscommon) {
      link.insertAdjacentHTML('beforeend', `<div class="sitedescription">${sitebox.desc}</div>`);
    }
    return link;
}

function removeFromStorage(linkid: string) {
  const common: string[] = JSON.parse(localStorage.getItem("common") || '[]');
  common.splice(common.indexOf(linkid), 1);
  localStorage.setItem('common', JSON.stringify(common));
}

function addToStorage(linkid: string) {
  const common: string[] = JSON.parse(localStorage.getItem("common") || '[]');
  if (!(linkid in common)) common.push(linkid);
  localStorage.setItem('common', JSON.stringify(common));
}

function handleCommonContextMenu(event: MouseEvent, link: HTMLElement): void {
    if (window.innerWidth <= 220) {
        link.remove();
        return;
    }
    if (!link.querySelector("mdui-icon-close")) {
        event.preventDefault();
    } else {
        return;
    }
    const crossButton: ButtonIcon = createCrossButton(link, () => {
      removeFromStorage(link.id);
    });
    link.querySelector(".sitetitle")?.appendChild(crossButton);
    // auto remove
    window.setTimeout(() => crossButton.remove(), 3e3);
}

function createCrossButton(beremoved: HTMLElement, onclick?: (ev?: MouseEvent) => void): ButtonIcon {
    const button: ButtonIcon = document.createElement("mdui-button-icon");
    button.appendChild(document.createElement('mdui-icon-close'));
    button.addEventListener("click", (ev: MouseEvent) => {
        ev.preventDefault();
        beremoved.remove();
        if (onclick) onclick(ev);
    });
    return button;
}

fillGroupInfo();

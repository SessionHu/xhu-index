import { List } from 'mdui/components/list.js';
import { ListItem } from 'mdui/components/list-item.js';
import { ListSubheader } from 'mdui/components/list-subheader.js';
import { TextField } from 'mdui/components/text-field.js';

import { ButtonIcon } from 'mdui/components/button-icon.js';
import { Dropdown } from 'mdui/components/dropdown.js';
import { Menu } from 'mdui/components/menu.js';
import { MenuItem } from 'mdui/components/menu-item.js';
import { Switch } from 'mdui/components/switch.js';

import { IconArrowDropDown } from '@mdui/icons/arrow-drop-down.js';
import { IconColorLens } from '@mdui/icons/color-lens.js';
import { IconDeblur } from '@mdui/icons/deblur.js';
import { IconRestore } from  '@mdui/icons/restore.js';
import { IconSearch } from '@mdui/icons/search.js';
import { IconTimeline } from '@mdui/icons/timeline.js';

import { alert } from 'mdui/functions/alert.js';
import { dialog } from 'mdui/functions/dialog.js';
import { prompt } from 'mdui/functions/prompt.js';
import { setColorScheme } from 'mdui/functions/setColorScheme.js';
import { snackbar } from 'mdui/functions/snackbar';

const [
  getSettingsItem,
  setSettingsItem
] = (() => {
  const json = JSON.parse(localStorage.getItem('xhuindex') || '{}');
  return [
    (key: string) => json[key],
    (key: string, value: any) => {
      json[key] = value;
      localStorage.setItem('xhuindex', JSON.stringify(json));
    }
  ];
})();

interface SearchEngineItem {
  name: string,
  base: string,
  keyname: string
}

const SEARCH_ENGINE_LIST: SearchEngineItem[] = [
  {
    name: 'Bing',
    base: 'https://www.bing.com/search',
    keyname: 'q'
  },
  {
    name: 'Bing CN',
    base: 'https://cn.bing.com/search',
    keyname: 'q'
  },
  {
    name: 'Bing Global',
    base: 'https://global.bing.com/search?setmkt=en-us',
    keyname: 'q'
  },
];

const setSearchEngine = async (s: SearchEngineItem) => {
  const { searchform, textfield } = await import('./index');
  if (!(searchform instanceof HTMLFormElement) ||
    !(textfield instanceof TextField)
    ) return;
  searchform.action = s.base;
  textfield.label = s.name;
  textfield.name = s.keyname;
  setSettingsItem('search', s);
}
setSearchEngine(getSettingsItem('search') || SEARCH_ENGINE_LIST[0]);

const contentList = new List();

// Appearance

const apperanceSubheader = new ListSubheader();
apperanceSubheader.textContent = '外观';
contentList.appendChild(apperanceSubheader);

const colorscheme = new ListItem();
colorscheme.textContent = '配色方案';
const colorschemeElem = document.createElement('meta');
colorschemeElem.name = 'theme-color';
document.head.appendChild(colorschemeElem);
try {
  const value = getSettingsItem('colorscheme') || '#ffc0cb';
  colorschemeElem.content = value;
  setColorScheme(value);
} catch (e) {
  console.warn(e);
}
colorscheme.addEventListener('click', () => {
  prompt({
    headline: "设置配色方案",
    description: "请输入十六进制颜色值",
    confirmText: "确认",
    cancelText: "取消",
    closeOnEsc: true,
    closeOnOverlayClick: true
  }).then((value) => {
    if (!value.startsWith('#')) value = '#' + value;
    setColorScheme(value);
    colorschemeElem.content = value;
    setSettingsItem('colorscheme', value);
  }).catch((e) => {
    if (!e) return;
    alert({
      headline: e instanceof Error ? e.name : void 0,
      description: e instanceof Error ? e.stack : String(e),
      closeOnEsc: true,
      closeOnOverlayClick: true
    }).catch(() => {
      // do nothing
    });
  });
});
const colorschemeIcon = new IconColorLens();
colorschemeIcon.slot = 'icon';
colorscheme.appendChild(colorschemeIcon);
contentList.appendChild(colorscheme);

const dotlinebg = new ListItem();
dotlinebg.textContent = 'Dotline';
const dotlinebgIcon = new IconTimeline();
dotlinebgIcon.slot = 'icon';
dotlinebg.appendChild(dotlinebgIcon);
const dotlinebgSwitch = new Switch();
dotlinebgSwitch.slot = 'end-icon';
dotlinebgSwitch.checked = !(getSettingsItem('dotline') === false);
dotlinebgSwitch.addEventListener('change', async () => {
  const st = dotlinebgSwitch.checked;
  setSettingsItem('dotline', st);
  const dl = (await import('./index')).dotLine;
  st ? dl.start() : dl.stop();
});
dotlinebg.appendChild(dotlinebgSwitch);
contentList.appendChild(dotlinebg);

const bgblur = new ListItem();
bgblur.textContent = '背景模糊';
const bgblurIcon = new IconDeblur();
bgblurIcon.slot = 'icon';
bgblur.appendChild(bgblurIcon);
const bgblurSwitch = new Switch();
bgblurSwitch.slot = 'end-icon';
if (!(bgblurSwitch.checked = !(getSettingsItem('bgblur') === false))) {
  document.body.classList.add('no-bg-blur');
}
bgblurSwitch.addEventListener('change', async () => {
  const st = bgblurSwitch.checked;
  setSettingsItem('bgblur', st);
  st ?
    document.body.classList.remove('no-bg-blur')
  :
    document.body.classList.add('no-bg-blur');
});
bgblur.appendChild(bgblurSwitch);
contentList.appendChild(bgblur);

// Common Sites

const commonsitesSubheader = new ListSubheader();
commonsitesSubheader.textContent = '常用网站';
contentList.appendChild(commonsitesSubheader);

const restorecommonsites = new ListItem();
restorecommonsites.textContent = '恢复默认';
restorecommonsites.addEventListener('click', () => {
  dialog({
    headline: '恢复默认',
    body: '确认要恢复默认常用网站吗?',
    actions: [
      {
        text: '取消'
      },
      {
        text: '确认',
        onClick: async () =>{
          (await import('./sites')).common.clearAll();
          snackbar({
            message: '已恢复默认常用网站',
            closeable: true,
            autoCloseDelay: 2e3,
            closeOnOutsideClick: true
          });
        }
      }
    ],
    closeOnEsc: true,
    closeOnOverlayClick: true
  });
});
const restoreIcon = new IconRestore();
restoreIcon.slot = 'icon';
restorecommonsites.appendChild(restoreIcon);
contentList.appendChild(restorecommonsites);

// Search

const searchSubheader = new ListSubheader;
searchSubheader.textContent = '搜索';
contentList.appendChild(commonsitesSubheader);
const chooseSearchEngine = new ListItem;
chooseSearchEngine.textContent = '搜索引擎';
const searchIcon = new IconSearch;
searchIcon.slot = 'icon';
chooseSearchEngine.appendChild(searchIcon);
const chooseSearchEngineDropdown = new Dropdown;
chooseSearchEngineDropdown.slot = 'end-icon';
{
  const btn = new ButtonIcon;
  btn.slot = 'trigger';
  const icon = new IconArrowDropDown;
  btn.appendChild(icon);
  chooseSearchEngineDropdown.appendChild(btn);
  const menu = new Menu;
  chooseSearchEngineDropdown.appendChild(menu);
  for (const i of SEARCH_ENGINE_LIST) {
    const elem = new MenuItem;
    elem.textContent = i.name;
    elem.dataset.base = i.base;
    elem.dataset.keyname = i.keyname;
    menu.appendChild(elem);
  }
  menu.addEventListener('click', (ev) => {
    if (ev.target instanceof MenuItem && ev.target.textContent && ev.target.dataset.base && ev.target.dataset.keyname) setSearchEngine({
      name: ev.target.textContent,
      base: ev.target.dataset.base,
      keyname: ev.target.dataset.keyname
    });
  });
}
chooseSearchEngine.appendChild(chooseSearchEngineDropdown);
contentList.appendChild(chooseSearchEngine);

// export

export function openSettings() {
  return dialog({
    headline: "设置",
    body: contentList,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    actions: [
      {
        text: "OK"
      }
    ]
  });
}

export {
  getSettingsItem,
  setSettingsItem
}

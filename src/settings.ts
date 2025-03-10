import { List } from 'mdui/components/list.js';
import { ListItem } from 'mdui/components/list-item.js';
import { ListSubheader } from 'mdui/components/list-subheader.js';

import { IconColorLens } from '@mdui/icons/color-lens.js';
import { IconRestore } from  '@mdui/icons/restore.js';

import { alert } from 'mdui/functions/alert.js';
import { dialog } from 'mdui/functions/dialog.js';
import { prompt } from 'mdui/functions/prompt.js';
import { setColorScheme } from 'mdui/functions/setColorScheme.js';
import { snackbar } from 'mdui/functions/snackbar';

import { common } from './sites';

const contentList = new List();

// Appearance

const apperanceSubheader = new ListSubheader();
apperanceSubheader.textContent = '外观';
contentList.appendChild(apperanceSubheader);

const colorscheme = new ListItem();
colorscheme.textContent = '配色方案';
try {
  const value = localStorage.getItem('colorscheme');
  setColorScheme(value || '#66ccff');
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
    setColorScheme(value);
    localStorage.setItem('colorscheme', value);
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

// Common Sites

const commonsitesSubheader = new ListSubheader();
commonsitesSubheader .textContent = '常用网站';
contentList.appendChild(commonsitesSubheader );

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
        onClick: () => {
          common.clearAll();
          snackbar({
            message: '已恢复默认常用网站',
            closeable: true,
            autoCloseDelay: 2e3,
            closeOnOutsideClick: true
          });
        }
      }
    ]
  });
});
const restoreIcon = new IconRestore();
restoreIcon.slot = 'icon';
restorecommonsites.appendChild(restoreIcon);
contentList.appendChild(restorecommonsites);

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

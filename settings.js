'use strict';
let vkliveButtons = document.querySelectorAll('.button[data-vklive]');

let
vklivePoints = document.querySelector('[data-vklive="points"]'),
vkliveHearts = document.querySelector('[data-vklive="hearts"]'),
vkliveUnfixed = document.querySelector('[data-vklive="unfixed"]');

chrome.storage.local.get([
  'vklivePointsKey',
  'vkliveHeartsKey',
  'vkliveUnfixedKey'
]).then((r) => {
  vklivePoints.setAttribute('data-state', r.vklivePointsKey);
  vkliveHearts.setAttribute('data-state', r.vkliveHeartsKey);
  vkliveUnfixed.setAttribute('data-state', r.vkliveUnfixedKey);
});

vkliveButtons.forEach(function(button){
  button.addEventListener('click',()=>{

    let toggleSetting = (key,element) => {
      chrome.storage.local.get([key]).then((r) => {
        let newState = r[key] === 'on' ? 'off' : 'on';
        chrome.storage.local.set({[key]:newState});
        element.setAttribute('data-state',newState);
      });
    };

    switch (button.dataset.vklive){
      case 'points':
        toggleSetting('vklivePointsKey', vklivePoints);
        break;
      case 'hearts':
        toggleSetting('vkliveHeartsKey', vkliveHearts);
        break;
      case 'unfixed':
        toggleSetting('vkliveUnfixedKey', vkliveUnfixed);
        break;
    };

  });
});

document.getElementById('reload').addEventListener('click',()=>chrome.tabs.reload());

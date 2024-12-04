'use strict';
let
vkliveButtons = document.querySelectorAll('.button[data-vklive]'),
vklivePoints = document.querySelector('[data-vklive="points"]'),
vkliveHearts = document.querySelector('[data-vklive="hearts"]');

chrome.storage.local.get([
  'vklivePointsKey',
  'vkliveHeartsKey'
]).then((r) => {
  vklivePoints.setAttribute('data-state', r.vklivePointsKey);
  vkliveHearts.setAttribute('data-state', r.vkliveHeartsKey);
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
      case 'points':toggleSetting('vklivePointsKey',vklivePoints);break;
      case 'hearts':toggleSetting('vkliveHeartsKey',vkliveHearts);break;
    };

  });
});

document.getElementById('reload').addEventListener('click',()=>chrome.tabs.reload());

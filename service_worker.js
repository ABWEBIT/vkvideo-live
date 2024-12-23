const vkliveKeys = [
  {key:'vklivePointsKey',value:'on'},
  {key:'vkliveHeartsKey',value:'on'}
];
Promise.all(vkliveKeys.map(({key,value}) => chrome.storage.local.set({[key]:value})));

const vkliveStream = new RegExp(/^(https:\/\/)live\.vkvideo\.ru\/([-a-zA-Z0-9%_&.]*?)$/);
function vkliveFunc(dUrl,dTab){
  if(vkliveStream.test(dUrl) === true){
    chrome.scripting.executeScript({
      target: {tabId: dTab},
      func: vkliveStreamHelper
    });
  };
};

const filter = {url: [{hostContains: 'live.vkvideo.ru'}]};
const transition = ['typed','link','reload','generated','start_page','other'];

chrome.webNavigation.onHistoryStateUpdated.addListener(details=>{
  vkliveFunc(details.url,details.tabId);
},filter);

chrome.webNavigation.onCommitted.addListener(details=>{
  if(transition.includes(details.transitionType)){
    vkliveFunc(details.url,details.tabId);
  };
},filter);

function vkliveStreamHelper(){
  // баллы
  let pointsInterval = setInterval(()=>{
    let pointsButton = document.querySelector('[class*="PointActions_root"]');
    if(pointsButton){
      if(pointsInterval) clearInterval(pointsInterval);

      chrome.storage.local.get(['vklivePointsKey']).then((r)=>{
        if(r.vklivePointsKey === 'on'){
          let pointsCollecting=()=>{
            let bonus = pointsButton.querySelector('[class*="PointActions_buttonBonus"]');
            if(bonus) bonus.click();
          };
          pointsCollecting();

          let observerPoints = new MutationObserver((m) => {
            m.forEach((mutation) => {
              if(mutation.type === 'childList') pointsCollecting();
            });
          });
          observerPoints.observe(pointsButton,{subtree:true,childList:true});

        };
      });

    };
  },500);

  // сердечко
  let heartsInterval = setInterval(()=>{
    let heartsButton = document.querySelector('[class*="LikeButton_container"]');
    if(heartsButton){
      if(heartsInterval) clearInterval(heartsInterval)
      chrome.storage.local.get(['vkliveHeartsKey']).then((r)=>{
        if(r.vkliveHeartsKey === 'on'){
          let heartStatus = heartsButton.querySelector('[class*="LikeButton_iconLiked"]');
          if(heartStatus == null) heartsButton.click();
        };
      });
    };
  },500);

  setTimeout(()=>{
    if(pointsInterval) clearInterval(pointsInterval);
    if(heartsInterval) clearInterval(heartsInterval);
  },5000);

};

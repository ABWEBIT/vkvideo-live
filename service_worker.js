
const vkliveSite = new RegExp(/^(https:\/\/)live\.vkvideo\.ru/);
const vkliveStream = new RegExp(/^(https:\/\/)live\.vkvideo\.ru\/([-a-zA-Z0-9%_&.]*?)$/);

const vkliveKeys = [
  { key: 'vklivePointsKey', value: 'on' },
  { key: 'vkliveHeartsKey', value: 'on' },
  { key: 'vkliveRecommendationsKey', value: 'off' },
  { key: 'vklivePortalKey', value: 'off' },
  { key: 'vkliveUnfixedKey', value: 'off' }
];

Promise.all(vkliveKeys.map(({key,value}) =>
  chrome.storage.local.get([key]).then((r) => {
    if(r[key] == null) chrome.storage.local.set({[key]:value});
  })
));

function vkliveFunc(dUrl,dTab){
  if(vkliveSite.test(dUrl) === true){
    chrome.scripting.executeScript({
      target: {tabId: dTab},
      func: vkliveSiteHelper
    });
  };

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

function vkliveSiteHelper(){

  // нефиксированная ширина
  let app = document.querySelector('[class*="App_appChannelPage"]');
  async function appStyle(){
    try{
      let r = await chrome.storage.local.get(['vkliveUnfixedKey']);
      if(r.vkliveUnfixedKey === 'on'){
        app.style.setProperty('min-width', '100%', 'important');
      }
    }
    catch(error){console.error(error)}
  };
  if(app && !app.style.minWidth) appStyle();

  // скрыть рекомендации
  let recommendations = document.querySelector('[class*="ChannelsRecommendations_root"]');
  async function recommendationsStyle(){
    try{
      let r = await chrome.storage.local.get(['vkliveRecommendationsKey']);
      if(r.vkliveRecommendationsKey === 'on'){
        recommendations.style.setProperty('display','none','important');
        let delimiter = document.querySelector('[class*="Channels_delimiter"]');
        if(delimiter) delimiter.style.setProperty('display','none','important');
      }
    }
    catch(error){console.error(error)}
  };
  if(recommendations && !recommendations.style.display) recommendationsStyle();

  // скрыть портал
  let portal = document.querySelector('[class*="ChannelsPortalButton_root"]');
  async function portalStyle(){
    try{
      let r = await chrome.storage.local.get(['vklivePortalKey']);
      if(r.vklivePortalKey === 'on'){
        document.querySelector('[class*="ChannelsPortalButton_root"]').style.setProperty('display','none','important');
      }
    }
    catch(error){console.error(error)}
  };
  if(portal && !portal.style.display) portalStyle();

  let channelsRoot = document.querySelector('[class*="Channels_root"]');
  let observerChannels = new MutationObserver((m) => {
    m.forEach((mutation) => {
      if(mutation.type === 'attributes') portalStyle();
    });
  });
  observerChannels.observe(channelsRoot,{attributes:true});

};

function vkliveStreamHelper(){
  // баллы
  let pointsInterval = setInterval(()=>{
    let pointsButton = document.querySelector('[class*="PointActions_root"]');
    if(pointsButton){
      if(pointsInterval) clearInterval(pointsInterval);

      chrome.storage.local.get(['vklivePointsKey']).then((r)=>{
        if(r.vklivePointsKey === 'on'){
          let pointsCollecting=()=>{
            let bonus = document.querySelector('[class*="PointActions_buttonBonus"]');
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
